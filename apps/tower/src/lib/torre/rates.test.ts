// src/lib/torre/rates.test.ts
import { describe, it, expect } from 'vitest'
import { resolveFreightRate, type RateRow } from './rates'

const base: RateRow = {
  kind: 'FREIGHT',
  route: 'CN-SHANGHAI>PE-CALLAO',
  mode: 'SEA',
  containerType: '40HC',
  rateMinor: 420000,
  currency: 'USD',
  validFrom: '2026-07-01',
  validTo: '2026-08-31',
  source: 'Demo carrier',
}

describe('resolveFreightRate', () => {
  it('returns null when there is no freight rate', () => {
    expect(resolveFreightRate([], {}, '2026-07-23')).toBeNull()
    expect(resolveFreightRate([{ ...base, kind: 'INSURANCE' }], {}, '2026-07-23')).toBeNull()
  })

  it('resolves a valid rate to USD major with its validUntil', () => {
    const r = resolveFreightRate([base], { mode: 'SEA', containerType: '40HC' }, '2026-07-23')!
    expect(r.rateMajor).toBe(4200) // 420000 / 100
    expect(r.currency).toBe('USD')
    expect(r.source.kind).toBe('rate_table')
    expect(r.source.validUntil).toBe('2026-08-31')
  })

  it('prefers a currently-valid rate over a lapsed one', () => {
    const lapsed: RateRow = { ...base, rateMinor: 999999, validFrom: '2026-01-01', validTo: '2026-06-30' }
    const r = resolveFreightRate([lapsed, base], { mode: 'SEA' }, '2026-07-23')!
    expect(r.rateMajor).toBe(4200) // the valid one, not the lapsed 9999.99
  })

  it('falls back to a lapsed rate (with past validUntil) when nothing is valid — enables the rate-expiry blocker', () => {
    const lapsed: RateRow = { ...base, validFrom: '2026-01-01', validTo: '2026-06-30' }
    const r = resolveFreightRate([lapsed], { mode: 'SEA' }, '2026-07-23')!
    expect(r.rateMajor).toBe(4200)
    expect(r.source.validUntil).toBe('2026-06-30') // in the past → quote-run flags rate-expired
  })

  it('prefers the more specific container match', () => {
    const generic: RateRow = { ...base, containerType: null, rateMinor: 500000 }
    const specific: RateRow = { ...base, containerType: '40HC', rateMinor: 420000 }
    const r = resolveFreightRate([generic, specific], { containerType: '40HC' }, '2026-07-23')!
    expect(r.rateMajor).toBe(4200)
  })

  it('HARD-FILTERS by mode: a LAND rate is never used for a SEA shipment (→ null → rate-missing)', () => {
    const land: RateRow = { ...base, mode: 'LAND', route: 'MX-VERACRUZ>CL-VALPO', containerType: '20GP' }
    expect(resolveFreightRate([land], { mode: 'SEA' }, '2026-07-23')).toBeNull()
  })

  it('HARD-FILTERS by route when specified', () => {
    expect(resolveFreightRate([base], { route: 'OTHER-ROUTE' }, '2026-07-23')).toBeNull()
  })

  it('rejects a non-USD rate (never treated as USD)', () => {
    const eur: RateRow = { ...base, currency: 'EUR', rateMinor: 155000 }
    expect(resolveFreightRate([eur], { mode: 'SEA' }, '2026-07-23')).toBeNull()
  })

  it('excludes a not-yet-effective (future-dated) rate', () => {
    const future: RateRow = { ...base, validFrom: '2026-09-01', validTo: '2026-12-31' }
    expect(resolveFreightRate([future], { mode: 'SEA' }, '2026-07-23')).toBeNull()
  })

  it('is deterministic on a tie: picks the cheaper rate', () => {
    const a: RateRow = { ...base, rateMinor: 450000, source: 'A' }
    const b: RateRow = { ...base, rateMinor: 420000, source: 'B' }
    expect(resolveFreightRate([a, b], { mode: 'SEA' }, '2026-07-23')!.rateMajor).toBe(4200)
    expect(resolveFreightRate([b, a], { mode: 'SEA' }, '2026-07-23')!.rateMajor).toBe(4200)
  })
})
