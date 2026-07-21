'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Props {
  onRangeChange: (checkin: Date | null, checkout: Date | null) => void
  unavailableDates?: string[]
}

export default function DateRangePicker({ onRangeChange, unavailableDates = [] }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const unavailableSet = new Set(unavailableDates)

  function isDateUnavailable(date: Date): boolean {
    const str = date.toISOString().split('T')[0]
    return unavailableSet.has(str)
  }

  function handleChange(dates: [Date | null, Date | null]) {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    onRangeChange(start, end)
  }

  return (
    <div className="flex justify-center">
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        inline
        minDate={new Date()}
        filterDate={date => !isDateUnavailable(date)}
        monthsShown={2}
        calendarClassName="text-sm"
      />
    </div>
  )
}
