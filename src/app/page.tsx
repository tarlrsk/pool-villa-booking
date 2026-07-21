'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BookingCalendar, { DayRate, CustomPeriod, PriceBreakdown, dateToStr, localDate } from '@/components/BookingCalendar'
import { useLiff } from './LiffProvider'
import { CalendarDays, RotateCcw } from 'lucide-react'
import LoadingScreen from '@/components/LoadingScreen'
import { DAY_HEADERS, fmtDayShort, fmtDayLong, fmtMonthShort } from '@/lib/date-format'

interface Selection {
  checkin: string
  checkout: string
  total: number
  nights: number
  breakdown: PriceBreakdown[]
}

function formatHeaderDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = localDate(dateStr)
  return `${fmtDayShort(d)}, ${d.getDate()} ${fmtMonthShort(d)}`
}

export default function HomePage() {
  const router = useRouter()
  const { ready } = useLiff()

  const [loading, setLoading] = useState(true)
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [dayRates, setDayRates] = useState<DayRate[]>([])
  const [customPeriods, setCustomPeriods] = useState<CustomPeriod[]>([])

  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)

  const unavailableSet = new Set(unavailableDates)
  const dayRateMap = new Map(dayRates.map(r => [r.day, r.price]))

  useEffect(() => {
    const today = new Date()
    const from = dateToStr(today)
    const future = new Date(today)
    future.setMonth(future.getMonth() + 7)
    const to = dateToStr(future)

    fetch(`/api/pricing-data?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => {
        setUnavailableDates(d.unavailableDates ?? [])
        setDayRates(d.dayRates ?? [])
        setCustomPeriods(d.customPeriods ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function getPriceForDate(dateStr: string): number {
    const custom = customPeriods.find(p => dateStr >= p.startDate && dateStr < p.endDate)
    if (custom) return custom.price
    const d = localDate(dateStr)
    return dayRateMap.get(fmtDayLong(d)) ?? 0
  }

  function getDescriptionForDate(dateStr: string): string {
    const custom = customPeriods.find(p => dateStr >= p.startDate && dateStr < p.endDate)
    if (custom) return custom.description
    return fmtDayLong(localDate(dateStr))
  }

  function handleDateClick(dateStr: string) {
    if (!start || end) {
      setStart(dateStr); setEnd(null); setHover(null); setSelection(null); return
    }

    const lo = start <= dateStr ? start : dateStr
    const hi = start <= dateStr ? dateStr : start

    if (lo === hi) { setStart(dateStr); setEnd(null); setSelection(null); return }

    // Check for blocked dates in range
    const cur = localDate(lo)
    cur.setDate(cur.getDate() + 1)
    while (cur < localDate(hi)) {
      if (unavailableSet.has(dateToStr(cur))) {
        setStart(dateStr); setEnd(null); setSelection(null); return
      }
      cur.setDate(cur.getDate() + 1)
    }

    setStart(lo); setEnd(hi)

    // Build breakdown
    const breakdown: PriceBreakdown[] = []
    const c = localDate(lo)
    while (c < localDate(hi)) {
      const s = dateToStr(c)
      breakdown.push({ date: s, price: getPriceForDate(s), description: getDescriptionForDate(s) })
      c.setDate(c.getDate() + 1)
    }
    const total = breakdown.reduce((sum, b) => sum + b.price, 0)
    setSelection({ checkin: lo, checkout: hi, total, nights: breakdown.length, breakdown })
  }

  if (!ready || loading) return <LoadingScreen />

  return (
    <div className="md:bg-gray-100 md:min-h-screen md:flex md:items-start md:justify-center md:py-10">
    <div className="flex flex-col h-screen md:h-auto md:max-h-[90vh] md:w-full md:max-w-md md:rounded-3xl md:shadow-2xl md:overflow-hidden bg-white overflow-hidden">

      {/* ── Fixed Header ── */}
      <div className="shrink-0 bg-white z-10 border-b border-gray-100">
        {/* Title */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="font-semibold text-gray-800">Pool Villa</h1>
          <button
            onClick={() => router.push('/my-bookings')}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            <CalendarDays size={15} />
            การจองของฉัน
          </button>
        </div>

        {/* Check-in / Check-out */}
        <div className="flex items-center px-6 pb-3 gap-3">
          <div className="flex-1 text-center">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">เช็คอิน</p>
            <p className={`text-lg font-bold mt-0.5 ${start ? 'text-gray-900' : 'text-gray-300'}`}>
              {formatHeaderDate(start)}
            </p>
          </div>
          <div className="text-gray-300 text-lg">→</div>
          <div className="flex-1 text-center">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">เช็คเอาท์</p>
            <p className={`text-lg font-bold mt-0.5 ${end ? 'text-gray-900' : 'text-gray-300'}`}>
              {formatHeaderDate(end)}
            </p>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-1 pb-2">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium">{d}</div>
          ))}
        </div>
      </div>

      {/* ── Scrollable Calendar ── */}
      <div className="flex-1 overflow-y-auto">
        <BookingCalendar
          unavailableDates={unavailableDates}
          dayRates={dayRates}
          customPeriods={customPeriods}
          start={start}
          end={end}
          hover={hover}
          onDateClick={handleDateClick}
          onDateHover={setHover}
          monthCount={6}
        />
      </div>

      {/* ── Fixed Footer ── */}
      <div
        className="shrink-0 bg-white border-t border-gray-100 px-4 pt-3"
        style={{ paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setStart(null); setEnd(null); setSelection(null) }}
            className="flex items-center gap-1 text-sm text-gray-400 font-medium py-4 px-1 shrink-0 hover:text-gray-600 transition"
          >
            <RotateCcw size={15} />
            รีเซ็ต
          </button>
          <button
            onClick={() =>
              selection &&
              router.push(
                `/booking?checkin=${selection.checkin}&checkout=${selection.checkout}&total=${selection.total}&nights=${selection.nights}`
              )
            }
            disabled={!selection}
            className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-semibold text-base transition"
          >
            {selection
              ? `ตกลง (${selection.nights} คืน · ฿${selection.total.toLocaleString()})`
              : 'เลือกวันที่ก่อน'}
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}
