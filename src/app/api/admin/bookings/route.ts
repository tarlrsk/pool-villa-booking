import { NextRequest, NextResponse } from 'next/server'
import { getAllBookings } from '@/lib/google-sheets'

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await getAllBookings()
  return NextResponse.json({ bookings })
}
