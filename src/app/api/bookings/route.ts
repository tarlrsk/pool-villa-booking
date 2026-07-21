import { NextRequest, NextResponse } from 'next/server'
import { createBooking, checkAvailability } from '@/lib/google-sheets'
import { calculatePrice } from '@/lib/pricing'
import { verifyLineToken, extractBearerToken } from '@/lib/line-auth'
import { sendBookingConfirmation } from '@/lib/line-notify'
import { generateBookingId } from '@/lib/date-format'

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await verifyLineToken(token)
  if (!profile) {
    return NextResponse.json({ error: 'Invalid LINE token' }, { status: 401 })
  }

  const body = await req.json()
  const { phone, checkin, checkout, guests, notes } = body

  if (!phone || !checkin || !checkout || !guests) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (checkin >= checkout) {
    return NextResponse.json({ error: 'checkout must be after checkin' }, { status: 400 })
  }

  const availability = await checkAvailability(checkin, checkout)
  if (!availability.available) {
    return NextResponse.json({ error: availability.reason ?? 'Dates not available' }, { status: 409 })
  }

  const price = await calculatePrice(checkin, checkout)

  const booking = await createBooking({
    id: generateBookingId(),
    lineUserId: profile.userId,
    displayName: profile.displayName,
    phone,
    checkin,
    checkout,
    guests: parseInt(guests),
    totalPrice: price.totalPrice,
    status: 'pending',
    notes: notes ?? '',
  })

  // Fire-and-forget notification
  sendBookingConfirmation(booking).catch(console.error)

  return NextResponse.json({ booking, price }, { status: 201 })
}
