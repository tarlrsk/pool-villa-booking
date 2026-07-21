'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BookingCard from '@/components/BookingCard'
import { useLiff } from '../LiffProvider'
import { Booking } from '@/lib/types'

export default function MyBookingsPage() {
  const router = useRouter()
  const { liff, ready, loggedIn } = useLiff()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!loggedIn && process.env.NEXT_PUBLIC_LIFF_ID) return

    const token = liff?.getIDToken() ?? 'dev-token'
    fetch('/api/user/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setBookings(d.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ready, loggedIn, liff])

  const sorted = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="min-h-screen bg-white md:bg-gray-100 md:flex md:justify-center md:py-10">
    <main className="w-full md:max-w-md md:rounded-3xl md:shadow-2xl md:bg-white md:overflow-hidden px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-indigo-600 text-sm">← กลับ</button>
        <h1 className="text-xl font-bold text-gray-800">การจองของฉัน</h1>
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-sm py-8">กำลังโหลด...</p>
      )}

      {!loading && sorted.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📋</p>
          <p className="text-gray-500">ยังไม่มีการจอง</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 text-sm font-medium"
          >
            จองเลย →
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sorted.map(b => (
          <BookingCard key={b.id} booking={b} />
        ))}
      </div>
    </main>
    </div>
  )
}
