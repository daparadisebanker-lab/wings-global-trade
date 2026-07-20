// src/components/features/brands/PackingDiagram.tsx
// Technical isometric drawing of the caja máster, generated at runtime from
// the packing data (SPSA codification dims) — true proportions, never an
// illustration. Blueprint conventions: visible edges solid in brand ink,
// internal packing divisions in accent, hidden edges dashed, dimension
// lines with mono labels. Numbers are exhibited, not hidden (Prime
// Directive 5).
//
// Geometry: cells.x packs along the width, cells.z along the depth,
// cells.y stacked vertically. Detail styles:
//   'rolls' — roll ends drawn on the front face (higienico: 2 ends per
//             pack face → the 10-roll pack reads as 5 deep × 2 across)
//   'slabs' — horizontal unit divisions on the front face (facial: piles
//             of 5 empaques)

export interface PackingSpec {
  /** Interior box dims in mm: width (x), depth (z), height (y). */
  box: { w: number; d: number; h: number }
  cells: { x: number; z: number; y: number }
  detail: 'rolls' | 'slabs'
  title: string
  composition: string
}

const COS = 0.866
const SIN = 0.5

export function PackingDiagram({ spec }: { spec: PackingSpec }) {
  const { box, cells, detail } = spec

  // Scale mm → px so the drawing fits its frame.
  const maxDim = Math.max(box.w, box.d, box.h)
  const s = 210 / maxDim
  const W = box.w * s
  const D = box.d * s
  const H = box.h * s

  // Isometric projection: x runs to the lower-right, z to the lower-left,
  // y up. Origin placed so everything (incl. dimension lines) fits.
  const ox = D * COS + 46
  const oy = H + 34
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - z) * COS,
    oy + (x + z) * SIN - y,
  ]
  const pt = (x: number, y: number, z: number) => P(x, y, z).map((n) => n.toFixed(1)).join(',')

  const vbW = (W + D) * COS + 92
  const vbH = H + (W + D) * SIN + 78

  // Outer box faces
  const topFace = `${pt(0, H, 0)} ${pt(W, H, 0)} ${pt(W, H, D)} ${pt(0, H, D)}`
  const rightFace = `${pt(0, 0, 0)} ${pt(W, 0, 0)} ${pt(W, H, 0)} ${pt(0, H, 0)}`
  const leftFace = `${pt(0, 0, 0)} ${pt(0, H, 0)} ${pt(0, H, D)} ${pt(0, 0, D)}`

  // Internal division lines on the three visible faces
  const divisions: string[] = []
  for (let i = 1; i < cells.x; i++) {
    const x = (W / cells.x) * i
    divisions.push(`M${pt(x, 0, 0)} L${pt(x, H, 0)} L${pt(x, H, D)}`) // front + top
  }
  for (let i = 1; i < cells.y; i++) {
    const y = (H / cells.y) * i
    divisions.push(`M${pt(0, y, D)} L${pt(0, y, 0)} L${pt(W, y, 0)}`) // left + front
  }
  for (let i = 1; i < cells.z; i++) {
    const z = (D / cells.z) * i
    divisions.push(`M${pt(0, 0, z)} L${pt(0, H, z)} L${pt(W, H, z)}`) // left + top
  }

  // Front-face detail (plane z = 0)
  const details: React.ReactNode[] = []
  if (detail === 'rolls') {
    // Roll ends: 2 per pack across the width, one row per vertical cell.
    const rollsAcross = cells.x * 2
    const rw = W / rollsAcross
    const rh = H / cells.y
    const r = Math.min(rw, rh) * 0.36
    for (let ix = 0; ix < rollsAcross; ix++) {
      for (let iy = 0; iy < cells.y; iy++) {
        const [cx, cy] = P(rw * (ix + 0.5), rh * (iy + 0.5), 0)
        details.push(
          <g key={`roll-${ix}-${iy}`} data-td-pop transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)})`}>
            {/* circle on the x/y iso plane → ellipse rotated to the face */}
            <ellipse rx={r} ry={r * 0.82} transform="rotate(-30) skewX(-30) scale(1,0.864)" />
            <ellipse rx={r * 0.32} ry={r * 0.28} transform="rotate(-30) skewX(-30) scale(1,0.864)" />
          </g>,
        )
      }
    }
  } else {
    // Unit slabs inside each pile: horizontal lines splitting each vertical
    // cell into 5 empaques on the front face.
    const perPile = 5
    const cellH = H / cells.y
    for (let iy = 0; iy < cells.y; iy++) {
      for (let u = 1; u < perPile; u++) {
        const y = cellH * iy + (cellH / perPile) * u
        details.push(
          <path
            key={`slab-${iy}-${u}`}
            d={`M${pt(0, y, 0)} L${pt(W, y, 0)}`}
            strokeDasharray="2.5 3"
            data-td-late
          />,
        )
      }
    }
  }

  // Dimension lines (offset from the bottom edges + right vertical)
  const dim = (
    a: [number, number],
    b: [number, number],
    label: string,
    dx: number,
    dy: number,
    anchor: 'start' | 'middle' | 'end' = 'middle',
  ) => {
    const mid = [(a[0] + b[0]) / 2 + dx, (a[1] + b[1]) / 2 + dy]
    return (
      <g key={label} className="rb-dim">
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        <text x={mid[0]} y={mid[1]} textAnchor={anchor}>
          {label}
        </text>
      </g>
    )
  }
  const off = 14
  const dimW = dim(
    P(0, -off, 0).map((n, i) => (i === 1 ? n + 0 : n)) as [number, number],
    P(W, -off, 0) as [number, number],
    `${spec.box.w} mm`,
    6,
    16,
  )
  const dimD = dim(
    P(0, -off, 0) as [number, number],
    P(0, -off, D) as [number, number],
    `${spec.box.d} mm`,
    -6,
    16,
  )
  const dimH = dim(
    P(W + off * 0.8, 0, 0) as [number, number],
    P(W + off * 0.8, H, 0) as [number, number],
    `${spec.box.h} mm`,
    10,
    4,
    'start',
  )

  return (
    <figure className="border border-neutral-200 bg-[var(--rb-surface-tint)] p-3 md:p-6">
      <svg
        viewBox={`0 0 ${vbW.toFixed(0)} ${vbH.toFixed(0)}`}
        role="img"
        aria-label={`${spec.title} — disposición interna de la caja máster`}
        className="mx-auto w-full max-w-[430px]"
      >
        {/* faces */}
        <g data-td-fade fill="#ffffff" stroke="var(--rb-ink)" strokeWidth="1.4" strokeLinejoin="round">
          <polygon points={topFace} fill="var(--rb-surface-tint)" />
          <polygon points={rightFace} />
          <polygon points={leftFace} fill="var(--rb-accent-soft)" />
        </g>
        {/* internal packing divisions — line-drawn on entry */}
        <g fill="none" stroke="var(--rb-accent-ink)" strokeWidth="0.9">
          {divisions.map((d, i) => (
            <path key={i} d={d} data-td-draw pathLength={1} />
          ))}
        </g>
        {/* pack detail on the front face */}
        <g fill="none" stroke="var(--rb-accent-ink)" strokeWidth="0.8" opacity="0.85">
          {details}
        </g>
        {/* hidden rear edges */}
        <g data-td-late fill="none" stroke="var(--rb-ink)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.4">
          <path d={`M${pt(W, 0, 0)} L${pt(W, 0, D)} L${pt(0, 0, D)}`} />
          <path d={`M${pt(W, 0, D)} L${pt(W, H, D)}`} />
        </g>
        {/* dimensions */}
        <g
          data-td-late
          stroke="var(--rb-accent-ink)"
          strokeWidth="0.8"
          fontFamily="var(--livery-font-mono), monospace"
          fontSize="17"
          fill="var(--rb-accent-ink)"
        >
          {dimW}
          {dimD}
          {dimH}
        </g>
      </svg>
      <figcaption className="mt-4 border-t border-neutral-200 pt-3">
        <span className="block font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">
          {spec.title}
        </span>
        <span className="mt-1 block font-mono text-mono-sm tabular-nums text-[var(--rb-accent-ink)]">
          {spec.composition}
        </span>
      </figcaption>
    </figure>
  )
}
