'use client'

import { ChevronLeft } from 'lucide-react'

interface Props {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export default function PageHeader({ title, onBack, right }: Props) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
      {onBack ? (
        <button
          onClick={onBack}
          className="text-gray-600 p-1 -ml-1 hover:text-gray-900 transition active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
      ) : (
        <div className="w-8" />
      )}
      <h1 className="font-semibold text-gray-800">{title}</h1>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  )
}
