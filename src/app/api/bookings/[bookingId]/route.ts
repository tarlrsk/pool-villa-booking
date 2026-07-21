import { NextRequest, NextResponse } from 'next/server'
import { updateBookingStatus } from '@/lib/google-sheets'
import { BookingStatus } from '@/lib/types'

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ bookingId: string }> }) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { bookingId } = await params
  const body = await req.json()
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await updateBookingStatus(bookingId, status)
  if (!updated) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
