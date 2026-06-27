// src/components/features/mister/surfaces/LandedCostWaterfall.tsx
// The signature financial display component.
// STRUCTURAL GUARANTEE: no absolute-currency code path.
// Renders ONLY indexed [low,high] bands. Gold ONLY on BASE 100.
// Always-a-band total — computed from segments, never passed in.
// Source: ENRICHED_SPEC §8, designer.md §4, animator.md §12
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Transition } from 'framer-motion'
import type { WaterfallSegment, WaterfallSurface } from '@/types/mister'
import { DISCLAIMERS, WATERFALL_COPY } from '@/types/mister'
import {
  DEFAULT_SEGMENTS,
  PRODUCT_SEGMENT,
} from '@/lib/mister/waterfall-segments'
import {
  getWaterfallStripSegmentVariants,
  waterfallTableContainerVariants,
  waterfallTableRowVariants,
  waterfallTotalVariants,
} from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Strip background classes — Tailwind arbitrary CSS var syntax.
// Static strings allow JIT to include them; no inline style needed.
const STRIP_BG_CLASS: Record<WaterfallSegment['key'], string> = {
  product:   'bg-[var(--mister-wf-strip-product)]',
  freight:   'bg-[var(--mister-wf-strip-freight)]',
  insurance: 'bg-[var(--mister-wf-strip-insurance)]',
  duties:    'bg-[var(--mister-wf-strip-duties)]',
  lastmile:  'bg-[var(--mister-wf-strip-lastmile)]',
}

const STRIP_LABEL: Record<WaterfallSegment['key'], string> = {
  product:   'PRODUCTO',
  freight:   'FLETE',
  insurance: 'SEGURO',
  duties:    'ADUANAS',
  lastmile:  'ÚLT. MILLA',
}

// Duties glow overlay — fires after the duties bar completes (~1.3s).
// Outer motion.div handles scaleX reveal; inner motion.div is the glow overlay.
// bg-[var(--mister-wf-separator)] = rgba(196,147,63,0.12) — the glow peak color.
// Applied via className so no hardcoded hex is present in component code.
const DUTIES_GLOW_ANIMATE: { opacity: number[] } = { opacity: [0, 1, 0] }
const DUTIES_GLOW_TRANSITION: Transition = {
  duration: 0.60,
  ease: [0.45, 0.05, 0.55, 0.95],
  delay: 1.30,
  times: [0, 0.5, 1],
  repeat: 0,
}

interface Props {
  payload: WaterfallSurface
}

export function LandedCostWaterfall({ payload }: Props) {
  const segments =
    payload.segments.length > 0 ? payload.segments : DEFAULT_SEGMENTS

  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const animateTarget = isInView
    ? reduced
      ? 'visibleReduced'
      : 'visible'
    : 'hidden'

  // Compute strip widths from segment midpoints
  const midpoints = segments.map((s) => (s.indexLow + s.indexHigh) / 2)
  const totalMidpoint = midpoints.reduce((a, b) => a + b, 0)

  // Compute total band — always from segments, never a prop
  const totalLow = segments.reduce((a, s) => a + s.indexLow, 0)
  const totalHigh = segments.reduce((a, s) => a + s.indexHigh, 0)

  const isBase = (s: WaterfallSegment) =>
    s.key === PRODUCT_SEGMENT.key &&
    s.indexLow === 100 &&
    s.indexHigh === 100

  return (
    <div
      ref={ref}
      className="rounded-none border border-[var(--mister-border-surface)] bg-[var(--mister-wf-bg)] mister-shadow-surface"
      aria-label="Estructura de costo indexada"
    >
      {/* ── Component header ─────────────────────────────────── */}
      <div className="px-5 pb-3 pt-5">
        <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.12em] text-[var(--mister-text-secondary)]">
          CÓMO SE CONSTRUYE TU COSTO
        </p>
        <p className="mt-0.5 font-body text-[10px] font-[300] text-[var(--mister-text-muted)]">
          {WATERFALL_COPY.microDisclaimerEs}
        </p>
      </div>
      <div className="mx-5 border-t border-[var(--mister-gold-rule)]" />

      {/* ── Part A: Indexed Strip ────────────────────────────── */}
      <div className="relative mx-5 mt-4 flex h-6 overflow-hidden">
        {segments.map((seg, i) => {
          const pct =
            totalMidpoint > 0
              ? (midpoints[i] ?? 0) / totalMidpoint
              : 1 / segments.length
          const vars = getWaterfallStripSegmentVariants(i)
          const isDuties = seg.key === 'duties'
          const bgClass = STRIP_BG_CLASS[seg.key] ?? 'bg-transparent'

          return (
            <div
              key={seg.key}
              className="relative overflow-hidden"
              style={{ width: `${pct * 100}%` }}
            >
              {isDuties ? (
                // Outer: scaleX reveal. Inner: gold glow overlay pulse.
                <motion.div
                  className={`absolute inset-0 ${bgClass}`}
                  variants={vars}
                  initial="hidden"
                  animate={animateTarget}
                >
                  {!reduced && (
                    <motion.div
                      className="absolute inset-0 bg-[var(--mister-wf-separator)]"
                      animate={DUTIES_GLOW_ANIMATE}
                      transition={DUTIES_GLOW_TRANSITION}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className={`absolute inset-0 ${bgClass}`}
                  variants={vars}
                  initial="hidden"
                  animate={animateTarget}
                />
              )}
              {/* Segment separator (not on last) */}
              {i < segments.length - 1 && (
                <div className="absolute inset-y-0 right-0 w-px bg-[var(--mister-wf-separator)]" />
              )}
            </div>
          )
        })}
      </div>

      {/* Strip labels */}
      <div className="mx-5 mt-1 flex">
        {segments.map((seg, i) => {
          const pct =
            totalMidpoint > 0
              ? (midpoints[i] ?? 0) / totalMidpoint
              : 1 / segments.length
          return (
            <div
              key={seg.key}
              className="overflow-hidden"
              style={{ width: `${pct * 100}%` }}
            >
              <p className="truncate font-mono text-[9px] font-[300] uppercase text-[var(--mister-text-ghost)]">
                {STRIP_LABEL[seg.key]}
              </p>
            </div>
          )
        })}
      </div>

      {/* Separator between strip and table */}
      <div className="mx-5 mt-3 border-t border-[var(--mister-border-row)]" />

      {/* ── Part B: Breakdown Table ──────────────────────────── */}
      <motion.div
        variants={waterfallTableContainerVariants}
        initial="hidden"
        animate={isInView ? (reduced ? 'visibleReduced' : 'visible') : 'hidden'}
      >
        {segments.map((seg) => (
          <motion.div
            key={seg.key}
            variants={waterfallTableRowVariants}
            className="flex min-h-[56px] items-center justify-between border-b border-[var(--mister-border-row)] px-5 py-3 last:border-b-0"
          >
            {/* Left: label + driver note */}
            <div className="mr-4 min-w-0 flex-1">
              <p className="font-body text-[13px] font-[500] leading-tight text-[var(--mister-text-primary)]">
                {seg.label}
              </p>
              <p className="mt-0.5 font-body text-[11px] font-[300] leading-snug text-[var(--mister-text-secondary)]">
                {seg.driverNote}
              </p>
            </div>

            {/* Right: index value — gold only on BASE 100 */}
            <div className="flex-shrink-0 text-right">
              {isBase(seg) ? (
                <p className="font-mono text-[16px] font-[500] tracking-[0.02em] text-[var(--mister-wf-base)]">
                  BASE 100
                </p>
              ) : (
                <>
                  <p className="font-mono text-[16px] font-[500] tracking-[0.02em] text-[var(--mister-wf-value)]">
                    +{seg.indexLow} – {seg.indexHigh}
                  </p>
                  <p className="font-mono text-[9px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-muted)]">
                    PTS
                  </p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Total Band ───────────────────────────────────────── */}
      <motion.div
        variants={waterfallTotalVariants}
        initial="hidden"
        animate={isInView ? (reduced ? 'visibleReduced' : 'visible') : 'hidden'}
        className="flex min-h-[52px] items-center justify-between border-t border-[var(--mister-wf-total-separator)] px-5 py-3"
      >
        <p className="font-mono text-[10px] font-[500] uppercase tracking-[0.10em] text-[var(--mister-text-secondary)]">
          ÍNDICE TOTAL ESTIMADO
        </p>
        <div className="text-right">
          <p className="font-mono text-[20px] font-[700] tracking-[0.02em] text-[var(--mister-text-primary)]">
            {totalLow} – {totalHigh}
          </p>
          <p className="font-mono text-[9px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-muted)]">
            PTS
          </p>
        </div>
      </motion.div>

      {/* ── Disclaimer Footer ────────────────────────────────── */}
      <div className="border-t border-[var(--mister-border-row)] px-5 py-3">
        <p className="text-center font-body text-[10px] font-[300] text-[var(--mister-text-muted)]">
          {WATERFALL_COPY.footerEs}
        </p>
        <p className="mt-1 text-center font-body text-[10px] font-[300] text-[var(--mister-text-ghost)]">
          {DISCLAIMERS.handoff}
        </p>
      </div>
    </div>
  )
}
