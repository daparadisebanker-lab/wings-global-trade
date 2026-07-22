// @wings/rb-core · diagram.ts
// The RB parametric-diagram geometry contract (RB Console Wave 4 · SPEC §4 / Ch 04
// · root CLAUDE.md §5-bis, R1). Pure + framework-agnostic, exactly like packing.ts
// / tech-sheet.ts: it turns the BOUNDED geometry stored in tower.rb_diagram_specs
// (integer mm + integer counts — never a spec value, never money) into the drawing
// spec the shared `PackingDiagram` organ (@wings/trade-ui) renders. Owns NO app or
// UI import: the mapper output is STRUCTURALLY the organ's `PackingSpec`, so both
// apps feed the same swap-tested organ from one source (Prime Directive 5: numbers
// exhibited from one place, one write path → one read path).
import { fmt } from './packing'

/** The bounded geometry a rep authors — the exact column set of
 *  tower.rb_diagram_specs / public.rb_public_diagrams (tower_41). Package box in
 *  interior mm (length = x, width = z depth, height = y up); the two ALLOCATION
 *  counts; the packing-grid cell counts that split the drawing's visible faces;
 *  a bounded front-face detail mode; an optional caption. No floats, no money. */
export interface RbDiagramGeometry {
  packageLengthMm: number
  packageWidthMm: number
  packageHeightMm: number
  unitsPerPackage: number
  packagesPerSlot: number
  cellsAcross: number
  cellsHigh: number
  cellsDeep: number
  detail: 'rolls' | 'slabs'
  caption?: string | null
}

/** Structural mirror of the @wings/trade-ui `PackingDiagram` prop (`PackingSpec`).
 *  Defined here so rb-core carries no UI dependency; the value is assignable to the
 *  organ's `spec` prop by structural typing (the same "structural subset" idiom
 *  packing.ts uses for RbContainerTemplate). Keep the field set byte-identical to
 *  the organ's `PackingSpec` or the assignment breaks. */
export interface RbPackingDiagramSpec {
  box: { w: number; d: number; h: number }
  cells: { x: number; z: number; y: number }
  detail: 'rolls' | 'slabs'
  title: string
  composition: string
}

/** A positive integer, defensively floored to ≥ min (the DB CHECK already
 *  guarantees > 0, but a fixture / bad row must never crash the drawing). */
function posInt(n: number, min = 1): number {
  const v = Math.floor(Number(n))
  return Number.isFinite(v) && v >= min ? v : min
}

/**
 * Map the bounded geometry to the shared organ's PackingSpec. `title` is the
 * product name (exhibited on the drawing header); the composition line is the
 * caption when authored, otherwise derived from the two counts — the numbers are
 * exhibited either way. Pure: same geometry + title → same spec.
 */
export function packingSpecFromGeometry(g: RbDiagramGeometry, title: string): RbPackingDiagramSpec {
  const caption = g.caption?.trim()
  const composition = caption
    ? caption
    : `${fmt(posInt(g.unitsPerPackage))} u/caja · ${fmt(posInt(g.packagesPerSlot))} cajas/cupo`
  return {
    box: {
      w: posInt(g.packageLengthMm),
      d: posInt(g.packageWidthMm),
      h: posInt(g.packageHeightMm),
    },
    cells: {
      x: posInt(g.cellsAcross),
      z: posInt(g.cellsDeep),
      y: posInt(g.cellsHigh),
    },
    detail: g.detail === 'rolls' ? 'rolls' : 'slabs',
    title,
    composition,
  }
}
