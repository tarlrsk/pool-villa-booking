import { useNavigate, useSearchParams } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import PageShell from '@/components/PageShell'
import PageHeader from '@/components/PageHeader'

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const bookingId = params.get('bookingId') ?? ''

  return (
    <PageShell>
      <PageHeader title="การจองสำเร็จ" />
      <div className="px-4 py-8 text-center space-y-6">

        <CircleCheck size={72} className="text-indigo-500 mx-auto" />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">จองสำเร็จแล้ว!</h2>
          <p className="text-gray-500">ทีมงานจะติดต่อกลับเพื่อยืนยันการจองเร็วๆ นี้</p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
          <p>หมายเลขการจอง</p>
          <p className="font-mono font-bold text-gray-800 mt-1">{bookingId}</p>
        </div>

        <p className="text-sm text-gray-400">
          ระบบได้ส่งรายละเอียดการจองไปยัง LINE ของคุณแล้ว
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/my-bookings')}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            ดูการจองของฉัน
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-gray-300 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            กลับหน้าหลัก
          </button>
        </div>

      </div>
    </PageShell>
  )
}
