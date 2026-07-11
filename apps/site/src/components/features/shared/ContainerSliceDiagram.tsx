// src/components/features/shared/ContainerSliceDiagram.tsx
// The container drawn as a technical object, sliced into its cupos —
// cabinet projection (true front elevation, receding depth), the shared
// visual grammar for BOTH cupo products: represented-brand containers and
// contenedor compartido (Áladín doctrine: one engine, extended not forked).
//
// States mirror the FillMeter/SlotGrid grammar: vendido solid · reservado
// hatched · selección accent · disponible outline. Optionally clickable
// with SlotGrid selection semantics. Display only — availability is always
// re-validated server-side.
//
// Theming is token-only via local custom properties with Wings fallbacks;
// brand canvases override by setting --csd-* (e.g. to the --rb-* set):
//   --csd-accent       fill for vendido / hatch color
//   --csd-accent-ink   labels, selection outline
//   --csd-accent-soft  selección fill
//   --csd-ink          edges
//   --csd-tint         top-face tint
'use client'

import { useId, useState } from 'react'

const DIMS: Record<string, { l: number; h: number }> = {
  '20GP': { l: 5898, h: 2393 },
  '40GP': { l: 12032, h: 2393 },
  '40HC': { l: 12032, h: 2698 },
  REEFER: { l: 11560, h: 2500 },
}

const DX = 0.42
const DY = 0.24

const ACCENT = 'var(--csd-accent, var(--livery-gold))'
const ACCENT_INK = 'var(--csd-accent-ink, var(--livery-gold-active))'
const ACCENT_SOFT = 'var(--csd-accent-soft, var(--livery-gold-subtle))'
const INK = 'var(--csd-ink, var(--livery-navy))'
const TINT = 'var(--csd-tint, var(--livery-warm-white))'

export interface ContainerSliceDiagramProps {
  /** Container kind; unknown strings fall back to 40HC proportions. */
  kind: string
  slots: { total: number; committed: number; reserved: number }
  selected?: number
  onSelect?: (slots: number) => void
  /** Mono line under the drawing (e.g. «40HC · 10 cupos · 940 cajas»). */
  headline?: string
  /** Second caption line (e.g. the unit cascade). */
  caption?: string
  className?: string
}

export function ContainerSliceDiagram({
  kind,
  slots,
  selected = 0,
  onSelect,
  headline,
  caption,
  className,
}: ContainerSliceDiagramProps) {
  const hatchId = useId().replace(/[:]/g, '')
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const dims = DIMS[kind] ?? DIMS['40HC']
  const L = 560
  const H = (dims.h / dims.l) * L * 1.6
  const D = 64
  const pad = 14
  const oy = pad + D * DY

  const { total, committed, reserved } = slots
  const sliceW = L / Math.max(1, total)

  const stateOf = (i: number): 'committed' | 'reserved' | 'selected' | 'open' => {
    if (i < committed) return 'committed'
    if (i < committed + reserved) return 'reserved'
    return i - committed - reserved < selected ? 'selected' : 'open'
  }

  const fills: Record<string, string> = {
    committed: ACCENT,
    reserved: `url(#${hatchId})`,
    selected: ACCENT_SOFT,
    open: '#ffffff',
  }

  const x0 = pad
  const yTop = oy
  const yBot = oy + H

  const slices = Array.from({ length: total }, (_, i) => {
    const sx = x0 + i * sliceW
    const state = stateOf(i)
    const availIndex = i - committed - reserved
    const clickable = onSelect && state !== 'committed' && state !== 'reserved'
    const select = () => onSelect?.(availIndex + 1 === selected ? availIndex : availIndex + 1)
    return (
      <g
        key={i}
        data-td-pop
        onClick={clickable ? select : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                // An SVG <g role="button"> is not natively operable — wire Enter/Space.
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  select()
                }
              }
            : undefined
        }
        onFocus={clickable ? () => setFocusedIndex(i) : undefined}
        onBlur={clickable ? () => setFocusedIndex((f) => (f === i ? null : f)) : undefined}
        tabIndex={clickable ? 0 : undefined}
        className={clickable ? 'cursor-pointer' : undefined}
        role={clickable ? 'button' : undefined}
        aria-label={`Cupo ${i + 1} · ${
          state === 'committed' ? 'tomado' : state === 'reserved' ? 'reservado' : 'disponible'
        }`}
      >
        <rect
          x={sx}
          y={yTop}
          width={sliceW}
          height={H}
          fill={fills[state]}
          stroke={INK}
          strokeWidth="0.9"
          style={{ transition: 'fill 0.25s ease' }}
        />
        <polygon
          points={`${sx},${yTop} ${sx + D * DX},${yTop - D * DY} ${sx + sliceW + D * DX},${yTop - D * DY} ${sx + sliceW},${yTop}`}
          fill={state === 'open' || state === 'selected' ? TINT : fills[state]}
          stroke={INK}
          strokeWidth="0.7"
          opacity="0.9"
        />
        {state === 'selected' && (
          <rect x={sx} y={yTop} width={sliceW} height={H} fill="none" stroke={ACCENT_INK} strokeWidth="2" />
        )}
        {clickable && focusedIndex === i && (
          <rect
            x={sx + 2}
            y={yTop + 2}
            width={sliceW - 4}
            height={H - 4}
            fill="none"
            stroke={ACCENT_INK}
            strokeWidth="2"
            strokeDasharray="4 3"
          />
        )}
        <text
          x={sx + sliceW / 2}
          y={yBot - 8}
          textAnchor="middle"
          fontFamily="var(--livery-font-mono), monospace"
          fontSize="14"
          fill={state === 'committed' ? '#ffffff' : ACCENT_INK}
          opacity="0.9"
        >
          {i + 1}
        </text>
      </g>
    )
  })

  const width = pad * 2 + L + D * DX + 4
  const height = oy + H + 10

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${width.toFixed(0)} ${height.toFixed(0)}`}
        role="group"
        aria-label={`Contenedor ${kind}: ${total} cupos`}
        className="w-full"
      >
        <defs>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#ffffff" />
            <line x1="0" y1="0" x2="0" y2="6" stroke={ACCENT} strokeWidth="2.2" opacity="0.45" />
          </pattern>
        </defs>
        {slices}
        <polygon
          data-td-late
          points={`${x0 + L},${yTop} ${x0 + L + D * DX},${yTop - D * DY} ${x0 + L + D * DX},${yTop - D * DY + H} ${x0 + L},${yBot}`}
          fill={ACCENT_SOFT}
          stroke={INK}
          strokeWidth="0.9"
        />
        <line
          x1={x0 + L + (D * DX) / 2}
          y1={yTop - (D * DY) / 2}
          x2={x0 + L + (D * DX) / 2}
          y2={yTop - (D * DY) / 2 + H}
          stroke={INK}
          strokeWidth="0.6"
          opacity="0.6"
        />
      </svg>
      {(headline || caption) && (
        <figcaption className="mt-2 space-y-0.5">
          {headline && (
            <span
              className="block font-mono text-[12px] font-semibold tabular-nums"
              style={{ color: ACCENT_INK }}
            >
              {headline}
            </span>
          )}
          {caption && (
            <span className="block font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
              {caption}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
