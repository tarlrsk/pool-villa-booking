import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET ?? ''
  const hash = crypto.createHmac('sha256', secret).update(body).digest('base64')
  return hash === signature
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-line-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Webhook received — events handled here if needed in the future
  return NextResponse.json({ status: 'ok' })
}
