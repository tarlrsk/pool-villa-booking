import { NextRequest, NextResponse } from 'next/server'
import { getDayRates, getCustomPeriods, getUnavailableDates } from '@/lib/google-sheets'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') ?? new Date().toISOString().split('T')[0]
  const to = searchParams.get('to') ?? (() => {
    const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]
  })()

  const [dayRates, customPeriods, unavailableDates] = await Promise.all([
    getDayRates(),
    getCustomPeriods(),
    getUnavailableDates(from, to),
  ])

  return NextResponse.json({ dayRates, customPeriods, unavailableDates })
}
