import { format } from 'date-fns'

// Jan 1 2023 was a Sunday — use it to generate the ordered day header row
export const DAY_HEADERS = Array.from({ length: 7 }, (_, i) =>
  format(new Date(2023, 0, i + 1), 'EEE')  // "Sun", "Mon", … "Sat"
)

export const fmtDayShort  = (d: Date) => format(d, 'EEE')   // "Mon"
export const fmtDayLong   = (d: Date) => format(d, 'EEEE')  // "Monday"  ← used for pricing key
export const fmtMonthShort = (d: Date) => format(d, 'MMM')  // "Jan"
export const fmtMonthLong  = (d: Date) => format(d, 'MMMM') // "January"

// Unambiguous charset — excludes 0/O and 1/I to avoid confusion
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateBookingId(): string {
  const now = new Date()
  const datePart = format(now, 'yyMMdd')
  const random = Array.from({ length: 6 }, () =>
    CHARSET[Math.floor(Math.random() * CHARSET.length)]
  ).join('')
  return `BK${datePart}-${random}`
}
