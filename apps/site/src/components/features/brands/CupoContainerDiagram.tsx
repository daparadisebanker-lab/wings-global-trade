// src/components/features/brands/CupoContainerDiagram.tsx
// The cupo cascade as a technical object: the container drawn in CABINET
// projection — true front elevation, depth receding at half scale — the
// standard convention for long objects (full isometric turns a 12 m box
// into a page-eating diagonal). Slices mirror the SlotGrid grammar:
// vendido solid, reservado hatched, selección accent, disponible outline;
// clickable with the same selection semantics. Display only — availability
// is always re-validated server-side.
'use client'

import { useId } from 'react'
import type { RbContainerTemplate, RbPublicContainer } from '@/lib/rb/fixtures'
import { fmt } from '@/lib/rb/packing'

// Interior dims, mm
const DIMS: Record<string, { l: number; h: number }> = {
  '20GP': { l: 5898, h: 2393 },
  '40GP': { l: 12032, h: 2393 },
  '40HC': { l: 12032, h: 2698 },
  REEFER: { l: 11560, h: 2500 },
}

// Cabinet projection: depth recedes up-right at half scale, 30°-ish.
const DX = 0.42
const DY = 0.24

interface Props {
  container: RbPublicContainer
  template: RbContainerTemplate
  selected: number
  onSelect?: (slots: number) => void
}

export function CupoContainerDiagram({ container, template, selected, onSelect }: Props) {
  const hatchId = useId().replace(/[:]/g, '')
  const dims = DIMS[template.kind] ?? DIMS['40HC']
  const L = 560
  const H = (dims.h / dims.l) * L * 1.6 // gentle vertical emphasis for legibility
  const D = 64 // drawn depth (schematic)
  const pad = 14
  const oy = pad + D * DY

  const { total, committed, reserved } = container.slots
  const sliceW = L / total

  const stateOf = (i: number): 'committed' | 'reserved' | 'selected' | 'open' => {
    if (i < committed) return 'committed'
    if (i < committed + reserved) return 'reserved'
    return i - committed - reserved < selected ? 'selected' : 'open'
  }

  const fills: Record<string, string> = {
    committed: 'var(--rb-accent)',
    reserved: `url(#${hatchId})`,
    selected: 'var(--rb-accent-soft)',
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
    return (
      <g
        key={i}
        onClick={
          clickable
            ? () => onSelect(availIndex + 1 === selected ? availIndex : availIndex + 1)
            : undefined
        }
        className={clickable ? 'cursor-pointer' : undefined}
        role={clickable ? 'button' : undefined}
        aria-label={
          clickable
            ? `Cupo ${i + 1} · ${template.packagesPerSlot} cajas`
            : `Cupo ${i + 1} · ${state === 'committed' ? 'vendido' : 'reservado'}`
        }
      >
        {/* front face */}
        <rect
          x={sx}
          y={yTop}
          width={sliceW}
          height={H}
          fill={fills[state]}
          stroke="var(--rb-ink)"
          strokeWidth="0.9"
        />
        {/* top strip (receding) */}
        <polygon
          points={`${sx},${yTop} ${sx + D * DX},${yTop - D * DY} ${sx + sliceW + D * DX},${yTop - D * DY} ${sx + sliceW},${yTop}`}
          fill={state === 'open' || state === 'selected' ? 'var(--rb-surface-tint)' : fills[state]}
          stroke="var(--rb-ink)"
          strokeWidth="0.7"
          opacity="0.9"
        />
        {state === 'selected' && (
          <rect x={sx} y={yTop} width={sliceW} height={H} fill="none" stroke="var(--rb-accent-ink)" strokeWidth="2" />
        )}
        {/* cupo number */}
        <text
          x={sx + sliceW / 2}
          y={yBot - 8}
          textAnchor="middle"
          fontFamily="var(--livery-font-mono), monospace"
          fontSize="11"
          fill={state === 'committed' ? '#ffffff' : 'var(--rb-accent-ink)'}
          opacity="0.9"
        >
          {i + 1}
        </text>
      </g>
    )
  })

  const width = pad * 2 + L + D * DX + 4
  const height = oy + H + 26

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width.toFixed(0)} ${height.toFixed(0)}`}
        role="group"
        aria-label={`Contenedor ${template.kindLabel}: ${total} cupos`}
        className="w-full"
      >
        <defs>
          <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#ffffff" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--rb-accent)" strokeWidth="2.2" opacity="0.45" />
          </pattern>
        </defs>
        {slices}
        {/* door-end face (receding) */}
        <polygon
          points={`${x0 + L},${yTop} ${x0 + L + D * DX},${yTop - D * DY} ${x0 + L + D * DX},${yTop - D * DY + H} ${x0 + L},${yBot}`}
          fill="var(--rb-accent-soft)"
          stroke="var(--rb-ink)"
          strokeWidth="0.9"
        />
        <line
          x1={x0 + L + (D * DX) / 2}
          y1={yTop - (D * DY) / 2}
          x2={x0 + L + (D * DX) / 2}
          y2={yTop - (D * DY) / 2 + H}
          stroke="var(--rb-ink)"
          strokeWidth="0.6"
          opacity="0.6"
        />
        {/* kind label */}
        <text
          x={x0}
          y={height - 6}
          fontFamily="var(--livery-font-mono), monospace"
          fontSize="12"
          fill="var(--rb-accent-ink)"
        >
          {template.kind} · {total} cupos · {fmt(template.totalPackages)} cajas · vendido ■ reservado ▨ disponible □
        </text>
      </svg>
      <figcaption className="mt-1 font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
        1 cupo = {template.packagesPerSlot} cajas = {fmt(template.packagesPerSlot * template.unitsPerPackage)}{' '}
        {template.unitNamePlural} — seleccione en el contenedor o en la cuadrícula
      </figcaption>
    </figure>
  )
}
