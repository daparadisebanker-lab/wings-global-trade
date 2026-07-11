// src/lib/cubicaje/fit.ts
// Container-fit math for the standalone cubicaje tool: axis-aligned
// orientation packing of a unit inside ISO container interiors. Pure,
// display-only estimation — always labeled «estimación», never a stuffing
// plan (Áladín doctrine: no invented precision).

export interface UnitDims {
  /** mm */
  l: number
  w: number
  h: number
  /** kg per unit (0 = unknown) */
  kg: number
}

export interface ContainerKindSpec {
  kind: '20GP' | '40GP' | '40HC'
  label: string
  /** interior mm */
  l: number
  w: number
  h: number
  /** kg */
  payload: number
  cbm: number
}

export const CONTAINER_KINDS: ContainerKindSpec[] = [
  { kind: '20GP', label: "20' Standard", l: 5898, w: 2352, h: 2393, payload: 28200, cbm: 33.2 },
  { kind: '40GP', label: "40' Standard", l: 12032, w: 2352, h: 2393, payload: 28200, cbm: 67.7 },
  { kind: '40HC', label: "40' High Cube", l: 12032, w: 2352, h: 2698, payload: 28500, cbm: 76.4 },
]

export interface FitOptions {
  /** May the unit be rotated on the floor plane (swap length/width)? */
  rotatable: boolean
  /** May units stack on top of each other? (machinery: usually no) */
  stackable: boolean
}

export interface FitResult {
  count: number
  /** chosen orientation in mm along container L / W / H */
  unit: { l: number; w: number; h: number }
  grid: { alongL: number; alongW: number; layers: number }
  volumeUtilization: number
  totalKg: number
  weightBound: boolean
  /** if weight-limited, the volumetric count before the payload cap */
  volumetricCount: number
}

/** All axis-aligned orientations permitted by the options. */
function orientations(u: UnitDims, opts: FitOptions): Array<{ l: number; w: number; h: number }> {
  const set: Array<{ l: number; w: number; h: number }> = [{ l: u.l, w: u.w, h: u.h }]
  if (opts.rotatable) set.push({ l: u.w, w: u.l, h: u.h })
  // Tipping a unit onto its side is never assumed — cargo like machinery
  // and appliances is upright-only. (Future toggle if ever needed.)
  return set
}

export function fitInContainer(
  unit: UnitDims,
  container: ContainerKindSpec,
  opts: FitOptions,
): FitResult | null {
  if (unit.l <= 0 || unit.w <= 0 || unit.h <= 0) return null

  let best: FitResult | null = null
  for (const o of orientations(unit, opts)) {
    const alongL = Math.floor(container.l / o.l)
    const alongW = Math.floor(container.w / o.w)
    const maxLayers = Math.floor(container.h / o.h)
    const layers = opts.stackable ? maxLayers : Math.min(1, maxLayers)
    const volumetricCount = alongL * alongW * layers
    if (volumetricCount <= 0) continue

    let count = volumetricCount
    let weightBound = false
    if (unit.kg > 0) {
      const byWeight = Math.floor(container.payload / unit.kg)
      if (byWeight < count) {
        count = byWeight
        weightBound = true
      }
    }
    if (count <= 0) continue

    const unitVol = (o.l * o.w * o.h) / 1e9
    const result: FitResult = {
      count,
      unit: o,
      grid: { alongL, alongW, layers },
      volumeUtilization: (count * unitVol) / container.cbm,
      totalKg: unit.kg > 0 ? count * unit.kg : 0,
      weightBound,
      volumetricCount,
    }
    if (!best || result.count > best.count) best = result
  }
  return best
}

/** Parse catalog spec strings: «4.115 mm» → 4115 · «4.720 kg» → 4720. */
export function parseSpecNumber(raw: string | undefined | null): number {
  if (!raw) return 0
  const cleaned = raw.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number.parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function dimsFromSpecs(specs: Record<string, string> | null | undefined): UnitDims | null {
  if (!specs) return null
  const l = parseSpecNumber(specs['Longitud'])
  const w = parseSpecNumber(specs['Ancho'])
  const h = parseSpecNumber(specs['Altura'])
  const kg = parseSpecNumber(specs['Peso operativo'] ?? specs['Peso'])
  if (l > 0 && w > 0 && h > 0) return { l, w, h, kg }
  return null
}
