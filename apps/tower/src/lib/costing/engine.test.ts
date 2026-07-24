// Unit tests for the engine's GENERALIZATION seam (D5) — the parity oracle
// (185 rows) lives in parity.test.ts and is untouched; this file only covers the
// new iscRate-override behavior and the non-automotive path.
import { describe, expect, it } from 'vitest'
import { computeImportCost, deriveISCRate, DEFAULT_INPUTS } from './engine'
import type { ImportInputs } from './types'

describe('deriveISCRate — automotive rule (parity-locked)', () => {
  it('hybrid and diesel are ISC-free regardless of displacement', () => {
    expect(deriveISCRate({ fuelType: 'hybrid', engineCC: 2000 })).toBe(0)
    expect(deriveISCRate({ fuelType: 'diesel', engineCC: 900 })).toBe(0)
  })
  it('gasoline steps 5% ≤1400cc, 7.5% above; electric falls through the CC rule', () => {
    expect(deriveISCRate({ fuelType: 'gasoline', engineCC: 1400 })).toBe(0.05)
    expect(deriveISCRate({ fuelType: 'gasoline', engineCC: 1401 })).toBe(0.075)
    expect(deriveISCRate({ fuelType: 'electric', engineCC: 1500 })).toBe(0.075) // as-coded quirk
  })
})

describe('deriveISCRate — generalization (D5)', () => {
  it('an explicit iscRate wins over the fuel/CC rule', () => {
    // A >1400cc gasoline vehicle would derive 7.5%, but an explicit 0 overrides.
    expect(deriveISCRate({ fuelType: 'gasoline', engineCC: 2000, iscRate: 0 })).toBe(0)
    // A statutory ISC for an ISC-bearing good (e.g. spirits) passes straight through.
    expect(deriveISCRate({ iscRate: 0.2 })).toBe(0.2)
  })
  it('a non-automotive input (no fuel/CC, no override) is ISC-free', () => {
    expect(deriveISCRate({})).toBe(0)
    expect(deriveISCRate({ fuelType: undefined, engineCC: undefined })).toBe(0)
  })
})

describe('computeImportCost — non-automotive lane', () => {
  // A COMMODITY-style import: neutral fuel/CC (ignored) + ISC explicitly 0.
  const commodity: ImportInputs = {
    ...DEFAULT_INPUTS,
    fuelType: 'gasoline',
    engineCC: 0,
    iscRate: 0,
    productName: 'Aceite de palma',
    brand: '',
    model: '',
    fob: 10000,
    freightInternational: 1200,
  }
  it('applies zero ISC and still computes CIF, duties, IGV and margin', () => {
    const r = computeImportCost(commodity)
    expect(r.iscRate).toBe(0)
    expect(r.isc).toBe(0)
    expect(r.cif).toBeGreaterThan(0)
    expect(r.landedCost).toBeGreaterThan(0)
    expect(r.salePrice).toBeGreaterThan(r.landedCost)
  })
  it('a positive statutory ISC raises the landed cost vs the ISC-free case', () => {
    const withIsc = computeImportCost({ ...commodity, iscRate: 0.1 })
    const withoutIsc = computeImportCost(commodity)
    expect(withIsc.isc).toBeGreaterThan(0)
    expect(withIsc.landedCost).toBeGreaterThan(withoutIsc.landedCost)
  })
})
