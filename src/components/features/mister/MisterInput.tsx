// src/components/features/mister/MisterInput.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

const QUICK_ACTIONS_EMPTY = [
  'Quiero importar desde China, ¿cómo funciona?',
  'Necesito cotización de maquinaria agrícola para Perú',
  'Tengo un producto específico y quiero saber el costo total',
] as const

interface MisterInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  autoFocus?: boolean
  messageCount?: number
}

export function MisterInput({ onSend, disabled, autoFocus, messageCount = 1 }: MisterInputProps) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)
  const showChips = messageCount <= 1

  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  function send() {
    const v = value.trim()
    if (!v || disabled) return
    onSend(v)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="border-t border-[#C4933F]/15 bg-navy-900 p-4">
      {showChips && (
        <div className="mx-auto mb-3 flex max-w-3xl flex-wrap gap-2">
          {QUICK_ACTIONS_EMPTY.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => !disabled && onSend(action)}
              disabled={disabled}
              className="rounded-sm border border-[#C4933F]/20 px-3 py-1.5 font-mono text-sm text-[#F8F6F0]/50 transition-colors hover:border-[#C4933F]/50 hover:text-[#F8F6F0]/80 disabled:opacity-40"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder="Describe lo que necesitas importar..."
          aria-label="Mensaje para Mister"
          className="max-h-32 min-h-[48px] w-full resize-none rounded-sm border border-[#C4933F]/20 bg-navy px-4 py-3 font-body text-base text-[#F8F6F0] outline-none transition-shadow placeholder:text-[#F8F6F0]/25 focus:border-[#C4933F]/50 focus:shadow-[0_0_0_3px_rgba(196,147,63,0.08)]"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !value.trim()}
          aria-label="Enviar mensaje"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-gold text-navy-900 transition-colors hover:bg-gold-hover disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
