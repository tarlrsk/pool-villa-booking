import { NextRequest, NextResponse } from 'next/server'
import { addBlockedDate } from '@/lib/google-sheets'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { date, reason } = body

  if (!date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 })
  }

  await addBlockedDate(date, reason ?? '')
  return NextResponse.json({ success: true })
}
