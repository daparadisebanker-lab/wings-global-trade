// Client island for the invite landing (spec §4.2-A). Owns the live deadline
// countdown and the single WhatsApp CTA. Tapping the CTA fires the `wa_started`
// attribution beacon, then opens wa.me — the message the user sends IS the
// WhatsApp opt-in, so nothing on this page collects a field before the tap.
'use client'

import { useEffect, useState } from 'react'

interface InviteActionsProps {
  inviteId: string
  waHref: string
  deadlineISO: string
}

function remaining(deadlineISO: string): { d: number; h: number; m: number; s: number; over: boolean } {
  const diff = new Date(deadlineISO).getTime() - Date.now()
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true }
  const s = Math.floor(diff / 1000)
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    over: false,
  }
}

export function InviteActions({ inviteId, waHref, deadlineISO }: InviteActionsProps) {
  const [t, setT] = useState(() => remaining(deadlineISO))

  useEffect(() => {
    const id = setInterval(() => setT(remaining(deadlineISO)), 1000)
    return () => clearInterval(id)
  }, [deadlineISO])

  function handleClaim() {
    // Best-effort beacon; never block the WhatsApp handoff on it.
    try {
      const body = JSON.stringify({ inviteId, event: 'wa_started' })
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/container/invite-event', new Blob([body], { type: 'application/json' }))
      } else {
        void fetch('/api/container/invite-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        })
      }
    } catch {
      /* attribution is non-critical */
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center justify-center gap-3 font-[var(--font-mono)] text-[var(--color-text-primary)]"
        aria-label="Tiempo restante para cerrar el grupo"
      >
        {t.over ? (
          <span className="text-[15px] text-[var(--color-text-mono)]">Cierre en proceso</span>
        ) : (
          <>
            <TimeCell value={t.d} unit="d" />
            <Sep />
            <TimeCell value={t.h} unit="h" />
            <Sep />
            <TimeCell value={t.m} unit="m" />
            <Sep />
            <TimeCell value={t.s} unit="s" />
          </>
        )}
      </div>

      <a
        href={waHref}
        onClick={handleClaim}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-none bg-[var(--color-gold)] px-6 py-4 text-[17px] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gold-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
      >
        Tomar mi cupo por WhatsApp
      </a>
    </div>
  )
}

function TimeCell({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className="text-[26px] tabular-nums leading-none">{String(value).padStart(2, '0')}</span>
      <span className="text-[12px] text-[var(--color-text-mono)]">{unit}</span>
    </span>
  )
}

function Sep() {
  return <span className="text-[20px] leading-none text-[var(--color-text-muted)]">:</span>
}
