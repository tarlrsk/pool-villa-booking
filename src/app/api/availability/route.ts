import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability, getUnavailableDates } from '@/lib/google-sheets'
import { calculatePrice } from '@/lib/pricing'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const checkin = searchParams.get('checkin')
  const checkout = searchParams.get('checkout')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Return unavailable dates for a month range (for calendar highlighting)
  if (from && to) {
    const dates = await getUnavailableDates(from, to)
    return NextResponse.json({ unavailableDates: dates })
  }

  // Check specific range + calculate price
  if (!checkin || !checkout) {
    return NextResponse.json({ error: 'checkin and checkout are required' }, { status: 400 })
  }

  if (checkin >= checkout) {
    return NextResponse.json({ error: 'checkout must be after checkin' }, { status: 400 })
  }

  const [availability, price] = await Promise.all([
    checkAvailability(checkin, checkout),
    calculatePrice(checkin, checkout),
  ])

  return NextResponse.json({ ...availability, price })
}
