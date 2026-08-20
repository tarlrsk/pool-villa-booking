import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LiffProvider from '@/providers/LiffProvider'
import HomePage from '@/pages/HomePage'
import BookingPage from '@/pages/BookingPage'
import ConfirmationPage from '@/pages/ConfirmationPage'
import MyBookingsPage from '@/pages/MyBookingsPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage'
import AdminPricingPage from '@/pages/admin/AdminPricingPage'
import AdminBlockedDatesPage from '@/pages/admin/AdminBlockedDatesPage'
import RequireAdminAuth from '@/components/admin/RequireAdminAuth'
import ToastProvider from '@/components/admin/ToastProvider'

function CustomerLayout() {
  return (
    <LiffProvider>
      <Outlet />
    </LiffProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ToastProvider>
              <Routes>
                <Route path="login" element={<AdminLoginPage />} />
                <Route element={<RequireAdminAuth />}>
                  <Route index element={<Navigate to="/admin/bookings" replace />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="pricing" element={<AdminPricingPage />} />
                  <Route path="blocked-dates" element={<AdminBlockedDatesPage />} />
                </Route>
              </Routes>
            </ToastProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
