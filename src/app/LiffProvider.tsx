'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Liff } from '@line/liff'

interface LiffContextValue {
  liff: Liff | null
  ready: boolean
  loggedIn: boolean
}

const LiffContext = createContext<LiffContextValue>({ liff: null, ready: false, loggedIn: false })

export function useLiff() {
  return useContext(LiffContext)
}

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liff, setLiff] = useState<Liff | null>(null)
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID
    if (!liffId) {
      setReady(true)
      return
    }

    import('@line/liff').then(async ({ default: liffLib }) => {
      await liffLib.init({ liffId })

      // Only force login when running inside the LINE app
      if (!liffLib.isLoggedIn()) {
        if (liffLib.isInClient()) {
          liffLib.login()
          return
        }
        // Browser/dev mode — show app without auth
        setReady(true)
        return
      }

      setLiff(liffLib)
      setLoggedIn(true)
      setReady(true)
    }).catch(() => {
      setReady(true)
    })
  }, [])

  return (
    <LiffContext.Provider value={{ liff, ready, loggedIn }}>
      {children}
    </LiffContext.Provider>
  )
}
