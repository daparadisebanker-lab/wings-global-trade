import { describe, it, expect } from 'vitest'
import { buildInputs, buildInputsFrom, COST_DEFAULTS, landedCostCapability, type LandedCostData } from './landed-cost'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { IntelligenceClient } from '@/lib/ai/client'

/** A client that returns a canned extraction, so run() is testable without an LLM. */
function stubClient(json: object): IntelligenceClient {
  return { complete: async () => JSON.stringify(json) } as unknown as IntelligenceClient
}

describe('buildInputsFrom (canvas-seed merge)', () => {
  it('inherits the base and overrides only the stated fields', () => {
    const base = { ...COST_DEFAULTS, fob: 8000, adValoremRate: 0.06, exchangeRate: 3.85 }
    const out = buildInputsFrom(base, { exchangeRate: 3.9 })
    expect(out.fob).toBe(8000) // inherited
    expect(out.adValoremRate).toBe(0.06) // inherited
    expect(out.exchangeRate).toBe(3.9) // overridden
  })
})

describe('landedCostCapability.run — Part B context inheritance', () => {
  it('inherits fob + Ad Valorem from the canvas on a terse follow-up', async () => {
    const client = stubClient({ understood: true, exchangeRate: 3.9 })
    const ctx = { kind: 'costing' as const, inputs: { ...DEFAULT_INPUTS, fob: 8000, adValoremRate: 0.06 } }
    const res = await landedCostCapability.run(client, '¿y si el TC sube a 3.9?', undefined, ctx)
    expect(res.renderer).toBe('landed-cost')
    const data = res.data as LandedCostData
    expect(data.input?.fob).toBe(8000) // inherited (never restated)
    expect(data.input?.adValoremRate).toBe(0.06) // inherited
    expect(data.input?.exchangeRate).toBe(3.9) // overridden by the message
  })

  it('changes freight on a "¿y si el flete sube a 2,500?" follow-up', async () => {
    const client = stubClient({ understood: true, freightInternational: 2500 })
    const ctx = { kind: 'costing' as const, inputs: { ...DEFAULT_INPUTS, fob: 14000 } }
    const res = await landedCostCapability.run(client, '¿y si el flete sube a 2,500?', undefined, ctx)
    const data = res.data as LandedCostData
    expect(data.input?.fob).toBe(14000)
    expect(data.input?.freightInternational).toBe(2500)
  })

  it('still requires a price when there is no canvas to inherit from', async () => {
    const client = stubClient({ understood: true, exchangeRate: 3.9 })
    const res = await landedCostCapability.run(client, '¿y con TC 3.9?', undefined, undefined)
    expect(res.renderer).toBe('text') // bails: no fob anywhere
  })

  it('forces percent margin mode even when the canvas came from a net-cash reverse quote', async () => {
    // A net-cash ReverseQuoteEditor registers marginMode:'target_price' + a pinned price.
    const client = stubClient({ understood: true, marginPercent: 0.15 })
    const ctx = {
      kind: 'costing' as const,
      inputs: { ...DEFAULT_INPUTS, fob: 20000, marginMode: 'target_price' as const, targetSalePrice: 60000 },
    }
    const res = await landedCostCapability.run(client, 'margen 15%', undefined, ctx)
    const data = res.data as LandedCostData
    expect(data.input?.marginMode).toBe('percent') // never inherits target_price
    expect(data.margenBrutoPct).toBeCloseTo(0.15, 2) // the stated margin, honored
  })

  it('a model-emitted fob:0 does not clobber the inherited canvas fob', async () => {
    const client = stubClient({ understood: true, fob: 0 })
    const ctx = { kind: 'costing' as const, inputs: { ...DEFAULT_INPUTS, fob: 8000 } }
    const res = await landedCostCapability.run(client, '¿y con eso?', undefined, ctx)
    const data = res.data as LandedCostData
    expect(data.input?.fob).toBe(8000) // kept, not overwritten with 0
  })
})

describe('landedCostCapability.run — provenance (Scenario Ledger)', () => {
  it('stamps seededFrom with the inherited (deviating, unstated) fields', async () => {
    const client = stubClient({ understood: true, exchangeRate: 3.9 })
    const ctx = {
      kind: 'costing' as const,
      inputs: { ...DEFAULT_INPUTS, fob: 8000, adValoremRate: 0.06 },
      sourceSeq: 2,
    }
    const res = await landedCostCapability.run(client, '¿y si el TC sube a 3.9?', undefined, ctx)
    const data = res.data as LandedCostData
    expect(data.seededFrom?.seq).toBe(2)
    // Ad Valorem was inherited (deviates from default 0, never restated); TC was restated.
    expect(data.seededFrom?.fields).toContain('Ad Val 6.0%')
    expect(data.seededFrom?.fields.some((f) => f.startsWith('TC'))).toBe(false)
  })

  it('has no seededFrom without a canvas context (nothing was inherited)', async () => {
    const client = stubClient({ understood: true, fob: 8000 })
    const res = await landedCostCapability.run(client, 'costea un FOB de 8000', undefined, undefined)
    const data = res.data as LandedCostData
    expect(data.seededFrom).toBeUndefined()
  })

  it('drops provenance when the client sourceSeq is junk', async () => {
    const client = stubClient({ understood: true, exchangeRate: 3.9 })
    const ctx = {
      kind: 'costing' as const,
      inputs: { ...DEFAULT_INPUTS, fob: 8000, adValoremRate: 0.06 },
      sourceSeq: -5,
    }
    const res = await landedCostCapability.run(client, '¿y con TC 3.9?', undefined, ctx)
    const data = res.data as LandedCostData
    expect(data.seededFrom).toBeUndefined()
  })
})

describe('buildInputs', () => {
  it('applies the full Peru-SUNAT defaults when nothing is mentioned', () => {
    const inputs = buildInputs({})
    expect(inputs).toEqual(COST_DEFAULTS)
    // The load-bearing rate defaults must mirror the app.
    expect(inputs.igvRate).toBe(0.18)
    expect(inputs.percepcionRate).toBe(0.035)
    expect(inputs.insuranceRate).toBe(0.015)
    expect(inputs.exchangeRate).toBe(3.7)
    expect(inputs.adValoremRate).toBe(0)
    expect(inputs.incoterm).toBe('FOB')
  })

  it('respects mentioned fields and keeps defaults for the rest', () => {
    const inputs = buildInputs({ fob: 1200, adValoremRate: 0.06, fuelType: 'diesel' })
    expect(inputs.fob).toBe(1200)
    expect(inputs.adValoremRate).toBe(0.06)
    expect(inputs.fuelType).toBe('diesel')
    // Untouched defaults survive.
    expect(inputs.igvRate).toBe(0.18)
    expect(inputs.exchangeRate).toBe(3.7)
  })

  it('never lets undefined/null clobber a default', () => {
    const inputs = buildInputs({ fob: 5000, brand: undefined })
    expect(inputs.fob).toBe(5000)
    expect(inputs.brand).toBe(COST_DEFAULTS.brand)
  })

  it('feeds the shared engine to produce a coherent landed cost', () => {
    const result = computeImportCost(buildInputs({ fob: 14000 }))
    // CIF = FOB + freight(2000) + insurance(1.5% of 16000 = 240) = 16240.
    expect(result.cif).toBe(16240)
    expect(result.landedCost).toBeGreaterThan(result.cif)
    expect(result.cashOutlay).toBeGreaterThan(result.landedCost)
  })
})
