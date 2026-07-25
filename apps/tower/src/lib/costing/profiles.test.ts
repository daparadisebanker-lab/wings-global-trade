import { describe, it, expect } from 'vitest'
import {
  GOODS_PROFILES,
  GOODS_PROFILE_ORDER,
  defaultProfileForArchetype,
  inferProfileFromInputs,
  type GoodsProfileId,
} from './profiles'
import { computeImportCost, DEFAULT_INPUTS } from './engine'

describe('goods profiles — registry', () => {
  it('every ordered id resolves to a profile with matching id', () => {
    expect(GOODS_PROFILE_ORDER).toHaveLength(7)
    for (const id of GOODS_PROFILE_ORDER) {
      const p = GOODS_PROFILES[id]
      expect(p).toBeDefined()
      expect(p.id).toBe(id)
      expect(p.identity.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('only vehiculos uses the automotive drivers + fuel/CC ISC; the rest are zero-editable', () => {
    for (const id of GOODS_PROFILE_ORDER) {
      const p = GOODS_PROFILES[id]
      if (id === 'vehiculos') {
        expect(p.vehicleDrivers).toBe(true)
        expect(p.isc).toBe('auto_fuel_cc')
      } else {
        expect(p.vehicleDrivers).toBe(false)
        expect(p.isc).toBe('zero_editable')
      }
    }
  })

  it('identity fields only ever bind the three engine free-text keys', () => {
    const allowed = new Set(['productName', 'brand', 'model'])
    for (const id of GOODS_PROFILE_ORDER) {
      for (const f of GOODS_PROFILES[id].identity) expect(allowed.has(f.key)).toBe(true)
    }
  })
})

describe('goods profiles — archetype default', () => {
  it('maps known archetypes and NEVER defaults to vehicles', () => {
    const cases: Array<[string, GoodsProfileId]> = [
      ['EQUIPMENT', 'maquinaria'],
      ['COMMODITY', 'insumos'],
      ['PROGRAM', 'linea_blanca'],
      ['PROJECT', 'materiales_construccion'],
      ['CREDENTIAL', 'generico'],
      ['ORIGIN', 'insumos'],
      ['ALLOCATION', 'generico'],
    ]
    for (const [a, expected] of cases) {
      expect(defaultProfileForArchetype(a)).toBe(expected)
      expect(defaultProfileForArchetype(a.toLowerCase())).toBe(expected)
    }
    // No archetype ever opens on the automotive form.
    for (const [a] of cases) expect(defaultProfileForArchetype(a)).not.toBe('vehiculos')
  })

  it('falls back to generico for unknown / missing archetype', () => {
    expect(defaultProfileForArchetype('SOMETHING_NEW')).toBe('generico')
    expect(defaultProfileForArchetype(undefined)).toBe('generico')
    expect(defaultProfileForArchetype(null)).toBe('generico')
    expect(defaultProfileForArchetype('')).toBe('generico')
  })
})

describe('goods profiles — reopen inference', () => {
  it('null/undefined ISC → vehicles (the only fuel/CC path); explicit → generic', () => {
    expect(inferProfileFromInputs({ iscRate: null })).toBe('vehiculos')
    expect(inferProfileFromInputs({})).toBe('vehiculos')
    expect(inferProfileFromInputs({ iscRate: 0 })).toBe('generico')
    expect(inferProfileFromInputs({ iscRate: 0.075 })).toBe('generico')
  })
})

describe('goods profiles — engine seam (parity preserved)', () => {
  it('vehicles (no explicit ISC) derive ISC from fuel/CC — gasoline 1500cc > 0', () => {
    // DEFAULT_INPUTS is the parity anchor: gasoline / 1500cc, no iscRate.
    const r = computeImportCost({ ...DEFAULT_INPUTS, iscRate: undefined })
    expect(r.iscRate).toBeCloseTo(0.075, 6)
    expect(r.isc).toBeGreaterThan(0)
  })

  it('a non-vehicle profile passing iscRate 0 carries no ISC', () => {
    const r = computeImportCost({ ...DEFAULT_INPUTS, iscRate: 0 })
    expect(r.iscRate).toBe(0)
    expect(r.isc).toBe(0)
  })
})
