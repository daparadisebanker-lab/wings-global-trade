// src/components/features/mister/MisterComposer.tsx
// The signature line at the bottom of the document.
// Full-width, top 1px gold rule that transitions to strong on input focus.
// Send trigger is "→" bare text in Teko — no button border.
// MisterWaveform sits above the input as the infrastructure/thinking signal.
// Source: designer.md §4 (MisterComposer), animator.md §16
'use client'

import { useRef, useState, useEffect, KeyboardEvent } from 'react'
import { useMister } from '@/components/features/mister/MisterProvider'
import { MisterWaveform } from '@/components/features/mister/MisterWaveform'
import { HAPTIC } from '@/lib/mister/haptics'

export function MisterComposer() {
  const { sendMessage, inFlight, isStreaming } = useMister()
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isDisabled = inFlight || isStreaming
  const hasContent = value.trim().length > 0

  // Stop thinking haptic pulse when response arrives
  useEffect(() => {
    if (!inFlight && !isStreaming) {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current)
        thinkingIntervalRef.current = null
        HAPTIC.thinkingEnd()
      }
    }
  }, [inFlight, isStreaming])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) clearInterval(thinkingIntervalRef.current)
    }
  }, [])

  const handleSend = (): void => {
    const text = value.trim()
    if (!text || isDisabled) return
    sendMessage(text)
    setValue('')
    textareaRef.current?.focus()
    // Thinking haptic: start pulse, then rhythm every 1.2s until first token
    HAPTIC.thinkingStart()
    thinkingIntervalRef.current = setInterval(() => HAPTIC.thinkingPulse(), 1200)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    /* Single top border — transitions from gold-rule to gold-rule-strong on focus.
       mister-composer-border provides the CSS transition: border-top-color 0.15s ease. */
    <div
      className={`mister-composer-border flex flex-col border-t bg-[var(--mister-bg-composer)] pb-[env(safe-area-inset-bottom)] touch-manipulation ${
        focused
          ? 'border-[var(--mister-gold-rule-strong)]'
          : 'border-[var(--mister-gold-rule)]'
      }`}
    >
      {/* Waveform — the only ambient signal during inFlight */}
      <div className="px-4 pt-2">
        <MisterWaveform isStreaming={isStreaming || inFlight} />
      </div>

      {/* Composer row: input + send arrow */}
      <div className="flex h-10 items-center gap-0 lg:h-14">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isDisabled}
          placeholder="Escribe tu consulta"
          rows={1}
          aria-label="Mensaje para Mister"
          className="h-full flex-1 resize-none overflow-y-hidden bg-transparent px-4 py-2.5 font-body text-[16px] font-[400] leading-[1.40] text-[var(--mister-text-primary)] placeholder-[var(--mister-text-muted)] outline-none disabled:opacity-50 md:text-[14px] lg:px-6 lg:text-[15px]"
        />

        {/* Send trigger — bare "→", no button border. Teko 500 16px per designer.md */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!hasContent || isDisabled}
          aria-label="Enviar mensaje"
          className={`mister-send-arrow flex h-full w-12 flex-shrink-0 items-center justify-center font-mono text-[16px] font-[500] disabled:cursor-not-allowed lg:w-16 lg:text-[18px] ${
            hasContent && !isDisabled
              ? 'text-[var(--mister-gold)]'
              : 'text-[var(--mister-text-muted)]'
          }`}
        >
          →
        </button>
      </div>
    </div>
  )
}
