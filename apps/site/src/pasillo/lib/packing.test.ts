// El Pasillo — the volume math under test.
// These figures reach a supplier. A wrong carton count ends the tool's
// credibility faster than any visual defect.

import { describe, expect, it } from 'vitest'
import {
  CONTAINERS,
  cartonsForM2,
  containerFill,
  lineTotals,
  sumTotals,
  type Quantity,
} from './packing'
import type { Series } from '@/pasillo/types/catalogue'

const base = {
  supplier: 'HUAZHUAN',
  status: 'available' as const,
  pages: ['B02'],
  sku_count: 10,
}

/** 300×300, 15 pcs/ctn, 25 kg/ctn → 1.35 m²/ctn (Flower Sea, Mixed, Black & White) */
const S300: Series = {
  ...base,
  series_uid: 'S300',
  name_raw: '300 series',
  format_mm: [300, 300],
  thickness_mm: 8.8,
  pcs_per_ctn: 15,
  kgs_per_ctn: 25,
  m2_per_ctn: 1.35,
}

/** 150×150, 44 pcs/ctn, 19 kg/ctn → 0.99 m²/ctn (Flat And Matte) */
const S150: Series = {
  ...base,
  series_uid: 'S150',
  name_raw: '150 series',
  format_mm: [150, 150],
  thickness_mm: 9,
  pcs_per_ctn: 44,
  kgs_per_ctn: 19,
  m2_per_ctn: 0.99,
}

const m2 = (value: number): Quantity => ({ value, basis: 'm2' })

describe('cartonsForM2 — always rounds up', () => {
  it('rounds a partial carton up: a fraction of a carton cannot be bought', () => {
    expect(cartonsForM2(100, 1.35)).toBe(75) // 74.07…
  })

  it('does NOT round up an exact fit — the float trap, on a real carton', () => {
    // 48 whole cartons of the 150×150 series is exactly 47.52 m², but in
    // IEEE-754 doubles 47.52 / 0.99 === 48.00000000000001, so a naive ceil
    // sells the buyer a 49th carton they do not need.
    expect(47.52 / 0.99).toBeGreaterThan(48)
    expect(Math.ceil(47.52 / 0.99)).toBe(49)
    expect(cartonsForM2(47.52, 0.99)).toBe(48)
  })

  it('one square metre over a boundary costs a whole carton', () => {
    expect(cartonsForM2(1.35, 1.35)).toBe(1)
    expect(cartonsForM2(1.36, 1.35)).toBe(2)
  })

  it('treats nothing as nothing', () => {
    expect(cartonsForM2(0, 1.35)).toBe(0)
    expect(cartonsForM2(-50, 1.35)).toBe(0)
    expect(cartonsForM2(Number.NaN, 1.35)).toBe(0)
    expect(cartonsForM2(100, 0)).toBe(0)
  })
})

describe('lineTotals — every basis resolves to whole cartons first', () => {
  it('m² basis', () => {
    const t = lineTotals(m2(56.7), S300)
    expect(t.cartons).toBe(42) // 56.7 / 1.35 = 42 exactly
    expect(t.m2).toBe(56.7)
    expect(t.pcs).toBe(630)
    expect(t.kg).toBe(1050)
  })

  it('carton basis is taken literally', () => {
    const t = lineTotals({ value: 42, basis: 'ctn' }, S300)
    expect(t.cartons).toBe(42)
    expect(t.m2).toBe(56.7)
  })

  it('a fractional carton entry still ships whole cartons', () => {
    expect(lineTotals({ value: 41.2, basis: 'ctn' }, S300).cartons).toBe(42)
  })

  it('piece basis rounds up to the carton that contains them', () => {
    // 16 pieces of a 15-piece carton is two cartons, not 1.07
    expect(lineTotals({ value: 16, basis: 'pcs' }, S300).cartons).toBe(2)
    expect(lineTotals({ value: 15, basis: 'pcs' }, S300).cartons).toBe(1)
  })

  it('the 150 series keeps its own packing — series truth is never shared', () => {
    const a = lineTotals(m2(100), S300)
    const b = lineTotals(m2(100), S150)
    expect(a.cartons).toBe(75)
    expect(b.cartons).toBe(102) // 100 / 0.99 = 101.01…
    expect(a.kg).not.toBe(b.kg)
  })

  it('an empty line contributes nothing', () => {
    expect(lineTotals(null, S300)).toEqual({ cartons: 0, m2: 0, pcs: 0, kg: 0 })
    expect(lineTotals(m2(0), S300).cartons).toBe(0)
    expect(lineTotals(m2(Number.NaN), S300).cartons).toBe(0)
  })
})

describe('sumTotals', () => {
  it('counts only lines that order something', () => {
    const real = lineTotals(m2(50), S300)
    const empty = lineTotals(m2(0), S300)
    expect(sumTotals([real, empty]).skus).toBe(1)
  })

  it('adds weights without float drift', () => {
    const many = Array.from({ length: 10 }, () => lineTotals(m2(12.3), S150))
    expect(sumTotals(many).kg).toBe(many[0].kg * 10)
  })

  it('totals across series with different packing', () => {
    const t = sumTotals([lineTotals(m2(56.7), S300), lineTotals(m2(47.52), S150)])
    expect(t.skus).toBe(2)
    expect(t.cartons).toBe(42 + 48)
    expect(t.kg).toBe(42 * 25 + 48 * 19)
  })
})

describe('containerFill — tiles fill by weight', () => {
  it('is empty at zero', () => {
    const f = containerFill(0, '20GP')
    expect(f.containersNeeded).toBe(0)
    expect(f.pct).toBe(0)
    expect(f.remainingKg).toBe(f.payloadKg)
  })

  it('reports the FCL fraction the footer prints', () => {
    const f = containerFill(22560, '20GP') // 0.8 × 28 200
    expect(f.fcl).toBeCloseTo(0.8, 5)
    expect(f.containersNeeded).toBe(1)
  })

  it('does not open a second container for an exact fit', () => {
    const f = containerFill(28200, '20GP')
    expect(f.containersNeeded).toBe(1)
    expect(f.pct).toBe(100)
    expect(f.remainingKg).toBe(0)
  })

  it('opens a second one kilo over, and reports the second box’s space', () => {
    const f = containerFill(28201, '20GP')
    expect(f.containersNeeded).toBe(2)
    expect(f.fcl).toBeGreaterThan(1)
    expect(f.remainingKg).toBe(28199)
  })

  it('a 40GP carries the same payload — the limit is weight, not room', () => {
    // The fact the footer exists to communicate.
    expect(containerFill(28200, '40GP').containersNeeded).toBe(1)
    expect(containerFill(28200, '40GP').payloadKg).toBe(
      containerFill(28200, '20GP').payloadKg,
    )
  })

  it('offers exactly the two boxes this trade books', () => {
    expect(CONTAINERS.map((c) => c.kind)).toEqual(['20GP', '40GP'])
  })
})
