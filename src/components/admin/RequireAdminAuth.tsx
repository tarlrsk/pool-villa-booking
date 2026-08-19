import { Navigate, Outlet } from 'react-router-dom'
import { getAdminToken } from '@/lib/adminAuth'

export default function RequireAdminAuth() {
  if (!getAdminToken()) return <Navigate to="/admin/login" replace />
  return <Outlet />
}
