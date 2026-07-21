'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarX2 } from 'lucide-react'
import { useLiff } from '../LiffProvider'
import { Booking } from '@/lib/types'
import BookingCard from '@/components/BookingCard'
import PageShell from '@/components/PageShell'
import PageHeader from '@/components/PageHeader'
import LoadingScreen from '@/components/LoadingScreen'

export default function MyBookingsPage() {
  const router = useRouter()
  const { liff, ready, loggedIn } = useLiff()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!loggedIn && process.env.NEXT_PUBLIC_LIFF_ID) return
    const token = liff?.getIDToken()
    fetch('/api/user/bookings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setBookings(d.bookings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ready, loggedIn, liff])

  if (!ready) return <LoadingScreen />

  const sorted = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <PageShell>
      <PageHeader title="การจองของฉัน" onBack={() => router.push('/')} />
      <div className="px-4 py-6 space-y-4">

        {loading && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">กำลังโหลด...</p>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <CalendarX2 size={56} className="text-gray-300 mx-auto" />
            <p className="text-gray-500">ยังไม่มีการจอง</p>
            <button onClick={() => router.push('/')} className="text-indigo-600 text-sm font-medium">
              จองเลย →
            </button>
          </div>
        )}

        {sorted.map(b => <BookingCard key={b.id} booking={b} />)}

      </div>
    </PageShell>
  )
}
