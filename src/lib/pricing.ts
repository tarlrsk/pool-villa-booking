import { getDayRates, getCustomPeriods } from './google-sheets'
import { PriceBreakdown, PriceResult } from './types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function calculatePrice(checkin: string, checkout: string): Promise<PriceResult> {
  const [dayRates, customPeriods] = await Promise.all([getDayRates(), getCustomPeriods()])

  const dayRateMap = new Map(dayRates.map(r => [r.day, r.price]))
  const breakdown: PriceBreakdown[] = []

  const start = new Date(checkin)
  const end = new Date(checkout)
  const cur = new Date(start)

  while (cur < end) {
    const dateStr = cur.toISOString().split('T')[0]

    // Check custom periods first
    const custom = customPeriods.find(p => dateStr >= p.startDate && dateStr < p.endDate)

    if (custom) {
      breakdown.push({
        date: dateStr,
        price: custom.price,
        source: 'custom',
        description: custom.description,
      })
    } else {
      const dayName = DAY_NAMES[cur.getDay()]
      const price = dayRateMap.get(dayName) ?? 0
      breakdown.push({
        date: dateStr,
        price,
        source: 'day-rate',
        description: dayName,
      })
    }

    cur.setDate(cur.getDate() + 1)
  }

  const totalPrice = breakdown.reduce((sum, b) => sum + b.price, 0)

  return {
    totalPrice,
    nights: breakdown.length,
    breakdown,
  }
}
