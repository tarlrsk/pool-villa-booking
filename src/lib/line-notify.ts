import { Booking } from './types'

export async function sendBookingConfirmation(booking: Booking): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  if (!token) return

  const checkin = new Date(booking.checkin).toLocaleDateString('th-TH', { dateStyle: 'long' })
  const checkout = new Date(booking.checkout).toLocaleDateString('th-TH', { dateStyle: 'long' })
  const nights = Math.round((new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / 86400000)

  const message = [
    '✅ การจองสำเร็จแล้ว!',
    '',
    `📋 หมายเลขการจอง: ${booking.id}`,
    `👤 ชื่อ: ${booking.displayName}`,
    `📅 เช็คอิน: ${checkin}`,
    `📅 เช็คเอาท์: ${checkout}`,
    `🌙 จำนวนคืน: ${nights} คืน`,
    `👥 จำนวนผู้เข้าพัก: ${booking.guests} คน`,
    `💰 ราคารวม: ${booking.totalPrice.toLocaleString()} บาท`,
    '',
    'ทีมงานจะติดต่อกลับเพื่อยืนยันการจองเร็วๆ นี้ 🙏',
  ].join('\n')

  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: booking.lineUserId,
      messages: [{ type: 'text', text: message }],
    }),
  })
}
