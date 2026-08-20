import { useCallback, useRef, useState } from 'react'
import Modal from '@/components/admin/Modal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<(v: boolean) => void>(null)

  const confirm = useCallback((opts: ConfirmOptions | string) => {
    setOptions(typeof opts === 'string' ? { message: opts } : opts)
    return new Promise<boolean>(resolve => {
      resolver.current = resolve
    })
  }, [])

  function settle(result: boolean) {
    setOptions(null)
    resolver.current?.(result)
  }

  const dialog = options ? (
    <Modal onClose={() => settle(false)}>
      {options.title && <h3 className="text-base font-semibold text-gray-900 mb-1">{options.title}</h3>}
      <p className="text-sm text-gray-600 mb-5 whitespace-pre-line">{options.message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => settle(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
        >
          {options.cancelLabel ?? 'ยกเลิก'}
        </button>
        <button
          type="button"
          autoFocus
          onClick={() => settle(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
            options.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {options.confirmLabel ?? 'ยืนยัน'}
        </button>
      </div>
    </Modal>
  ) : null

  return { confirm, dialog }
}
