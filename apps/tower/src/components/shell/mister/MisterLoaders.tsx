'use client'

// The Mister loading language (UI-PRIMITIVES §5), as components. Spinners are banned
// product-wide — waiting is "matter forming", not a spinner. All animation lives in
// mister-motion.css (scoped to .mister-motion) and collapses to static under
// reduced-motion. Colors are the sanctioned Mister-surface palette (World-B rule).
import './mister-motion.css'
import { ConstellationField } from './ConstellationField'
import type { ReactNode } from 'react'

/** Three brand dots pulsing (1.2s, calm) — for inline / in-button waiting. */
export function ThreeDots({ className }: { className?: string }) {
  return (
    <span className={`mister-motion mister-dots ${className ?? ''}`} role="status" aria-label="…">
      <i />
      <i />
      <i />
    </span>
  )
}

/** A 1–2px Sky light crossing a hairline — indeterminate progress (no thick bars). */
export function HairlineSweep({ className }: { className?: string }) {
  return <div className={`mister-motion mister-hairline ${className ?? ''}`} role="progressbar" aria-label="…" />
}

/** A subtle opacity-pulsing block — data-row skeletons (no shimmer). */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`mister-motion mister-skeleton ${className ?? ''}`} style={style} aria-hidden />
}

/** N skeleton rows, for a loading list/card. */
export function SkeletonRows({ rows = 4, height = 12, gap = 10 }: { rows?: number; height?: number; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }} aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} style={{ height, width: `${90 - i * 8}%` }} />
      ))}
    </div>
  )
}

/**
 * Condensation — grain condenses into the M (the page/panel/artifact loader). Wraps
 * the ConstellationField LOADING state with an optional caption below.
 */
export function Condensation({ size = 48, caption }: { size?: number; caption?: ReactNode }) {
  return (
    <div
      className="mister-motion"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 24 }}
      role="status"
    >
      <ConstellationField size={size} state="loading" gradient ariaLabel="Mister" />
      {caption ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-tertiary)' }}>{caption}</span> : null}
    </div>
  )
}
