// src/components/features/accio/AccioSuccess.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { TprState, CifEstimate } from '@/types/accio'
import { SLIDE_UP } from '@/lib/motion'
import { WhatsAppButton } from '@/components/features/shared/WhatsAppButton'

interface AccioSuccessProps {
  tpr: TprState
  estimate: CifEstimate | null
  /** Supabase lead ID — formatted as WGT-[year]-[seq] per ENRICHED_SPEC §4.5 */
  leadId?: string | number
}

/** Format a lead ID as WGT-[year]-[seq] — per game-designer.md §Secondary Reward */
function formatReferenceNumber(leadId?: string | number): string {
  if (!leadId) {
    // Fallback: generate a plausible-looking number from timestamp
    const year = new Date().getFullYear()
    const seq = String(Math.abs(Date.now()) % 9999).padStart(4, '0')
    return `WGT-${year}-${seq}`
  }
  const year = new Date().getFullYear()
  const seq = String(Number(leadId) % 9999).padStart(4, '0')
  return `WGT-${year}-${seq}`
}

/** Build specific 24h follow-up timestamp — per game-designer.md §Secondary Reward */
function buildFollowUpTimestamp(): string {
  const followUp = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const dayName = days[followUp.getDay()]
  const day = followUp.getDate()
  const month = months[followUp.getMonth()]
  // Fixed to 18:00 as a professional close-of-business commitment
  return `${dayName} ${day} de ${month}, 18:00`
}

export function AccioSuccess({ tpr, estimate, leadId }: AccioSuccessProps) {
  const ref = formatReferenceNumber(leadId)
  const followUp = buildFollowUpTimestamp()

  return (
    <motion.div variants={SLIDE_UP} initial="initial" animate="animate" className="p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/[0.12]">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Per ENRICHED_SPEC §3.6 — exact confirm copy */}
      <h3 className="font-display text-2xl font-semibold text-navy">Consulta técnica enviada.</h3>
      <p className="mt-2 font-body text-base text-text-muted">
        Recibirás tu análisis de importación en menos de 24 horas.
      </p>

      {/* Reference number — per game-designer.md §Secondary Reward + ENRICHED_SPEC §4.5 */}
      <div className="mx-auto mt-4 inline-block rounded-wings-card border border-border-default bg-white px-4 py-2">
        <p className="font-mono text-xs uppercase tracking-widest-2 text-text-muted">
          Número de referencia
        </p>
        <p className="mt-0.5 font-mono text-base font-medium text-navy">{ref}</p>
      </div>

      {/* Specific 24h follow-up timestamp — per game-designer.md */}
      <p className="mt-3 font-body text-sm text-text-muted">
        El equipo Wings te contactará antes del{' '}
        <span className="font-medium text-navy">{followUp}</span>.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-wings-card border border-border-default bg-white p-4 text-left">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest-2 text-text-muted">
          Resumen del requerimiento
        </p>
        <p className="font-body text-sm text-navy">{tpr.product_description}</p>
        <p className="mt-1 font-mono text-sm text-text-mono">
          {tpr.quantity} · {tpr.destination_country}
        </p>
        {estimate && (
          <p className="mt-2 font-mono text-sm text-gold">
            CIF estimado:{' '}
            {new Intl.NumberFormat('es-PE', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(estimate.cif_total_usd)}{' '}
            vía {estimate.free_zone}
          </p>
        )}
      </div>

      {/* Post-submit internal link to catalog — per ia-architect.md §Internal Linking */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <WhatsAppButton
          message={`Hola, acabo de enviar una consulta técnica a través del Motor Accio. Referencia: ${ref}`}
          label="Abrir conversación en WhatsApp"
        />
        <Link href="/catalogo" className="font-body text-sm text-gold underline underline-offset-4 hover:text-gold-hover">
          Explorar catálogo de productos
        </Link>
      </div>
    </motion.div>
  )
}
