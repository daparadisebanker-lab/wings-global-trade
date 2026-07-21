// The "see the load" isometric organ for Mister's container-fit artifact.
// Draws a small isometric container (shared iso projection from @wings/trade-ui)
// whose gold body rises to the true volumetric fill — the loaded portion shaded,
// the empty headroom left as void. A single CSS settle on mount (reduced-motion
// safe); pure SVG/CSS, no rAF, no 3D dependency.
//
// Palette is the dark-bubble one, per the dock: gold #e0b866, container lines a
// light steel rgba(168,192,220,0.5). Numbers stay the hero — this is comprehension,
// not decoration.
import type { CSSProperties } from 'react'
import { isoBox, isoCanvas, isoPt, type IsoOrigin } from '@wings/trade-ui'

// Representative container proportions (long, low) — the label carries the exact
// kind; this drawing carries the feeling of fullness, drawn to honest fill.
const L = 140 // length  (x → lower-right)
const H = 40 // height (y → up)
const W = 44 // depth  (z → lower-left)

const STEEL = 'rgba(168,192,220,0.5)'
const STEEL_SOFT = 'rgba(168,192,220,0.28)'
// Gold, shaded by face so the load reads as a solid with light from above.
const GOLD_TOP = 'rgba(224,184,102,0.95)'
const GOLD_RIGHT = 'rgba(224,184,102,0.7)'
const GOLD_LEFT = 'rgba(224,184,102,0.48)'

export function FitScene({ pct, label }: { pct: number; label: string }) {
  const canvas = isoCanvas(L, H, W, 18)
  const o: IsoOrigin = canvas.origin

  const fillFrac = Math.max(0, Math.min(100, pct)) / 100
  const fillH = H * fillFrac

  const shell = isoBox(o, 0, 0, 0, L, H, W)
  const fill = fillH > 0 ? isoBox(o, 0, 0, 0, L, fillH, W) : null

  // Container floor — a faint plane so an empty container still reads as a volume.
  const floor = `${isoPt(o, 0, 0, 0)} ${isoPt(o, L, 0, 0)} ${isoPt(o, L, 0, W)} ${isoPt(o, 0, 0, W)}`

  // Clip id kept static & scoped — one instance renders per artifact bubble.
  const clipId = 'fit-scene-clip'

  return (
    <svg
      className="fit-svg"
      viewBox={`0 0 ${canvas.width.toFixed(0)} ${canvas.height.toFixed(0)}`}
      role="img"
      aria-label={`${label}: ${Math.round(pct)}% cargado`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shell.outline} />
        </clipPath>
      </defs>

      {/* floor + hidden faces (dashed) read the empty container as a box */}
      <polygon points={floor} fill="rgba(168,192,220,0.06)" stroke="none" />
      <g fill="none" stroke={STEEL_SOFT} strokeWidth="0.8" strokeDasharray="3 4">
        <polygon points={shell.top} />
        <polygon points={shell.left} />
      </g>

      {/* the load — rises into the clipped container silhouette on mount */}
      {fill && (
        <g
          className="fit-fill"
          clipPath={`url(#${clipId})`}
          style={{ '--fit-rise': `${fillH.toFixed(1)}px` } as CSSProperties}
          strokeLinejoin="round"
        >
          <polygon points={fill.right} fill={GOLD_RIGHT} />
          <polygon points={fill.left} fill={GOLD_LEFT} />
          <polygon points={fill.top} fill={GOLD_TOP} />
        </g>
      )}

      {/* container silhouette last so its edges sit crisp over the load */}
      <path d={shell.outline} fill="none" stroke={STEEL} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
