// src/lib/costing/container-freight.ts
// Per-unit international freight, derived from container fill — not typed as a
// flat guess. A model's landed cost used to take "Flete internacional" as a
// single manually-entered number per unit, with no relationship to how many
// units of that model actually fit in the container being booked. If only 2
// units fit a 40HC at $6000/container, the true rate is $3000/unit for a batch
// that divides evenly — and MORE per unit whenever the last container isn't
// full (3 units still needs 2 containers, so $4000/unit, not $3000). This
// module makes that arithmetic explicit so `computeImportCost`'s
// `freightInternational` input reflects it before a quotation is generated.
//
// Packing method: axis-aligned orientation packing (rows × columns × layers)
// against the container's real interior L/W/H — the same method as the public
// cubicaje tool (apps/site/src/lib/cubicaje/fit.ts#fitInContainer), NOT a
// volumetric-ratio estimate. Large rigid cargo (vehicles) rarely fills a
// container by raw CBM ratio — a unit's own length/width constrains how many
// rows fit long before the container's total volume is exhausted (e.g. a
// 4.59m van: only 2 fit a 40HC lengthwise-by-one-across, though a volumetric
// ratio would suggest 4). Container geometry is sourced from `@wings/trade-ui`
// (CONTAINER_KINDS) — the same reference data the cubicaje tool draws from —
// so a costed freight split matches what the tool showed the operator.
import { CONTAINER_KINDS, type ContainerKindSpec } from '@wings/trade-ui'

export type ContainerFreightKind = ContainerKindSpec['kind']

export interface ContainerFreightConfig {
  /** Item box dimensions, millimetres (matches how ops measures a unit). */
  itemLengthMm: number
  itemWidthMm: number
  itemHeightMm: number
  /** Optional per-unit weight, kg. Enables the weight cap. */
  weightEachKg?: number | null
  containerKind: ContainerFreightKind
  /** May the unit be rotated on the floor plane (swap length/width)? */
  rotatable: boolean
  /** May units stack on top of each other? (vehicles/machinery: usually no) */
  stackable: boolean
  /** Booked/quoted freight cost for ONE container of this kind, USD. */
  containerRateUsd: number
  /** Units being shipped in this batch — determines containers needed. */
  quantity: number
}

export interface ContainerFreightResult {
  containerKind: ContainerFreightKind
  containerLabel: string
  /** Units that fit one container — the binding minimum of the packing grid and weight. */
  unitsPerContainer: number
  grid: { alongL: number; alongW: number; layers: number }
  limitedBy: 'volume' | 'weight'
  /** ceil(quantity / unitsPerContainer) — a partially-filled last container still counts whole. */
  containersNeeded: number
  totalFreightUsd: number
  /** totalFreightUsd / quantity, rounded to cents — feeds `freightInternational`. */
  freightPerUnitUsd: number
}

function orientations(
  u: { l: number; w: number; h: number },
  rotatable: boolean,
): Array<{ l: number; w: number; h: number }> {
  const set = [{ l: u.l, w: u.w, h: u.h }]
  if (rotatable) set.push({ l: u.w, w: u.l, h: u.h })
  return set
}

/**
 * Derive per-unit international freight from container fill. Returns null when
 * the geometry is invalid, the item doesn't fit the chosen container at all, or
 * quantity/rate aren't positive — callers must surface a clarification rather
 * than dividing by zero or silently applying a bogus number.
 */
export function computeContainerFreight(input: ContainerFreightConfig): ContainerFreightResult | null {
  const { itemLengthMm, itemWidthMm, itemHeightMm, containerKind, containerRateUsd, quantity } = input
  if (!(itemLengthMm > 0) || !(itemWidthMm > 0) || !(itemHeightMm > 0)) return null
  if (!(quantity > 0) || !(containerRateUsd >= 0)) return null

  const spec = CONTAINER_KINDS.find((c) => c.kind === containerKind)
  if (!spec) return null

  const weightEach = input.weightEachKg && input.weightEachKg > 0 ? input.weightEachKg : null

  let best: {
    count: number
    grid: { alongL: number; alongW: number; layers: number }
    limitedBy: 'volume' | 'weight'
  } | null = null

  for (const o of orientations({ l: itemLengthMm, w: itemWidthMm, h: itemHeightMm }, input.rotatable)) {
    const alongL = Math.floor(spec.l / o.l)
    const alongW = Math.floor(spec.w / o.w)
    const maxLayers = Math.floor(spec.h / o.h)
    const layers = input.stackable ? maxLayers : Math.min(1, maxLayers)
    const volumetricCount = alongL * alongW * layers
    if (volumetricCount <= 0) continue

    let count = volumetricCount
    let limitedBy: 'volume' | 'weight' = 'volume'
    if (weightEach) {
      const byWeight = Math.floor(spec.payload / weightEach)
      if (byWeight < count) {
        count = byWeight
        limitedBy = 'weight'
      }
    }
    if (count <= 0) continue
    if (!best || count > best.count) best = { count, grid: { alongL, alongW, layers }, limitedBy }
  }

  if (!best || best.count <= 0) return null

  const containersNeeded = Math.ceil(quantity / best.count)
  const totalFreightUsd = containersNeeded * containerRateUsd
  const freightPerUnitUsd = Math.round((totalFreightUsd / quantity) * 100) / 100

  return {
    containerKind,
    containerLabel: spec.label,
    unitsPerContainer: best.count,
    grid: best.grid,
    limitedBy: best.limitedBy,
    containersNeeded,
    totalFreightUsd,
    freightPerUnitUsd,
  }
}
