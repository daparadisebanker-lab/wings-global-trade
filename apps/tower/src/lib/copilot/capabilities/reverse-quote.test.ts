import { describe, it, expect } from 'vitest'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ImportInputs } from '@/lib/costing/types'
import {
  MARGIN_TOLERANCE,
  solveSalePriceForMargin,
} from './reverse-quote'

// A realistic base: FOB high enough that the engine's $1000 percent-mode floor
// never binds, so a gross target is achieved exactly.
const base: ImportInputs = { ...DEFAULT_INPUTS, fob: 50000, incoterm: 'FOB' }

/** Recompute the margins the engine reports at a given final sale price. */
function marginsAt(salePriceFinal: number) {
  return computeImportCost({ ...base, marginMode: 'target_price', targetSalePrice: salePriceFinal })
}

describe('solveSalePriceForMargin', () => {
  it('gross: solved price recomputes to the target gross margin', () => {
    const sol = solveSalePriceForMargin(base, 'bruto', 0.25)
    expect(sol.achievedPct).toBeCloseTo(0.25, 6)
    // Recompute from the price alone — the engine agrees within the band.
    const recomputed = marginsAt(sol.salePrice)
    expect(recomputed.margenBrutoPct).toBeCloseTo(0.25, 3)
    expect(sol.salePrice).toBeGreaterThan(sol.result.landedCost)
  })

  it('net-cash: solved price recomputes to the target net-cash margin', () => {
    const target = 0.15
    const sol = solveSalePriceForMargin(base, 'neto_caja', target)
    expect(Math.abs(sol.achievedPct - target)).toBeLessThanOrEqual(MARGIN_TOLERANCE)
    const recomputed = marginsAt(sol.salePrice)
    expect(recomputed.margenNetoCajaPct).toBeCloseTo(target, 2)
  })

  it('net-cash price sits above gross price for the same target (taxes recovered)', () => {
    // Net-cash subtracts recoverable taxes, so hitting the SAME headline % net-cash
    // demands a higher price than hitting it gross.
    const g = solveSalePriceForMargin(base, 'bruto', 0.2)
    const n = solveSalePriceForMargin(base, 'neto_caja', 0.2)
    expect(n.salePrice).toBeGreaterThan(g.salePrice)
  })

  it('is monotonic: a higher target margin yields a higher sale price', () => {
    const lo = solveSalePriceForMargin(base, 'neto_caja', 0.1)
    const hi = solveSalePriceForMargin(base, 'neto_caja', 0.2)
    expect(hi.salePrice).toBeGreaterThan(lo.salePrice)

    const gLo = solveSalePriceForMargin(base, 'bruto', 0.1)
    const gHi = solveSalePriceForMargin(base, 'bruto', 0.3)
    expect(gHi.salePrice).toBeGreaterThan(gLo.salePrice)
  })
})
