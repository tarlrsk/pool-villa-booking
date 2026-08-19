import { apiUrl } from './api'
import { getAdminToken, clearAdminToken } from './adminAuth'

export class AdminAuthError extends Error {}

// Wraps fetch with the admin JWT attached. Clears the token and throws
// AdminAuthError on 401 so callers can redirect to /admin/login.
export async function adminFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${getAdminToken()}`,
      ...options.headers,
    },
  })

  if (res.status === 401) {
    clearAdminToken()
    throw new AdminAuthError('Unauthorized')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error ?? 'Request failed')
  }
  return data
}
