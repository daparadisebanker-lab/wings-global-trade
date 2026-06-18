// src/components/features/accio/CifEstimateCard.tsx
'use client'

import { motion } from 'framer-motion'
import type { CifEstimate } from '@/types/accio'
import { SLIDE_UP } from '@/lib/motion'
import { useCountUp } from '@/hooks/useCountUp'

interface CifEstimateCardProps {
  estimate: CifEstimate
}

/**
 * Format a USD value per ENRICHED_SPEC §7:
 * Intl.NumberFormat('es-PE', USD, 0 decimals) → "US$ 47,320"
 */
function formatCIF(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format duty rate per ENRICHED_SPEC §7: toFixed(1) → "9.0%" */
function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`
}

export function CifEstimateCard({ estimate }: CifEstimateCardProps) {
  // Count-up animations — CIF total counts up 0→value 800ms (per ENRICHED_SPEC §4.5 + game-designer.md)
  const fob = useCountUp(Math.round(estimate.fob_estimate_usd))
  const freight = useCountUp(Math.round(estimate.freight_estimate_usd))
  const insurance = useCountUp(Math.round(estimate.insurance_estimate_usd))
  const cifTotal = useCountUp(Math.round(estimate.cif_total_usd), 800)
  const duty = useCountUp(Math.round(estimate.duty_amount_usd))
  const totalLanded = useCountUp(Math.round(estimate.cif_total_usd + estimate.duty_amount_usd))

  return (
    <motion.div variants={SLIDE_UP} initial="initial" animate="animate">
      {/* Bloomberg-terminal document feel — per ENRICHED_SPEC §1 */}
      <div className="rounded-wings-card bg-navy p-6 font-mono">
        <p className="mb-4 font-mono text-label-sm uppercase tracking-widest-2 text-text-muted-inverse">
          Estimado CIF preliminar
        </p>

        {/* Per ENRICHED_SPEC §7 — exact CIF card row labels */}
        <Row label="FOB estimado (en origen)" value={formatCIF(fob)} />
        <Row label="Flete internacional" value={formatCIF(freight)} />
        <Row label={`Seguro de carga (1.5%)`} value={formatCIF(insurance)} />

        <div className="my-3 border-t border-[rgba(248,246,240,0.2)]" />

        {/* CIF total — gold, mono-lg, counts up last — per ENRICHED_SPEC §4.5 */}
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-mono-md font-medium text-warm-white">CIF total</span>
          <span className="font-mono text-mono-lg font-medium text-gold">
            {formatCIF(cifTotal)}
          </span>
        </div>

        <div className="mt-2">
          <Row
            label={`Arancel estimado (${formatRate(estimate.duty_rate_pct)})`}
            value={formatCIF(duty)}
          />
        </div>

        <div className="my-3 border-t border-[rgba(248,246,240,0.2)]" />

        {/* Total landed cost row */}
        <Row label="Costo total estimado en destino" value={formatCIF(totalLanded)} bold />

        {/* Free zone row — gold highlight per ENRICHED_SPEC §2 designer.md */}
        <div className="mt-3 rounded-wings bg-gold/[0.12] px-3 py-2">
          <p className="font-mono text-mono-sm text-gold">
            Zona franca: {estimate.free_zone === 'ZOFRATACNA' ? 'ZOFRATACNA (Tacna, Perú)' : 'ZOFRI (Iquique, Chile)'}
          </p>
          <p className="mt-0.5 font-mono text-mono-sm text-text-muted-inverse">
            Ahorro estimado vía zona franca: {estimate.free_zone_savings_pct.toFixed(1)}%
          </p>
        </div>

        <Row label="Origen recomendado" value={estimate.source_market} className="mt-3" />
      </div>

      {/* Always-on disclaimer — per ENRICHED_SPEC §7 */}
      <p className="mt-3 font-body text-xs italic text-text-muted">
        Estimado preliminar generado por Mister. Los valores finales de flete, arancel
        y honorarios se confirman con la propuesta formal de Wings.
      </p>
    </motion.div>
  )
}

function Row({
  label,
  value,
  className,
  bold,
}: {
  label: string
  value: string
  className?: string
  bold?: boolean
}) {
  return (
    <div className={`flex items-center justify-between ${className ?? ''}`}>
      <span className="font-mono text-mono-sm font-light text-text-muted-inverse">{label}</span>
      <span className={`font-mono text-mono-md ${bold ? 'font-medium text-warm-white' : 'text-warm-white'}`}>
        {value}
      </span>
    </div>
  )
}
