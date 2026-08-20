import { useCallback, useRef, useState } from 'react'
import Modal from '@/components/admin/Modal'

interface PromptOptions {
  title?: string
  message?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
  defaultValue?: string
}

export function usePrompt() {
  const [options, setOptions] = useState<PromptOptions | null>(null)
  const [value, setValue] = useState('')
  const resolver = useRef<(v: string | null) => void>(null)

  const ask = useCallback((opts: PromptOptions | string) => {
    const o = typeof opts === 'string' ? { message: opts } : opts
    setOptions(o)
    setValue(o.defaultValue ?? '')
    return new Promise<string | null>(resolve => {
      resolver.current = resolve
    })
  }, [])

  function settle(result: string | null) {
    setOptions(null)
    resolver.current?.(result)
  }

  const dialog = options ? (
    <Modal onClose={() => settle(null)}>
      <form onSubmit={e => { e.preventDefault(); settle(value.trim()) }}>
        {options.title && <h3 className="text-base font-semibold text-gray-900 mb-1">{options.title}</h3>}
        {options.message && <p className="text-sm text-gray-600 mb-3">{options.message}</p>}
        <input
          autoFocus
          type="text"
          value={value}
          placeholder={options.placeholder}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => settle(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            {options.cancelLabel ?? 'ยกเลิก'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            {options.confirmLabel ?? 'ตกลง'}
          </button>
        </div>
      </form>
    </Modal>
  ) : null

  return { ask, dialog }
}
