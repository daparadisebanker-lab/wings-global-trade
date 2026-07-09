// @wings/trade-ui · FillMeter — the container fill visualizer (ecosystem §2).
// Spec (shared-container §4.1-3): "the hero element… the brand's most reusable
// asset." A horizontal container silhouette filling left-to-right, segmented by
// slots: committed = solid accent, reserved = hatched, open = outline. Identical
// on the invite landing, group workspace, lead console, and ad creative.
//
// Token-styled only; props are primitives so the package imports nothing from
// apps/*. The OG-image render (Satori/ImageResponse) reimplements this look with
// inline styles — this component is the DOM source of that truth.
'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { cn } from '../lib/cn'

export interface FillMeterProps {
  totalSlots: number
  committedSlots: number
  reservedSlots: number
  /** Show the "{taken} de {total} cupos" caption below the meter. */
  showCaption?: boolean
  /** Localized caption builder; defaults to Spanish. */
  caption?: (taken: number, total: number) => string
  /** Legend under the meter (Tomado / Reservado / Disponible). */
  showLegend?: boolean
  legendLabels?: { committed: string; reserved: string; open: string }
  /** Animate the sequential fill on mount (spec: ~400ms ease-out). */
  animate?: boolean
  /** Visual scale. */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const HATCH =
  'repeating-linear-gradient(45deg, var(--color-gold) 0 3px, transparent 3px 7px)'

const HEIGHTS: Record<NonNullable<FillMeterProps['size']>, string> = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
}

type SegmentState = 'committed' | 'reserved' | 'open'

export function FillMeter({
  totalSlots,
  committedSlots,
  reservedSlots,
  showCaption = true,
  caption = (taken, total) => `${taken} de ${total} cupos tomados`,
  showLegend = false,
  legendLabels = { committed: 'Tomado', reserved: 'Reservado', open: 'Disponible' },
  animate = true,
  size = 'md',
  className,
}: FillMeterProps) {
  const reduced = useReducedMotion()
  const total = Math.max(1, Math.floor(totalSlots))
  const committed = clamp(committedSlots, 0, total)
  const reserved = clamp(reservedSlots, 0, total - committed)
  const taken = committed + reserved

  const states: SegmentState[] = Array.from({ length: total }, (_, i) => {
    if (i < committed) return 'committed'
    if (i < committed + reserved) return 'reserved'
    return 'open'
  })

  const doAnimate = animate && !reduced

  return (
    <div className={cn('w-full', className)}>
      {/* Container silhouette: square corners (structural radius 0), gold rule. */}
      <div
        className={cn(
          'relative flex w-full gap-[2px] overflow-hidden rounded-none',
          'border border-[var(--color-border-gold)] bg-[var(--color-surface-card)] p-[3px]',
          HEIGHTS[size],
        )}
        role="img"
        aria-label={caption(taken, total)}
      >
        {/* Corrugation baseline so it reads as a shipping container, not a bar. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--color-text-primary) 0 1px, transparent 1px 6px)',
          }}
        />
        {states.map((state, i) => (
          <motion.div
            key={i}
            className={cn(
              'relative flex-1 rounded-none',
              state === 'open' &&
                'border border-dashed border-[var(--color-border-gold)] bg-transparent',
              state === 'committed' && 'bg-[var(--color-gold)]',
            )}
            style={{
              transformOrigin: 'left',
              ...(state === 'reserved'
                ? { backgroundImage: HATCH, border: '1px solid var(--color-border-gold)' }
                : {}),
            }}
            initial={doAnimate ? { opacity: 0, scaleX: 0 } : false}
            animate={doAnimate ? { opacity: 1, scaleX: 1 } : undefined}
            transition={
              doAnimate
                ? {
                    // Sequential fill, ~400ms total across taken segments, ease-out.
                    delay: state === 'open' ? 0 : (i / Math.max(1, taken)) * 0.4,
                    duration: 0.18,
                    ease: [0, 0, 0.2, 1],
                  }
                : undefined
            }
          />
        ))}
      </div>

      {showCaption && (
        <p className="mt-2 font-[var(--font-mono)] text-[13px] tracking-tight text-[var(--color-text-mono)]">
          {caption(taken, total)}
        </p>
      )}

      {showLegend && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-[var(--font-mono)] text-[11px] text-[var(--color-text-mono)]">
          <LegendSwatch label={legendLabels.committed} kind="committed" />
          <LegendSwatch label={legendLabels.reserved} kind="reserved" />
          <LegendSwatch label={legendLabels.open} kind="open" />
        </div>
      )}
    </div>
  )
}

function LegendSwatch({ label, kind }: { label: string; kind: SegmentState }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          'inline-block h-3 w-3 rounded-none',
          kind === 'committed' && 'bg-[var(--color-gold)]',
          kind === 'open' && 'border border-dashed border-[var(--color-border-gold)]',
        )}
        style={
          kind === 'reserved'
            ? { backgroundImage: HATCH, border: '1px solid var(--color-border-gold)' }
            : undefined
        }
      />
      {label}
    </span>
  )
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.floor(n)))
}
