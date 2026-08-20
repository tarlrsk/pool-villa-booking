import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminShell from '@/components/admin/AdminShell'
import { useToast } from '@/components/admin/ToastProvider'
import { useConfirm } from '@/components/admin/useConfirm'
import { adminFetch, AdminAuthError } from '@/lib/adminApi'
import type { DayRate, CustomPeriod } from '@/lib/types'

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_LABELS: Record<string, string> = {
  Monday: 'จันทร์', Tuesday: 'อังคาร', Wednesday: 'พุธ', Thursday: 'พฤหัสบดี',
  Friday: 'ศุกร์', Saturday: 'เสาร์', Sunday: 'อาทิตย์',
}

const EMPTY_PERIOD_FORM = { startDate: '', endDate: '', price: '', description: '' }

export default function AdminPricingPage() {
  const navigate = useNavigate()
  const notify = useToast()
  const { confirm, dialog: confirmDialog } = useConfirm()
  const [dayRates, setDayRates] = useState<Record<string, string>>({})
  const [savingRates, setSavingRates] = useState(false)
  const [ratesSaved, setRatesSaved] = useState(false)

  const [periods, setPeriods] = useState<CustomPeriod[]>([])
  const [periodForm, setPeriodForm] = useState(EMPTY_PERIOD_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [savingPeriod, setSavingPeriod] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ratesData, periodsData] = await Promise.all([
        adminFetch<{ dayRates: DayRate[] }>('/api/admin/day-rates'),
        adminFetch<{ customPeriods: CustomPeriod[] }>('/api/admin/custom-periods'),
      ])
      const rateMap: Record<string, string> = {}
      for (const r of ratesData.dayRates ?? []) rateMap[r.day] = String(r.price)
      setDayRates(rateMap)
      setPeriods(periodsData.customPeriods ?? [])
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      setError('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { load() }, [load])

  async function handleSaveRates(e: React.FormEvent) {
    e.preventDefault()
    setSavingRates(true)
    setRatesSaved(false)
    try {
      const payload = DAY_ORDER.map(day => ({ day, price: Number(dayRates[day] ?? 0) }))
      await adminFetch('/api/admin/day-rates', { method: 'PUT', body: JSON.stringify(payload) })
      setRatesSaved(true)
      setTimeout(() => setRatesSaved(false), 2000)
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      notify('บันทึกราคาไม่สำเร็จ')
    } finally {
      setSavingRates(false)
    }
  }

  function startEdit(p: CustomPeriod) {
    setEditingId(p.id)
    setPeriodForm({ startDate: p.startDate, endDate: p.endDate, price: String(p.price), description: p.description })
  }

  function cancelEdit() {
    setEditingId(null)
    setPeriodForm(EMPTY_PERIOD_FORM)
  }

  async function handleSubmitPeriod(e: React.FormEvent) {
    e.preventDefault()
    if (!periodForm.startDate || !periodForm.endDate) return
    setSavingPeriod(true)
    try {
      const body = JSON.stringify({
        startDate: periodForm.startDate,
        endDate: periodForm.endDate,
        price: Number(periodForm.price || 0),
        description: periodForm.description,
      })
      if (editingId != null) {
        await adminFetch(`/api/admin/custom-periods/${editingId}`, { method: 'PUT', body })
      } else {
        await adminFetch('/api/admin/custom-periods', { method: 'POST', body })
      }
      cancelEdit()
      const data = await adminFetch<{ customPeriods: CustomPeriod[] }>('/api/admin/custom-periods')
      setPeriods(data.customPeriods ?? [])
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      notify('บันทึกช่วงราคาพิเศษไม่สำเร็จ')
    } finally {
      setSavingPeriod(false)
    }
  }

  async function handleDeletePeriod(id: number) {
    const ok = await confirm({ message: 'ลบช่วงราคาพิเศษนี้?', confirmLabel: 'ลบ', danger: true })
    if (!ok) return
    try {
      await adminFetch(`/api/admin/custom-periods/${id}`, { method: 'DELETE' })
      setPeriods(prev => prev.filter(p => p.id !== id))
      if (editingId === id) cancelEdit()
    } catch (err) {
      if (err instanceof AdminAuthError) { navigate('/admin/login'); return }
      notify('ลบไม่สำเร็จ')
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <p className="text-gray-400 text-sm">กำลังโหลด...</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      {confirmDialog}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Day rates */}
      <section className="bg-white rounded-2xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ราคาตามวัน</h2>
        <form onSubmit={handleSaveRates}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {DAY_ORDER.map(day => (
              <div key={day}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{DAY_LABELS[day]}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">฿</span>
                  <input
                    type="number"
                    min={0}
                    value={dayRates[day] ?? ''}
                    onChange={e => setDayRates(prev => ({ ...prev, [day]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingRates}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
            >
              {savingRates ? 'กำลังบันทึก...' : 'บันทึกราคา'}
            </button>
            {ratesSaved && <span className="text-green-600 text-sm">บันทึกแล้ว</span>}
          </div>
        </form>
      </section>

      {/* Custom periods */}
      <section className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ช่วงราคาพิเศษ</h2>

        <form onSubmit={handleSubmitPeriod} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">เริ่ม</label>
            <input
              type="date"
              required
              value={periodForm.startDate}
              onChange={e => setPeriodForm(f => ({ ...f, startDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">สิ้นสุด</label>
            <input
              type="date"
              required
              value={periodForm.endDate}
              onChange={e => setPeriodForm(f => ({ ...f, endDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ราคา/คืน</label>
            <input
              type="number"
              min={0}
              value={periodForm.price}
              onChange={e => setPeriodForm(f => ({ ...f, price: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">คำอธิบาย</label>
            <input
              type="text"
              placeholder="เช่น เทศกาลปีใหม่"
              value={periodForm.description}
              onChange={e => setPeriodForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingPeriod}
              className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700 transition"
            >
              {editingId != null ? 'บันทึก' : 'เพิ่ม'}
            </button>
            {editingId != null && (
              <button type="button" onClick={cancelEdit} className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition">
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-3 py-2 font-medium">เริ่ม</th>
                <th className="px-3 py-2 font-medium">สิ้นสุด</th>
                <th className="px-3 py-2 font-medium">ราคา/คืน</th>
                <th className="px-3 py-2 font-medium">คำอธิบาย</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {periods.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">ยังไม่มีช่วงราคาพิเศษ</td></tr>
              )}
              {periods.map(p => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-600">{p.startDate}</td>
                  <td className="px-3 py-2 text-gray-600">{p.endDate}</td>
                  <td className="px-3 py-2 text-gray-800 font-medium">฿{p.price.toLocaleString()}</td>
                  <td className="px-3 py-2 text-gray-600">{p.description || '—'}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(p)} className="text-indigo-600 hover:underline mr-3">แก้ไข</button>
                    <button onClick={() => handleDeletePeriod(p.id)} className="text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}
