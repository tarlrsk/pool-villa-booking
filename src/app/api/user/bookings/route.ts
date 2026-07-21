import { NextRequest, NextResponse } from 'next/server'
import { getUserBookings } from '@/lib/google-sheets'
import { verifyLineToken, extractBearerToken } from '@/lib/line-auth'

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await verifyLineToken(token)
  if (!profile) {
    return NextResponse.json({ error: 'Invalid LINE token' }, { status: 401 })
  }

  const bookings = await getUserBookings(profile.userId)
  return NextResponse.json({ bookings })
}
