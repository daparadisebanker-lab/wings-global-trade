'use client'

// La Constelación — the Mister isotipo as a governed canvas system (CONSTELLATION-
// SPEC.md). Geometry is the CANONICAL map (constellation-map.json, extracted ±1px
// from the asset) — never approximated. 17 dots; exactly 4 metaball bridges forming
// the M ([12,13],[12,16],[14,15],[15,16]); bridges are tangent metaballs (Hiroyuki
// Sato construction, waist v=0.5, handle 2.4·r), re-derived every frame — never
// stroked lines. States: BASE (static) · IDLE (noise drift) · THINKING (shrink +
// vortex). prefers-reduced-motion → BASE. This is the only always-animated element.
import { useEffect, useRef } from 'react'

type Dot = { id: number; x: number; y: number; r: number; kind: 'sat' | 'core'; color: string }

// Canonical map (normalized 0..1, origin top-left). Copied byte-exact from
// spec/contributions/mister-torre/design-language/constellation-map.json.
const DOTS: Dot[] = [
  { id: 0, x: 0.4995, y: 0.1525, r: 0.0497, kind: 'sat', color: '#50A9CD' },
  { id: 1, x: 0.2517, y: 0.2508, r: 0.032, kind: 'sat', color: '#ABE1F6' },
  { id: 2, x: 0.7474, y: 0.2508, r: 0.032, kind: 'sat', color: '#197FA9' },
  { id: 3, x: 0.4995, y: 0.3122, r: 0.0247, kind: 'sat', color: '#75C5E6' },
  { id: 4, x: 0.1485, y: 0.4994, r: 0.0496, kind: 'sat', color: '#A2DCF5' },
  { id: 5, x: 0.8506, y: 0.4994, r: 0.0496, kind: 'sat', color: '#1A85B1' },
  { id: 6, x: 0.2732, y: 0.4994, r: 0.0247, kind: 'sat', color: '#93D4F1' },
  { id: 7, x: 0.7259, y: 0.4994, r: 0.0247, kind: 'sat', color: '#3BA0CA' },
  { id: 8, x: 0.4995, y: 0.6855, r: 0.0247, kind: 'sat', color: '#50ACD2' },
  { id: 9, x: 0.2517, y: 0.7498, r: 0.032, kind: 'sat', color: '#62B0D3' },
  { id: 10, x: 0.7465, y: 0.7498, r: 0.032, kind: 'sat', color: '#2186B1' },
  { id: 11, x: 0.4995, y: 0.8465, r: 0.0497, kind: 'sat', color: '#3997C1' },
  { id: 12, x: 0.3787, y: 0.4093, r: 0.0498, kind: 'core', color: '#90D4F0' },
  { id: 13, x: 0.3787, y: 0.5759, r: 0.0497, kind: 'core', color: '#77C5E4' },
  { id: 14, x: 0.6204, y: 0.5769, r: 0.0496, kind: 'core', color: '#4AABD0' },
  { id: 15, x: 0.6204, y: 0.4083, r: 0.0495, kind: 'core', color: '#58B4DB' },
  { id: 16, x: 0.4991, y: 0.5259, r: 0.0494, kind: 'core', color: '#69BFE2' },
]
const BRIDGES: [number, number][] = [
  [12, 13],
  [12, 16],
  [14, 15],
  [15, 16],
]
const FLAT = '#3B82F6'

export type ConstellationState = 'base' | 'idle' | 'thinking'

interface Props {
  size?: number
  /** 'base' static · 'idle' subtle drift · 'thinking' shrink+vortex. */
  state?: ConstellationState
  /** Flat single-hue (default) or per-dot gradient (≥96px). */
  gradient?: boolean
  className?: string
  ariaLabel?: string
}

function metaballPath(
  c1: { x: number; y: number },
  r1: number,
  c2: { x: number; y: number },
  r2: number,
  v = 0.5,
  handle = 2.4,
): Path2D | null {
  const dx = c2.x - c1.x
  const dy = c2.y - c1.y
  const d = Math.hypot(dx, dy)
  if (d === 0 || d > 2.6 * (r1 + r2) || d <= Math.abs(r1 - r2)) return null
  let u1 = 0
  let u2 = 0
  if (d < r1 + r2) {
    u1 = Math.acos(Math.min(1, Math.max(-1, (r1 * r1 + d * d - r2 * r2) / (2 * r1 * d))))
    u2 = Math.acos(Math.min(1, Math.max(-1, (r2 * r2 + d * d - r1 * r1) / (2 * r2 * d))))
  }
  const angBetween = Math.atan2(dy, dx)
  const maxSpread = Math.acos(Math.min(1, Math.max(-1, (r1 - r2) / d)))
  const a1 = angBetween + u1 + (maxSpread - u1) * v
  const a2 = angBetween - u1 - (maxSpread - u1) * v
  const a3 = angBetween + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v
  const a4 = angBetween - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v
  const p = (c: { x: number; y: number }, r: number, a: number) => ({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) })
  const p1 = p(c1, r1, a1)
  const p2 = p(c1, r1, a2)
  const p3 = p(c2, r2, a3)
  const p4 = p(c2, r2, a4)
  const total = r1 + r2
  const d2 = Math.min(v * handle, Math.hypot(p1.x - p3.x, p1.y - p3.y) / total) * Math.min(1, (d * 2) / total)
  const h1 = r1 * d2
  const h2 = r2 * d2
  const path = new Path2D()
  path.moveTo(p1.x, p1.y)
  path.bezierCurveTo(
    p1.x + h1 * Math.cos(a1 - Math.PI / 2),
    p1.y + h1 * Math.sin(a1 - Math.PI / 2),
    p3.x + h2 * Math.cos(a3 + Math.PI / 2),
    p3.y + h2 * Math.sin(a3 + Math.PI / 2),
    p3.x,
    p3.y,
  )
  path.lineTo(p4.x, p4.y)
  path.bezierCurveTo(
    p4.x + h2 * Math.cos(a4 - Math.PI / 2),
    p4.y + h2 * Math.sin(a4 - Math.PI / 2),
    p2.x + h1 * Math.cos(a2 + Math.PI / 2),
    p2.y + h1 * Math.sin(a2 + Math.PI / 2),
    p2.x,
    p2.y,
  )
  path.closePath()
  return path
}

export function ConstellationField({ size = 40, state = 'idle', gradient = false, className, ariaLabel = 'Mister' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx0 = canvas.getContext('2d')
    if (!ctx0) return
    const ctx: CanvasRenderingContext2D = ctx0
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    let raf = 0
    let start = 0
    const effState: ConstellationState = reduce ? 'base' : state

    function draw(now: number) {
      if (!start) start = now
      const tt = (now - start) / 1000
      ctx.clearRect(0, 0, size, size)

      // per-dot live position (idle drift / thinking shrink+vortex)
      const scale = effState === 'thinking' ? 0.62 : 1
      const rot = effState === 'thinking' ? tt * 0.4 : 0
      const cx = 0.5
      const cy = 0.5

      const live = DOTS.map((drec, i) => {
        let nx = drec.x
        let ny = drec.y
        if (effState === 'idle') {
          const amp = drec.kind === 'core' ? 0.003 : 0.006
          nx += amp * Math.sin(tt * (0.4 + i * 0.03) + i)
          ny += amp * Math.cos(tt * (0.35 + i * 0.02) + i)
        }
        if (rot) {
          const rx = nx - cx
          const ry = ny - cy
          nx = cx + rx * Math.cos(rot) - ry * Math.sin(rot)
          ny = cy + rx * Math.sin(rot) + ry * Math.cos(rot)
        }
        // shrink toward centroid on thinking
        nx = cx + (nx - cx) * scale
        ny = cy + (ny - cy) * scale
        return { x: nx * size, y: ny * size, r: drec.r * size * scale, color: gradient ? drec.color : FLAT }
      })

      // bridges first (behind the dots), filled with a gradient between endpoints
      if (effState !== 'thinking') {
        for (const [a, b] of BRIDGES) {
          const A = live[a]
          const B = live[b]
          const path = metaballPath(A, A.r, B, B.r)
          if (!path) continue
          if (gradient) {
            const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y)
            g.addColorStop(0, A.color)
            g.addColorStop(1, B.color)
            ctx.fillStyle = g
          } else {
            ctx.fillStyle = FLAT
          }
          ctx.fill(path)
        }
      }

      // dots
      for (const drec of live) {
        ctx.beginPath()
        ctx.arc(drec.x, drec.y, drec.r, 0, Math.PI * 2)
        ctx.fillStyle = drec.color
        ctx.fill()
      }

      if (effState !== 'base') raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [size, state, gradient])

  return <canvas ref={ref} role="img" aria-label={ariaLabel} className={className} style={{ width: size, height: size }} />
}
