'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CircleCheck } from 'lucide-react'
import LoadingScreen from '@/components/LoadingScreen'

function ConfirmationContent() {
  const router = useRouter()
  const params = useSearchParams()
  const bookingId = params.get('bookingId') ?? ''

  return (
    <div className="min-h-screen bg-white md:bg-gray-100 md:flex md:justify-center md:py-10">
    <main className="w-full md:max-w-md md:rounded-3xl md:shadow-2xl md:bg-white md:overflow-hidden">

      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="w-8" />
        <h1 className="font-semibold text-gray-800">การจองสำเร็จ</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 py-8 text-center space-y-6">
      <CircleCheck size={72} className="text-indigo-500 mx-auto" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">จองสำเร็จแล้ว!</h1>
        <p className="text-gray-500">ทีมงานจะติดต่อกลับเพื่อยืนยันการจองเร็วๆ นี้</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
        <p>หมายเลขการจอง</p>
        <p className="font-mono font-bold text-gray-800 mt-1">{bookingId.slice(0, 8).toUpperCase()}</p>
      </div>

      <p className="text-sm text-gray-400">
        ระบบได้ส่งรายละเอียดการจองไปยัง LINE ของคุณแล้ว
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/my-bookings')}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          ดูการจองของฉัน
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 border border-gray-300 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition"
        >
          กลับหน้าหลัก
        </button>
      </div>
      </div>
    </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ConfirmationContent />
    </Suspense>
  )
}
