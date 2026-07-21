import { describe, it, expect } from 'vitest'
import { buildInputs, COST_DEFAULTS } from './landed-cost'
import { computeImportCost } from '@/lib/costing/engine'

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
