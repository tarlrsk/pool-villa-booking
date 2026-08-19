import { fmtMonthLong } from '@/lib/date-format'
import type { BlockedDate } from '@/lib/types'

interface Props {
  blockedDates: BlockedDate[]
  onToggleDate: (dateStr: string, existing: BlockedDate | undefined) => void
  monthCount?: number
}

function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminBlockedDatesCalendar({ blockedDates, onToggleDate, monthCount = 3 }: Props) {
  const todayStr = dateToStr(new Date())
  const blockedMap = new Map(blockedDates.map(b => [b.date, b]))

  const today = new Date()
  const months = Array.from({ length: monthCount }, (_, i) => new Date(today.getFullYear(), today.getMonth() + i, 1))

  function renderMonth(monthDate: Date) {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const cells: React.ReactNode[] = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} className="h-11" />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isPast = dateStr < todayStr
      const blocked = blockedMap.get(dateStr)

      cells.push(
        <button
          key={dateStr}
          disabled={isPast}
          onClick={() => onToggleDate(dateStr, blocked)}
          title={blocked?.reason || undefined}
          className={[
            'h-11 w-11 mx-auto flex items-center justify-center rounded-full text-sm transition-colors',
            isPast ? 'text-gray-200 cursor-not-allowed'
              : blocked ? 'bg-red-100 text-red-700 font-semibold hover:bg-red-200'
              : 'text-gray-700 hover:bg-gray-100',
          ].join(' ')}
        >
          {d}
        </button>
      )
    }

    return (
      <div key={`${year}-${month}`} className="mb-6">
        <p className="text-center text-sm font-semibold text-gray-500 py-2">{fmtMonthLong(monthDate)} {year}</p>
        <div className="grid grid-cols-7 gap-y-1">{cells}</div>
      </div>
    )
  }

  return <div>{months.map(renderMonth)}</div>
}
