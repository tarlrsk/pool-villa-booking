import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLiff } from '@/providers/LiffProvider'
import PageShell from '@/components/PageShell'
import PageHeader from '@/components/PageHeader'
import { apiUrl } from '@/lib/api'

const MAX_GUESTS = 8

export default function BookingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { liff } = useLiff()

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
      const token = liff?.getIDToken()
      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone, checkin, checkout, guests, notes }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'เกิดข้อผิดพลาด'); return }
      navigate(`/confirmation?bookingId=${data.booking.id}`)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <PageHeader title="ข้อมูลการจอง" onBack={() => navigate(-1)} />
      <div className="px-4 py-6 space-y-6">

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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนผู้เข้าพัก</label>
            <select
              value={guests}
              onChange={e => setGuests(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map(n => (
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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium disabled:cursor-not-allowed hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
          </button>
        </form>

      </div>
    </PageShell>
  )
}
