'use client'

import { Booking } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  cancelled: 'ยกเลิก',
}

interface Props {
  booking: Booking
}

export default function BookingCard({ booking }: Props) {
  const nights = Math.round(
    (new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / 86400000
  )

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400">หมายเลขการจอง</p>
          <p className="text-sm font-mono text-gray-600">{booking.id.slice(0, 8)}...</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      <div className="border-t pt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400 text-xs">เช็คอิน</p>
          <p className="font-medium">{booking.checkin}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">เช็คเอาท์</p>
          <p className="font-medium">{booking.checkout}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">จำนวนคืน</p>
          <p className="font-medium">{nights} คืน</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">ผู้เข้าพัก</p>
          <p className="font-medium">{booking.guests} คน</p>
        </div>
      </div>

      <div className="border-t pt-2 flex justify-between items-center">
        <p className="text-gray-400 text-xs">ราคารวม</p>
        <p className="text-lg font-bold text-indigo-600">฿{booking.totalPrice.toLocaleString()}</p>
      </div>
    </div>
  )
}
