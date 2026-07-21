'use client'

import { fmtDayLong, fmtMonthLong } from '@/lib/date-format'

export interface DayRate { day: string; price: number }
export interface CustomPeriod { startDate: string; endDate: string; price: number; description: string }
export interface PriceBreakdown { date: string; price: number; description: string }

interface Props {
  unavailableDates: string[]
  dayRates: DayRate[]
  customPeriods: CustomPeriod[]
  start: string | null
  end: string | null
  hover: string | null
  onDateClick: (dateStr: string) => void
  onDateHover: (dateStr: string | null) => void
  monthCount?: number
}

export function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function localDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function BookingCalendar({
  unavailableDates, dayRates, customPeriods,
  start, end, hover, onDateClick, onDateHover, monthCount = 6,
}: Props) {
  const todayStr = dateToStr(new Date())
  const unavailableSet = new Set(unavailableDates)
  const dayRateMap = new Map(dayRates.map(r => [r.day, r.price]))

  const rangeEnd = end ?? hover

  function getPriceForDate(dateStr: string): { price: number; description: string } {
    const custom = customPeriods.find(p => dateStr >= p.startDate && dateStr < p.endDate)
    if (custom) return { price: custom.price, description: custom.description }
    const d = localDate(dateStr)
    const dayName = fmtDayLong(d)
    return { price: dayRateMap.get(dayName) ?? 0, description: dayName }
  }

  function isDisabled(dateStr: string) {
    return dateStr < todayStr || unavailableSet.has(dateStr)
  }

  function isStart(d: string) { return d === start }
  function isEnd(d: string) { return !!end && d === end }
  function isInRange(d: string) {
    if (!start || !rangeEnd) return false
    const lo = start < rangeEnd ? start : rangeEnd
    const hi = start < rangeEnd ? rangeEnd : start
    return d > lo && d < hi
  }

  // Generate months to show
  const today = new Date()
  const months = Array.from({ length: monthCount }, (_, i) => {
    return new Date(today.getFullYear(), today.getMonth() + i, 1)
  })

  function renderMonth(monthDate: Date) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const cells: React.ReactNode[] = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} className="h-14" />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const disabled = isDisabled(dateStr)
      const isBooked = unavailableSet.has(dateStr)
      const sel = isStart(dateStr) || isEnd(dateStr)
      const inRange = isInRange(dateStr)
      const isStartDate = isStart(dateStr)
      const isEndDate = isEnd(dateStr)
      const isToday = dateStr === todayStr

      const { price } = (!disabled || isBooked) ? getPriceForDate(dateStr) : { price: 0 }
      const priceLabel = price >= 1000
        ? `${price % 1000 === 0 ? price / 1000 : (price / 1000).toFixed(1)}k`
        : price > 0 ? String(price) : ''

      const leftBg = inRange || isEndDate
      const rightBg = inRange || (isStartDate && !!rangeEnd)

      cells.push(
        <div key={dateStr} className="relative flex justify-center items-center h-14">
          {/* range strip */}
          {(leftBg || rightBg) && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-11 flex pointer-events-none">
              <div className={`flex-1 ${leftBg ? 'bg-indigo-50' : ''}`} />
              <div className={`flex-1 ${rightBg ? 'bg-indigo-50' : ''}`} />
            </div>
          )}

          <button
            onClick={() => onDateClick(dateStr)}
            onMouseEnter={() => onDateHover(dateStr)}
            onMouseLeave={() => onDateHover(null)}
            disabled={disabled}
            className={[
              'relative z-10 flex flex-col items-center justify-center rounded-full transition-colors',
              'w-11 h-11',
              disabled ? 'cursor-not-allowed'
                : sel ? 'bg-indigo-600 text-white'
                : inRange ? 'text-indigo-700'
                : 'text-gray-800 active:bg-gray-100',
              isToday && !sel ? 'ring-2 ring-indigo-400' : '',
            ].join(' ')}
          >
            <span className={[
              'text-base font-semibold leading-none',
              disabled ? (isBooked ? 'line-through text-gray-300' : 'text-gray-200') : '',
            ].join(' ')}>
              {d}
            </span>
            {!disabled && priceLabel && (
              <span className={`text-[10px] leading-none mt-0.5 font-normal ${sel ? 'text-indigo-200' : 'text-gray-400'}`}>
                {priceLabel}
              </span>
            )}
            {isBooked && (
              <span className="text-[9px] leading-none mt-0.5 text-gray-300">จอง</span>
            )}
          </button>
        </div>
      )
    }

    return (
      <div key={`${year}-${month}`} className="mb-6">
        <p className="text-center text-sm font-semibold text-gray-500 py-3">
          {fmtMonthLong(monthDate)} {year}
        </p>
        <div className="grid grid-cols-7">{cells}</div>
      </div>
    )
  }

  return (
    <div className="px-1">
      {months.map(m => renderMonth(m))}
      <div className="h-4" />
    </div>
  )
}
