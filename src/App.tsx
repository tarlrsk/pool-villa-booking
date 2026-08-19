import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LiffProvider from '@/providers/LiffProvider'
import HomePage from '@/pages/HomePage'
import BookingPage from '@/pages/BookingPage'
import ConfirmationPage from '@/pages/ConfirmationPage'
import MyBookingsPage from '@/pages/MyBookingsPage'

export default function App() {
  return (
    <LiffProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </BrowserRouter>
    </LiffProvider>
  )
}
