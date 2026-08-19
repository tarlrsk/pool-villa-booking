import { NavLink, useNavigate } from 'react-router-dom'
import { clearAdminToken } from '@/lib/adminAuth'

const NAV = [
  { to: '/admin/bookings', label: 'การจอง' },
  { to: '/admin/pricing', label: 'ราคา' },
  { to: '/admin/blocked-dates', label: 'วันที่ปิด' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  function handleLogout() {
    clearAdminToken()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-gray-800 shrink-0">De&apos;Day Admin</h1>

        <nav className="flex gap-1 overflow-x-auto">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 shrink-0 transition">
          ออกจากระบบ
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
