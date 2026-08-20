import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminShell from '@/components/admin/AdminShell'
import { useToast } from '@/components/admin/ToastProvider'
import { adminFetch, AdminAuthError } from '@/lib/adminApi'
import type { Booking, BookingStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminBookingsPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : ''
      const data = await adminFetch<{ bookings: Booking[] }>(`/api/admin/bookings${qs}`)
      setBookings(data.bookings ?? [])
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      setError('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, navigate])

  useEffect(() => { load() }, [load])

  async function handleStatusChange(bookingId: string, status: BookingStatus) {
    setUpdatingId(bookingId)
    try {
      await adminFetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status } : b)))
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      notify('อัปเดตสถานะไม่สำเร็จ')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">การจอง</h2>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === opt.value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">รหัส</th>
                <th className="px-4 py-3 font-medium">ผู้จอง</th>
                <th className="px-4 py-3 font-medium">โทร</th>
                <th className="px-4 py-3 font-medium">เช็คอิน</th>
                <th className="px-4 py-3 font-medium">เช็คเอาท์</th>
                <th className="px-4 py-3 font-medium">ผู้เข้าพัก</th>
                <th className="px-4 py-3 font-medium">ราคารวม</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">กำลังโหลด...</td></tr>
              )}
              {!loading && bookings.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">ไม่มีการจอง</td></tr>
              )}
              {!loading && bookings.map(b => (
                <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-600">{b.id}</td>
                  <td className="px-4 py-3 text-gray-800">{b.displayName || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{b.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{b.checkin}</td>
                  <td className="px-4 py-3 text-gray-600">{b.checkout}</td>
                  <td className="px-4 py-3 text-gray-600">{b.guests}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">฿{b.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      disabled={updatingId === b.id}
                      onChange={e => handleStatusChange(b.id, e.target.value as BookingStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 ${STATUS_STYLES[b.status]}`}
                    >
                      <option value="pending">รอยืนยัน</option>
                      <option value="confirmed">ยืนยันแล้ว</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
