import { describe, it, expect } from 'vitest'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ImportInputs } from '@/lib/costing/types'
import type { IntelligenceClient } from '@/lib/ai/client'
import {
  MARGIN_TOLERANCE,
  solveSalePriceForMargin,
  reverseQuoteCapability,
  type ReverseQuoteData,
} from './reverse-quote'

function stubClient(json: object): IntelligenceClient {
  return { complete: async () => JSON.stringify(json) } as unknown as IntelligenceClient
}

describe('reverseQuoteCapability.run — Part B context inheritance', () => {
  it('inherits incoterm + fuel from the canvas (not clobbered to FOB/gasoline)', async () => {
    const client = stubClient({ understood: true, marginPct: 25 })
    const ctx = {
      kind: 'costing' as const,
      inputs: { ...DEFAULT_INPUTS, fob: 40000, incoterm: 'CIF' as const, fuelType: 'diesel' as const, marginMode: 'percent' as const, marginPercent: 0.2 },
    }
    const res = await reverseQuoteCapability.run(client, '¿y con 25% de margen?', undefined, ctx)
    const data = res.data as ReverseQuoteData
    expect(data.input?.incoterm).toBe('CIF') // inherited, not FOB
    expect(data.input?.fuelType).toBe('diesel') // inherited, not gasoline
    expect(data.input?.fob).toBe(40000) // inherited (fob not restated)
    expect(data.targetPct).toBeCloseTo(0.25) // stated
  })

  it('inherits the gross target margin on a fob-only follow-up', async () => {
    const client = stubClient({ understood: true, fob: 50000 })
    const ctx = {
      kind: 'costing' as const,
      inputs: { ...DEFAULT_INPUTS, fob: 40000, marginMode: 'percent' as const, marginPercent: 0.22 },
    }
    const res = await reverseQuoteCapability.run(client, '¿y sobre un FOB de 50,000?', undefined, ctx)
    const data = res.data as ReverseQuoteData
    expect(data.input?.fob).toBe(50000) // overridden
    expect(data.targetPct).toBeCloseTo(0.22) // inherited
  })

  it('derives neto_caja margin kind from a target_price canvas when the follow-up omits it', async () => {
    // Model restates only the margin %; a target_price canvas means the operator was
    // on a net-cash quote, so the kind should inherit as neto_caja (not default bruto).
    const client = stubClient({ understood: true, marginPct: 12, fob: 45000 })
    const ctx = {
      kind: 'costing' as const,
      inputs: { ...DEFAULT_INPUTS, fob: 40000, marginMode: 'target_price' as const, targetSalePrice: 55000 },
    }
    const res = await reverseQuoteCapability.run(client, '¿y con 12%?', undefined, ctx)
    const data = res.data as ReverseQuoteData
    expect(data.marginKind).toBe('neto_caja')
  })
})

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
