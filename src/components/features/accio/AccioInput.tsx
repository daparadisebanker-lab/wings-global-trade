// src/components/features/accio/AccioInput.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

// Per ENRICHED_SPEC §8 — quick actions for empty screen state
const QUICK_ACTIONS_EMPTY = [
  'Quiero importar desde China, ¿cómo funciona?',
  'Necesito cotización de maquinaria agrícola para Perú',
  'Tengo un producto específico y quiero saber el costo total',
] as const

interface AccioInputProps {
  onSend: (content: string) => void
  disabled?: boolean
  autoFocus?: boolean
  /** Total number of messages in the conversation (including the AI greeting). */
  messageCount?: number
}

export function AccioInput({ onSend, disabled, autoFocus, messageCount = 1 }: AccioInputProps) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  // Chips are visible only when the user has not yet sent their first message.
  // messageCount === 1 means only the hardcoded AI greeting exists.
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

  function handleChipClick(text: string) {
    if (disabled) return
    onSend(text)
  }

  return (
    <div className="border-t border-border-default bg-white p-4">
      {/* Quick action chips — visible before user sends first message */}
      {showChips && (
        <div className="mx-auto mb-3 flex max-w-3xl flex-wrap gap-2">
          {QUICK_ACTIONS_EMPTY.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleChipClick(action)}
              disabled={disabled}
              className="rounded-sm border border-navy/30 px-4 py-2 font-body text-sm text-navy/70 transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
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
          // Per ENRICHED_SPEC §3.6 — exact placeholder
          placeholder="Describe lo que necesitas importar..."
          aria-label="Mensaje para Mister"
          className="max-h-32 min-h-[48px] w-full resize-none rounded-wings border border-border-default px-4 py-3 font-body text-base text-navy outline-none transition-shadow placeholder:text-[#9CA3AF] focus:border-gold focus:shadow-[0_0_0_3px_rgba(196,147,63,0.15)]"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !value.trim()}
          aria-label="Enviar mensaje"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-wings bg-gold text-navy transition-colors hover:bg-gold-hover disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
