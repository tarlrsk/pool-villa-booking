import { google } from 'googleapis'
import { Booking, BookingStatus, DayRate, CustomPeriod } from './types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

async function getSheets() {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!

// ── Bookings ──────────────────────────────────────────────────────────────────

function rowToBooking(row: string[]): Booking {
  return {
    id: row[0],
    lineUserId: row[1],
    displayName: row[2],
    phone: row[3],
    checkin: row[4],
    checkout: row[5],
    guests: parseInt(row[6] ?? '1'),
    totalPrice: parseFloat(row[7] ?? '0'),
    status: (row[8] ?? 'pending') as BookingStatus,
    createdAt: row[9] ?? '',
    notes: row[10] ?? '',
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Bookings!A2:K',
  })
  return (res.data.values ?? []).map(rowToBooking)
}

export async function getUserBookings(lineUserId: string): Promise<Booking[]> {
  const all = await getAllBookings()
  return all.filter(b => b.lineUserId === lineUserId)
}

export async function createBooking(data: Omit<Booking, 'createdAt'>): Promise<Booking> {
  const sheets = await getSheets()
  const createdAt = new Date().toISOString()
  const row = [
    data.id,
    data.lineUserId,
    data.displayName,
    data.phone,
    data.checkin,
    data.checkout,
    data.guests,
    data.totalPrice,
    data.status,
    createdAt,
    data.notes,
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Bookings!A:K',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
  return { ...data, createdAt }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Bookings!A2:A',
  })
  const rows = res.data.values ?? []
  const rowIndex = rows.findIndex(r => r[0] === bookingId)
  if (rowIndex === -1) return false

  const sheetRow = rowIndex + 2 // 1-indexed + header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Bookings!I${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  })
  return true
}

// ── Blocked Dates ─────────────────────────────────────────────────────────────

export async function getBlockedDates(): Promise<string[]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Blocked Dates!A2:A',
  })
  return (res.data.values ?? []).map(r => r[0]).filter(Boolean)
}

export async function addBlockedDate(date: string, reason: string): Promise<void> {
  const sheets = await getSheets()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Blocked Dates!A:B',
    valueInputOption: 'RAW',
    requestBody: { values: [[date, reason]] },
  })
}

// ── Availability ──────────────────────────────────────────────────────────────

export async function checkAvailability(checkin: string, checkout: string): Promise<{ available: boolean; reason?: string }> {
  const [bookings, blockedDates] = await Promise.all([getAllBookings(), getBlockedDates()])

  const start = new Date(checkin)
  const end = new Date(checkout)

  // Check blocked dates
  const cur = new Date(start)
  while (cur < end) {
    const dateStr = cur.toISOString().split('T')[0]
    if (blockedDates.includes(dateStr)) {
      return { available: false, reason: 'Date is blocked by owner' }
    }
    cur.setDate(cur.getDate() + 1)
  }

  // Check existing bookings (overlap: existing.checkin < checkout AND existing.checkout > checkin)
  const conflict = bookings.find(b =>
    (b.status === 'pending' || b.status === 'confirmed') &&
    b.checkin < checkout &&
    b.checkout > checkin
  )
  if (conflict) {
    return { available: false, reason: 'Dates are already booked' }
  }

  return { available: true }
}

// ── Day Rates ─────────────────────────────────────────────────────────────────

export async function getDayRates(): Promise<DayRate[]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Day Rates!A2:B',
  })
  return (res.data.values ?? []).map(r => ({
    day: r[0],
    price: parseFloat(r[1] ?? '0'),
  }))
}

// ── Custom Periods ────────────────────────────────────────────────────────────

export async function getCustomPeriods(): Promise<CustomPeriod[]> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Custom Periods!A2:D',
  })
  return (res.data.values ?? []).map(r => ({
    startDate: r[0],
    endDate: r[1],
    price: parseFloat(r[2] ?? '0'),
    description: r[3] ?? '',
  }))
}

// ── Available Dates for Calendar ──────────────────────────────────────────────
// Returns a set of unavailable dates (YYYY-MM-DD) for the given month range

export async function getUnavailableDates(fromDate: string, toDate: string): Promise<string[]> {
  const [bookings, blockedDates] = await Promise.all([getAllBookings(), getBlockedDates()])

  const unavailable = new Set<string>(blockedDates)

  for (const b of bookings) {
    if (b.status !== 'pending' && b.status !== 'confirmed') continue
    const start = new Date(b.checkin)
    const end = new Date(b.checkout)
    const cur = new Date(start)
    while (cur < end) {
      const d = cur.toISOString().split('T')[0]
      if (d >= fromDate && d <= toDate) unavailable.add(d)
      cur.setDate(cur.getDate() + 1)
    }
  }

  return Array.from(unavailable)
}
