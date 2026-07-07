'use client'

// Shared confidence indicator for every Intelligence review surface
// (TriageCard, SpecExtractReview, per-field). Core law: the AI shows its
// confidence next to every proposal. DESIGN_SYSTEM: status is conveyed by
// label + shape, NEVER color alone — so the band name (ALTA/MEDIA/BAJA) and the
// percentage both read without color; the fill hue only reinforces them.
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'

type Band = 'high' | 'medium' | 'low'

const BAND_LABEL: Record<Band, Localized> = {
  high: { es: 'ALTA', en: 'HIGH' },
  medium: { es: 'MEDIA', en: 'MED' },
  low: { es: 'BAJA', en: 'LOW' },
}

// Fill + text hue per band. Amber and green carry everything; alarm red is spent
// only on genuinely low confidence (DESIGN_SYSTEM refusals).
const BAND_FILL: Record<Band, string> = {
  high: 'bg-positive',
  medium: 'bg-accent',
  low: 'bg-negative',
}
const BAND_INK: Record<Band, string> = {
  high: 'text-positive',
  medium: 'text-accent',
  low: 'text-negative',
}

/** ≥0.80 high · ≥0.50 medium · else low. */
export function confidenceBand(value: number): Band {
  if (value >= 0.8) return 'high'
  if (value >= 0.5) return 'medium'
  return 'low'
}

export function ConfidenceMeter({
  value,
  label,
  locale = DEFAULT_LOCALE,
  compact = false,
  className,
}: {
  /** 0..1. */
  value: number
  /** Optional caption above the meter (e.g. "Confianza / Confidence"). */
  label?: Localized
  locale?: Locale
  /** Compact = inline chip (no bar), for per-field use. */
  compact?: boolean
  className?: string
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
  const pct = Math.round(clamped * 100)
  const band = confidenceBand(clamped)
  const bandLabel = t(BAND_LABEL[band], locale)

  if (compact) {
    return (
      <span
        className={cn('inline-flex items-center gap-1.5 font-mono text-label uppercase tracking-[0.06em]', BAND_INK[band], className)}
        data-numeric
        aria-label={`${bandLabel} ${pct}%`}
      >
        <span aria-hidden className={cn('inline-block h-1.5 w-1.5 rounded-full', BAND_FILL[band])} />
        {pct}%
      </span>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          {label ? t(label, locale) : t({ es: 'Confianza', en: 'Confidence' }, locale)}
        </span>
        <span className={cn('flex items-center gap-1.5 font-mono text-label uppercase tracking-[0.06em]', BAND_INK[band])} data-numeric>
          <span aria-hidden className={cn('inline-block h-1.5 w-1.5 rounded-full', BAND_FILL[band])} />
          {bandLabel} · {pct}%
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-card border border-line bg-surface-0"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${bandLabel} ${pct}%`}
      >
        <div className={cn('h-full', BAND_FILL[band])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
