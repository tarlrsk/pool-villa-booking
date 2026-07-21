import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import LiffProvider from './LiffProvider'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pool Villa Booking',
  description: 'Book your pool villa stay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 flex flex-col">
        <LiffProvider>{children}</LiffProvider>
      </body>
    </html>
  )
}
