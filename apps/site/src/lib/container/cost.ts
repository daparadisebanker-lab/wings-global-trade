// src/lib/container/cost.ts
// TS mirror of the canonical SQL cost function container_member_cost_share().
// The DB trigger is the single source of truth on write; this mirror exists
// for display math and pre-write estimates. If you change the formula here,
// change it in the migration in the same commit — they must never diverge.

export interface CostInput {
  slotPriceUsd: number
  slotsClaimed: number
  cbmPerSlot: number
  cbmAllocated: number | null
  overagePerCbmUsd: number | null
}

export interface CostBreakdown {
  base: number
  overageCbm: number
  overage: number
  total: number
}

/**
 * cost_share = slot_price × slots_claimed + overage, where overage bills the
 * CBM above the member's baseline (cbm_per_slot × slots_claimed) at the
 * container's published per-CBM rate. Overage is 0 when no rate is published
 * or allocation is within baseline.
 */
export function computeCostShare(input: CostInput): CostBreakdown {
  const base = round2(input.slotPriceUsd * input.slotsClaimed)
  const baselineCbm = input.cbmPerSlot * input.slotsClaimed

  let overageCbm = 0
  let overage = 0
  if (
    input.cbmAllocated != null &&
    input.overagePerCbmUsd != null &&
    input.cbmAllocated > baselineCbm
  ) {
    overageCbm = round2(input.cbmAllocated - baselineCbm)
    overage = round2(overageCbm * input.overagePerCbmUsd)
  }

  return { base, overageCbm, overage, total: round2(base + overage) }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
