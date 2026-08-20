import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminShell from '@/components/admin/AdminShell'
import AdminBlockedDatesCalendar from '@/components/admin/AdminBlockedDatesCalendar'
import { useToast } from '@/components/admin/ToastProvider'
import { useConfirm } from '@/components/admin/useConfirm'
import { usePrompt } from '@/components/admin/usePrompt'
import { adminFetch, AdminAuthError } from '@/lib/adminApi'
import type { BlockedDate } from '@/lib/types'

export default function AdminBlockedDatesPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const { ask, dialog: promptDialog } = usePrompt()
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminFetch<{ blockedDates: BlockedDate[] }>('/api/admin/blocked-dates')
      setBlockedDates(data.blockedDates ?? [])
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      setError('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { load() }, [load])

  async function handleToggleDate(dateStr: string, existing: BlockedDate | undefined) {
    try {
      if (existing) {
        const ok = await confirm(`เปิดวันที่ ${dateStr} ให้จองได้อีกครั้ง?`)
        if (!ok) return
        await adminFetch(`/api/admin/blocked-dates/${existing.id}`, { method: 'DELETE' })
        setBlockedDates(prev => prev.filter(b => b.id !== existing.id))
      } else {
        const reason = await ask({
          title: `ปิดวันที่ ${dateStr}`,
          message: 'เหตุผลที่ปิดวันที่นี้ (ถ้ามี)',
          placeholder: 'เช่น ปิดปรับปรุง',
          confirmLabel: 'ปิดวันที่',
        })
        if (reason === null) return
        const data = await adminFetch<{ blockedDate: BlockedDate }>('/api/admin/blocked-dates', {
          method: 'POST',
          body: JSON.stringify({ date: dateStr, reason }),
        })
        setBlockedDates(prev => [...prev, data.blockedDate])
      }
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      notify('ดำเนินการไม่สำเร็จ')
    }
  }

  const sorted = [...blockedDates].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <AdminShell>
      {confirmDialog}
      {promptDialog}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">ปฏิทินวันที่ปิด</h2>
          <p className="text-xs text-gray-400 mb-4">คลิกวันที่เพื่อปิด/เปิดให้จอง</p>
          {loading ? (
            <p className="text-gray-400 text-sm">กำลังโหลด...</p>
          ) : (
            <AdminBlockedDatesCalendar blockedDates={blockedDates} onToggleDate={handleToggleDate} />
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-5 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">รายการวันที่ปิด</h2>
          {!loading && sorted.length === 0 && <p className="text-gray-400 text-sm">ยังไม่มีวันที่ปิด</p>}
          <ul className="space-y-2">
            {sorted.map(b => (
              <li key={b.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 pb-2">
                <div>
                  <p className="text-gray-800 font-medium">{b.date}</p>
                  {b.reason && <p className="text-gray-400 text-xs">{b.reason}</p>}
                </div>
                <button onClick={() => handleToggleDate(b.date, b)} className="text-red-500 hover:underline text-xs shrink-0">
                  เปิด
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminShell>
  )
}
