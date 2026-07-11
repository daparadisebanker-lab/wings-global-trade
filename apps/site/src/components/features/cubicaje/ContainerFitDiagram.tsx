// src/components/features/cubicaje/ContainerFitDiagram.tsx
// The fit result drawn with the shared iso engine: container silhouette,
// unit boxes packed to true proportion. Blueprint register — this only
// ever renders inside the /cubicaje contained mode (dark ground), so the
// palette is the blueprint one: warm-white lines, gold accents.
// Rendering cap: at most ~120 unit boxes are drawn (the count is the
// number that matters; the drawing shows the pattern honestly).
import { isoBox, isoCanvas } from '@/lib/rb/iso'
import type { ContainerKindSpec, FitResult } from '@/lib/cubicaje/fit'

const INK = 'rgba(248,246,240,0.85)' // warm-white lines on navy
const INK_SOFT = 'rgba(248,246,240,0.35)'
const GOLD = 'var(--livery-gold)'
const GOLD_SOFT = 'rgba(196,147,63,0.18)'

const MAX_DRAWN = 120

export function ContainerFitDiagram({
  container,
  fit,
}: {
  container: ContainerKindSpec
  fit: FitResult
}) {
  const s = 0.052
  const L = container.l * s
  const W = container.w * s
  const H = container.h * s
  const canvas = isoCanvas(L, H, W, 40)
  const o = canvas.origin

  const ul = fit.unit.l * s
  const uw = fit.unit.w * s
  const uh = fit.unit.h * s

  const nodes: React.ReactNode[] = []

  // Units — back-to-front (z desc), bottom-up, front rows last for overlap.
  // Draw order per iso: iterate z (width axis) descending, layers asc, L asc.
  let drawn = 0
  const totalPositions = Math.min(fit.count, MAX_DRAWN)
  outer: for (let iz = fit.grid.alongW - 1; iz >= 0; iz--) {
    for (let iy = 0; iy < fit.grid.layers; iy++) {
      for (let ix = 0; ix < fit.grid.alongL; ix++) {
        // Fill order must match counting order (L → W → layers) so a
        // weight-capped count still draws a sensible pattern.
        const index = iy * fit.grid.alongL * fit.grid.alongW + iz * fit.grid.alongL + ix
        if (index >= fit.count) continue
        if (drawn >= totalPositions) break outer
        drawn++
        const faces = isoBox(o, ix * ul, iy * uh, iz * uw, ul, uh, uw)
        nodes.push(
          <g key={`${ix}-${iy}-${iz}`} data-td-pop fill="rgba(0,12,31,0.65)" stroke={GOLD} strokeWidth="0.8" strokeLinejoin="round">
            <polygon points={faces.top} fill={GOLD_SOFT} />
            <polygon points={faces.right} />
            <polygon points={faces.left} fill="rgba(196,147,63,0.10)" />
          </g>,
        )
      }
    }
  }

  const shell = isoBox(o, 0, 0, 0, L, H, W)

  return (
    <svg
      viewBox={`0 0 ${canvas.width.toFixed(0)} ${canvas.height.toFixed(0)}`}
      role="img"
      aria-label={`${fit.count} unidades en un contenedor ${container.label}`}
      className="w-full"
    >
      {/* container shell — hidden edges dashed, visible edges solid */}
      <path d={shell.outline} fill="none" stroke={INK} strokeWidth="1.3" data-td-draw pathLength={1} />
      <g fill="none" stroke={INK_SOFT} strokeWidth="0.8" strokeDasharray="3 4">
        <polygon points={shell.top} data-td-late />
        <polygon points={shell.left} data-td-late />
      </g>
      {nodes}
      {fit.count > MAX_DRAWN && (
        <text
          x={canvas.width - 8}
          y={16}
          textAnchor="end"
          fontFamily="var(--livery-font-mono), monospace"
          fontSize="13"
          fill={INK_SOFT}
        >
          se dibujan {MAX_DRAWN} de {fit.count}
        </text>
      )}
    </svg>
  )
}
