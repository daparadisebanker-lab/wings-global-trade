// Container-fit math — pure, deterministic, SDK-free (so it's unit-tested and
// the copilot never fakes a number). The model's only job is to parse plain
// Spanish into these params; the arithmetic lives here.
//
// Method (honest and stated to the operator): a volumetric estimate with a
// stowage factor, capped by weight. Real stowage never reaches 100% of internal
// volume — boxes don't tessellate perfectly — so we discount by STOWAGE. When a
// per-unit weight is known, the payload cap can bind before volume does; we take
// the smaller of the two and report which limit won.

import type { ContainerKind } from '@/lib/actions/containers-types'

export interface ContainerSpec {
  /** Internal loadable volume, m³. */
  internalCbm: number
  /** Max payload, kg (standard max cargo weight for the kind). */
  payloadKg: number
  label: string
}

/** Standard internal volume + payload by kind. Reference values, not per-unit. */
export const CONTAINER_SPECS: Record<ContainerKind, ContainerSpec> = {
  '20GP': { internalCbm: 33.2, payloadKg: 28200, label: '20GP' },
  '40GP': { internalCbm: 67.7, payloadKg: 28800, label: '40GP' },
  '40HC': { internalCbm: 76.4, payloadKg: 28600, label: '40HC' },
  REEFER: { internalCbm: 59.3, payloadKg: 29000, label: 'REEFER 40' },
}

/** Boxes never fill 100% of internal volume — discount to a realistic stow. */
export const STOWAGE_FACTOR = 0.9

export interface ContainerFitInput {
  /** Item box dimensions in metres. */
  itemLengthM: number
  itemWidthM: number
  itemHeightM: number
  /** Optional per-unit weight, kg. Enables the weight cap. */
  weightEachKg?: number | null
  containerKind: ContainerKind
  /** Optional cargo weight cap, kg (e.g. an operator's "max 22 t"). Defaults to the kind's payload. */
  weightCapKg?: number | null
  /** Optional requested quantity — enables "fits / needs N containers". */
  quantity?: number | null
}

export interface ContainerFitResult {
  containerKind: ContainerKind
  containerLabel: string
  /** Units that fit — the binding minimum of volume and weight. */
  units: number
  unitsByVolume: number
  /** null when no per-unit weight was given. */
  unitsByWeight: number | null
  limitedBy: 'volume' | 'weight'
  itemCbm: number
  /** Percent of internal volume the fitted units occupy (0–100+, rounded). */
  cbmUsedPct: number
  /** Total weight of the fitted units, kg — null when no per-unit weight given. */
  totalWeightKg: number | null
  /** Present only when a quantity was requested. */
  requested?: {
    quantity: number
    fitsInOne: boolean
    containersNeeded: number
  }
}

/**
 * Compute how many item boxes fit a container. Returns null on invalid geometry
 * (non-positive dimension) so callers surface a clarification rather than NaN.
 */
export function computeContainerFit(input: ContainerFitInput): ContainerFitResult | null {
  const { itemLengthM, itemWidthM, itemHeightM, containerKind } = input
  if (!(itemLengthM > 0) || !(itemWidthM > 0) || !(itemHeightM > 0)) return null

  const spec = CONTAINER_SPECS[containerKind]
  if (!spec) return null

  const itemCbm = itemLengthM * itemWidthM * itemHeightM
  const usableCbm = spec.internalCbm * STOWAGE_FACTOR
  const unitsByVolume = Math.max(0, Math.floor(usableCbm / itemCbm))

  const weightEach = input.weightEachKg && input.weightEachKg > 0 ? input.weightEachKg : null
  const weightCap = input.weightCapKg && input.weightCapKg > 0 ? input.weightCapKg : spec.payloadKg
  const unitsByWeight = weightEach ? Math.max(0, Math.floor(weightCap / weightEach)) : null

  const units = unitsByWeight === null ? unitsByVolume : Math.min(unitsByVolume, unitsByWeight)
  const limitedBy: 'volume' | 'weight' =
    unitsByWeight !== null && unitsByWeight < unitsByVolume ? 'weight' : 'volume'

  const cbmUsedPct = Math.round(((units * itemCbm) / spec.internalCbm) * 100)
  const totalWeightKg = weightEach ? Math.round(units * weightEach) : null

  const result: ContainerFitResult = {
    containerKind,
    containerLabel: spec.label,
    units,
    unitsByVolume,
    unitsByWeight,
    limitedBy,
    itemCbm: Math.round(itemCbm * 1000) / 1000,
    cbmUsedPct,
    totalWeightKg,
  }

  if (input.quantity && input.quantity > 0) {
    result.requested = {
      quantity: input.quantity,
      fitsInOne: input.quantity <= units,
      containersNeeded: units > 0 ? Math.ceil(input.quantity / units) : 0,
    }
  }

  return result
}
