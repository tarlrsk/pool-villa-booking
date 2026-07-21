import { LineProfile } from './types'

export async function verifyLineToken(idToken: string): Promise<LineProfile | null> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  if (!liffId || !idToken) return null

  // client_id must be the channel ID (numeric prefix before the dash in LIFF ID)
  const channelId = liffId.split('-')[0]

  const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: channelId,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('LINE token verify failed:', err)
    return null
  }

  const data = await res.json()
  return {
    userId: data.sub,
    displayName: data.name ?? '',
    pictureUrl: data.picture,
  }
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
