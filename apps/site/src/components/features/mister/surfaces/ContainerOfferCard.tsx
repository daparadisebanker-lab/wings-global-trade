// src/components/features/mister/surfaces/ContainerOfferCard.tsx
// Contenedor Compartido offer surface (spec §3.3). The price and deadline live
// HERE (structured payload → client render), never in Mister's streamed text,
// so the text-only price/availability guardrails never fire. The CTA calls the
// explicit /api/container/join endpoint (write is a user action, not a stream
// side-effect), then routes the member into their workspace.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FillMeter } from '@wings/trade-ui'
import type { ContainerOfferSurface } from '@/types/mister'
import { surfaceCardVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { HAPTIC } from '@/lib/mister/haptics'

interface Props {
  payload: ContainerOfferSurface
}

export function ContainerOfferCard({ payload }: Props) {
  const reduced = useReducedMotion()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'joining' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleJoin() {
    if (status === 'joining') return
    setStatus('joining')
    setErrorMsg('')
    try {
      const res = await fetch(payload.joinEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shortCode: payload.shortCode }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Error ${res.status}`)
      }
      const data = (await res.json()) as { workspaceUrl: string }
      HAPTIC.formSubmit()
      router.push(data.workspaceUrl)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo tomar el cupo.')
      setStatus('error')
    }
  }

  const price = payload.slotPriceUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const deadline = new Date(payload.fillDeadline).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  })

  return (
    <motion.div
      variants={surfaceCardVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="overflow-hidden rounded-none border border-[var(--color-border-gold)] bg-[var(--color-surface-card)]"
    >
      <div className="flex flex-col gap-4 p-5">
        {/* Route + who invited */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] tracking-tight text-[var(--color-text-primary)]">
            {payload.routeOrigin} <span className="text-[var(--color-text-muted)]">→</span>{' '}
            {payload.routeDestination}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-text-mono)]">
            {payload.shortCode}
          </span>
        </div>

        <FillMeter
          totalSlots={payload.slots.total}
          committedSlots={payload.slots.committed}
          reservedSlots={payload.slots.reserved}
          size="md"
        />

        {/* One number rules the card. */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[32px] font-semibold leading-none text-[var(--color-text-primary)]">
            ${price}
          </span>
          <span className="text-[13px] text-[var(--color-text-mono)]">todo incluido por cupo</span>
        </div>

        {payload.priceIncludes.length > 0 && (
          <p className="text-[12px] leading-snug text-[var(--color-text-mono)]">
            Incluye: {payload.priceIncludes.join(' · ')}.
          </p>
        )}

        <p className="font-mono text-[12px] text-[var(--color-text-mono)]">Cierra {deadline}</p>

        {errorMsg && <p className="text-[12px] text-red-500">{errorMsg}</p>}

        <button
          type="button"
          onClick={() => void handleJoin()}
          disabled={status === 'joining'}
          className="h-11 w-full rounded-[2px] bg-[var(--color-gold)] font-body text-[13px] font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-gold-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'joining' ? 'Tomando tu cupo…' : 'Tomar mi cupo →'}
        </button>
      </div>
    </motion.div>
  )
}
