import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from '@/lib/api'
import { setAdminToken } from '@/lib/adminAuth'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'เข้าสู่ระบบไม่สำเร็จ'); return }
      setAdminToken(data.token)
      navigate('/admin/bookings')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-lg font-semibold text-gray-800 text-center">De&apos;Day Admin</h1>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium disabled:cursor-not-allowed hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}
