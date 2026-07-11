// src/components/features/brands/ExplodedDiagram.tsx
// Exploded view of the caja máster: the packing layers lift out of the box
// along the explode axis, with dashed leader guides — assembly-drawing
// convention, generated from the same packing data as PackingDiagram.
import { isoBox, isoCanvas, isoPt } from '@/lib/rb/iso'
import type { PackingSpec } from '@/components/features/brands/PackingDiagram'

interface Props {
  spec: PackingSpec
  /** 'y' lifts horizontal layers (pilas); 'z' separates depth rows. */
  axis: 'y' | 'z'
  caption: string
}

export function ExplodedDiagram({ spec, axis, caption }: Props) {
  const { box, cells } = spec
  const maxDim = Math.max(box.w, box.d, box.h)
  const s = 175 / maxDim
  const W = box.w * s
  const D = box.d * s
  const H = box.h * s

  const groups = axis === 'y' ? cells.y : cells.z
  const gap = axis === 'y' ? H * 0.42 : D * 0.5
  // Extra room the explosion needs on the canvas
  const extraH = axis === 'y' ? gap * groups : 0
  const extraD = axis === 'z' ? gap * groups : 0
  const canvas = isoCanvas(W, H + extraH, D + extraD, 42)
  const o = canvas.origin

  const slabs: React.ReactNode[] = []
  for (let g = 0; g < groups; g++) {
    const lift = (groups - 1 - g) * 0 // groups indexed bottom-up; offset below
    void lift
    const offY = axis === 'y' ? g * (H / cells.y + gap) - g * (H / cells.y) + g * gap : 0
    const offZ = axis === 'z' ? g * gap : 0
    const y0 = axis === 'y' ? (H / cells.y) * g + offY : 0
    const z0 = axis === 'z' ? (D / cells.z) * g + offZ : 0
    const slabH = axis === 'y' ? H / cells.y : H
    const slabD = axis === 'z' ? D / cells.z : D

    const faces = isoBox(o, 0, y0, z0, W, slabH, slabD)
    const inner: React.ReactNode[] = []
    // Internal pack divisions across the slab width
    for (let i = 1; i < cells.x; i++) {
      const x = (W / cells.x) * i
      inner.push(
        <path
          key={`x${g}-${i}`}
          d={`M${isoPt(o, x, y0, z0)} L${isoPt(o, x, y0 + slabH, z0)} L${isoPt(o, x, y0 + slabH, z0 + slabD)}`}
        />,
      )
    }
    // For y-explosions with depth cells, show them on the top face
    if (axis === 'y' && cells.z > 1) {
      for (let i = 1; i < cells.z; i++) {
        const z = (slabD / cells.z) * i
        inner.push(
          <path
            key={`z${g}-${i}`}
            d={`M${isoPt(o, 0, y0 + slabH, z0 + z)} L${isoPt(o, W, y0 + slabH, z0 + z)}`}
          />,
        )
      }
    }

    slabs.push(
      <g key={g}>
        {/* leader guides down to the base position */}
        {g > 0 && (
          <path
            d={`M${isoPt(o, 0, y0, z0)} L${isoPt(o, 0, axis === 'y' ? (H / cells.y) * g : 0, axis === 'z' ? (D / cells.z) * g : 0)}`}
            stroke="var(--rb-accent-ink)"
            strokeWidth="0.7"
            strokeDasharray="2 3"
            opacity="0.55"
            fill="none"
          />
        )}
        <g fill="#ffffff" stroke="var(--rb-ink)" strokeWidth="1.2" strokeLinejoin="round">
          <polygon points={faces.top} fill="var(--rb-surface-tint)" />
          <polygon points={faces.right} />
          <polygon points={faces.left} fill="var(--rb-accent-soft)" />
        </g>
        <g fill="none" stroke="var(--rb-accent-ink)" strokeWidth="0.9">
          {inner}
        </g>
      </g>,
    )
  }

  return (
    <figure className="border border-neutral-200 bg-[var(--rb-surface-tint)] p-5 md:p-6">
      <svg
        viewBox={`0 0 ${canvas.width.toFixed(0)} ${canvas.height.toFixed(0)}`}
        role="img"
        aria-label={`${spec.title} — vista explosionada`}
        className="mx-auto w-full max-w-[430px]"
      >
        {/* base box silhouette, empty */}
        <path
          d={isoBox(o, 0, 0, 0, W, H, D).outline}
          fill="none"
          stroke="var(--rb-ink)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.45"
        />
        {slabs}
      </svg>
      <figcaption className="mt-4 border-t border-neutral-200 pt-3">
        <span className="block font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
          Vista explosionada
        </span>
        <span className="mt-1 block font-mono text-mono-sm tabular-nums text-[var(--rb-accent-ink)]">
          {caption}
        </span>
      </figcaption>
    </figure>
  )
}
