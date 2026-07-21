'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLiff } from '../LiffProvider'

function BookingForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { liff, loggedIn } = useLiff()

  const checkin = params.get('checkin') ?? ''
  const checkout = params.get('checkout') ?? ''
  const total = parseInt(params.get('total') ?? '0')
  const nights = parseInt(params.get('nights') ?? '0')

  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(2)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = liff?.getIDToken() ?? ''
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, checkin, checkout, guests, notes }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'เกิดข้อผิดพลาด')
        return
      }

      router.push(`/confirmation?bookingId=${data.booking.id}`)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  if (!loggedIn && process.env.NEXT_PUBLIC_LIFF_ID) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">กำลังเข้าสู่ระบบ LINE...</p>
      </div>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <button onClick={() => router.back()} className="text-indigo-600 text-sm">← ย้อนกลับ</button>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-800">ข้อมูลการจอง</h1>
        <p className="text-sm text-gray-500">กรอกข้อมูลเพื่อยืนยันการจอง</p>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">เช็คอิน</span>
          <span className="font-medium">{checkin}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">เช็คเอาท์</span>
          <span className="font-medium">{checkout}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">จำนวนคืน</span>
          <span className="font-medium">{nights} คืน</span>
        </div>
        <div className="flex justify-between font-bold pt-1 border-t border-indigo-200">
          <span>ราคารวม</span>
          <span className="text-indigo-600">฿{total.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            placeholder="08X-XXX-XXXX"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้เข้าพัก</label>
          <select
            value={guests}
            onChange={e => setGuests(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n} คน</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ถ้ามี)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="เช่น ต้องการเตียงเสริม, มาพร้อมสัตว์เลี้ยง..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
        >
          {loading ? 'กำลังจอง...' : 'ยืนยันการจอง'}
        </button>
      </form>
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-400">กำลังโหลด...</p></div>}>
      <BookingForm />
    </Suspense>
  )
}
