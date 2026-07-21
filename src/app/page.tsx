'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DateRangePicker from '@/components/DateRangePicker'
import { useLiff } from './LiffProvider'

interface PriceResult {
  available: boolean
  reason?: string
  price?: {
    totalPrice: number
    nights: number
    breakdown: { date: string; price: number; description?: string }[]
  }
}

export default function HomePage() {
  const router = useRouter()
  const { ready } = useLiff()
  const [checkin, setCheckin] = useState<Date | null>(null)
  const [checkout, setCheckout] = useState<Date | null>(null)
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<PriceResult | null>(null)

  useEffect(() => {
    const today = new Date()
    const from = today.toISOString().split('T')[0]
    const future = new Date(today)
    future.setMonth(future.getMonth() + 3)
    const to = future.toISOString().split('T')[0]
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => setUnavailableDates(d.unavailableDates ?? []))
      .catch(() => {})
  }, [])

  async function handleRangeChange(start: Date | null, end: Date | null) {
    setCheckin(start)
    setCheckout(end)
    setResult(null)

    if (!start || !end) return

    const checkinStr = start.toISOString().split('T')[0]
    const checkoutStr = end.toISOString().split('T')[0]

    setChecking(true)
    try {
      const res = await fetch(`/api/availability?checkin=${checkinStr}&checkout=${checkoutStr}`)
      const data = await res.json()
      setResult(data)
    } finally {
      setChecking(false)
    }
  }

  function handleBook() {
    if (!checkin || !checkout || !result?.available) return
    const checkinStr = checkin.toISOString().split('T')[0]
    const checkoutStr = checkout.toISOString().split('T')[0]
    router.push(
      `/booking?checkin=${checkinStr}&checkout=${checkoutStr}&total=${result.price?.totalPrice}&nights=${result.price?.nights}`
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">กำลังโหลด...</p>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-800">Pool Villa</h1>
        <p className="text-gray-500 text-sm">เลือกวันที่ต้องการเข้าพัก</p>
      </div>

      <DateRangePicker onRangeChange={handleRangeChange} unavailableDates={unavailableDates} />

      {checking && (
        <p className="text-center text-sm text-gray-400">กำลังตรวจสอบ...</p>
      )}

      {result && !checking && (
        <div className={`rounded-2xl p-4 ${result.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {result.available && result.price ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-green-700 font-medium">✅ ว่างสำหรับช่วงนี้</p>
                <p className="text-sm text-gray-500">{result.price.nights} คืน</p>
              </div>
              <div className="space-y-1">
                {result.price.breakdown.map(b => (
                  <div key={b.date} className="flex justify-between text-sm text-gray-600">
                    <span>{b.date} ({b.description})</span>
                    <span>฿{b.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-indigo-600">฿{result.price.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-red-700">❌ {result.reason ?? 'ไม่ว่างในช่วงนี้'}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleBook}
          disabled={!result?.available || checking}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
        >
          จองเลย
        </button>
        <button
          onClick={() => router.push('/my-bookings')}
          className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm"
        >
          การจองของฉัน
        </button>
      </div>
    </main>
  )
}
