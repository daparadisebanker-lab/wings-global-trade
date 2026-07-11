// src/components/features/brands/PalletDiagram.tsx
// Pallet stacking schematic: cajas máster on a standard pallet, drawn with
// the shared iso engine. Deliberately labeled «esquema» — box proportions
// are true to the codification; the per-camada arrangement is the packing
// figure (5/camada for higiénico per ops, 8/camada for facial per the SPSA
// CD data), not a certified stuffing plan.
import { isoBox, isoCanvas } from '@/lib/rb/iso'

export interface PalletSpec {
  /** Boxes per camada as an x×z grid; `skip` leaves the last n grid cells
   *  empty (dashed) so 5 reads as 3×2−1, honestly showing the odd count. */
  grid: { x: number; z: number; skip: number }
  layers: number
  boxDims: { w: number; d: number; h: number }
  note: string
}

const PALLET_H = 130 // mm, deck + blocks

export function PalletDiagram({ spec }: { spec: PalletSpec }) {
  const { grid, layers, boxDims } = spec
  const gapMm = 14
  const totalW = grid.x * boxDims.w + (grid.x - 1) * gapMm
  const totalD = grid.z * boxDims.d + (grid.z - 1) * gapMm
  const totalH = PALLET_H + layers * boxDims.h + 40

  const maxDim = Math.max(totalW, totalD, totalH)
  const s = 215 / maxDim
  const canvas = isoCanvas(totalW * s, totalH * s, totalD * s, 40)
  const o = canvas.origin

  const nodes: React.ReactNode[] = []

  // Pallet: two deck slabs + three bearer blocks along the depth
  const deck = isoBox(o, -6 * s, (PALLET_H - 28) * s, -6 * s, totalW * s + 12 * s, 28 * s, totalD * s + 12 * s)
  nodes.push(
    <g key="deck" data-td-fade fill="#ffffff" stroke="var(--rb-ink)" strokeWidth="1.1" strokeLinejoin="round">
      <polygon points={deck.top} fill="var(--rb-surface-tint)" />
      <polygon points={deck.right} />
      <polygon points={deck.left} fill="var(--rb-accent-soft)" />
    </g>,
  )
  for (let b = 0; b < 3; b++) {
    const bx = (totalW * s - 30 * s) * (b / 2)
    const block = isoBox(o, bx, 0, -6 * s, 30 * s, (PALLET_H - 28) * s, totalD * s + 12 * s)
    nodes.push(
      <g key={`block-${b}`} data-td-fade fill="#ffffff" stroke="var(--rb-ink)" strokeWidth="0.9" strokeLinejoin="round" opacity="0.8">
        <polygon points={block.right} />
        <polygon points={block.left} fill="var(--rb-accent-soft)" />
      </g>,
    )
  }

  // Boxes — drawn back-to-front, bottom-to-top for correct overlap
  const perLayer = grid.x * grid.z - grid.skip
  for (let layer = 0; layer < layers; layer++) {
    const y0 = (PALLET_H + layer * boxDims.h) * s
    for (let iz = grid.z - 1; iz >= 0; iz--) {
      for (let ix = 0; ix < grid.x; ix++) {
        const cellIndex = iz * grid.x + ix
        const isSkipped = cellIndex >= grid.x * grid.z - grid.skip
        const x0 = ix * (boxDims.w + gapMm) * s
        const z0 = iz * (boxDims.d + gapMm) * s
        const faces = isoBox(o, x0, y0, z0, boxDims.w * s, boxDims.h * s, boxDims.d * s)
        if (isSkipped) {
          // Alternate-position cell: dashed silhouette, no fill
          nodes.push(
            <path
              key={`sk-${layer}-${cellIndex}`}
              d={faces.outline}
              fill="none"
              stroke="var(--rb-accent-ink)"
              strokeWidth="0.7"
              strokeDasharray="3 3"
              opacity="0.4"
              data-td-late
            />,
          )
        } else {
          nodes.push(
            <g
              key={`bx-${layer}-${cellIndex}`}
              data-td-pop
              fill="#ffffff"
              stroke="var(--rb-ink)"
              strokeWidth="1"
              strokeLinejoin="round"
            >
              <polygon points={faces.top} fill="var(--rb-surface-tint)" />
              <polygon points={faces.right} />
              <polygon points={faces.left} fill="var(--rb-accent-soft)" />
            </g>,
          )
        }
      }
    }
  }

  return (
    <figure className="border border-neutral-200 bg-[var(--rb-surface-tint)] p-3 md:p-6">
      <svg
        viewBox={`0 0 ${canvas.width.toFixed(0)} ${canvas.height.toFixed(0)}`}
        role="img"
        aria-label="Esquema de apilado en pallet"
        className="mx-auto w-full max-w-[430px]"
      >
        {nodes}
      </svg>
      <figcaption className="mt-4 border-t border-neutral-200 pt-3">
        <span className="block font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
          Esquema de apilado · pallet estándar
        </span>
        <span className="mt-1 block font-mono text-mono-sm tabular-nums text-[var(--rb-accent-ink)]">
          {spec.note}
        </span>
        <span className="sr-only">{perLayer} cajas por camada</span>
      </figcaption>
    </figure>
  )
}
