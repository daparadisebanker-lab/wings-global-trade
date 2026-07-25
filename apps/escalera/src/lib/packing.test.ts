// La Escalera · the carton rules under test.
// Spec §RUNG 3: "ceil rules unit-tested … One wrong carton count in front of a
// buyer ends the tool's credibility."

import { describe, expect, it } from 'vitest'
import {
  cartonsFor,
  cartonsPerPallet,
  containerFill,
  lineTotals,
  m2PerCarton,
  normalizeWastePct,
  sumTotals,
  tileAreaM2,
  type TilePacking,
} from './packing'

const provenance: TilePacking['provenance'] = {
  pcs_per_carton: 'catalog',
  m2_per_carton: 'derived',
  kg_per_carton: 'catalog',
  cartons_per_pallet: 'assumed',
}

/** 300×300 catalog series: 15 pcs/ctn, 25 kg/ctn → 1.35 m²/ctn */
const T300: TilePacking = {
  pcs_per_carton: 15,
  m2_per_carton: 1.35,
  kg_per_carton: 25,
  cartons_per_pallet: 48,
  provenance,
}

/** 150×150 catalog series: 44 pcs/ctn, 19 kg/ctn → 0.99 m²/ctn */
const T150: TilePacking = {
  pcs_per_carton: 44,
  m2_per_carton: 0.99,
  kg_per_carton: 19,
  cartons_per_pallet: 63,
  provenance,
}

describe('m² per carton is derived exactly from the format', () => {
  it('300×300 × 15 pcs = 1.35 m²', () => {
    expect(m2PerCarton([300, 300], 15)).toBe(1.35)
  })
  it('150×150 × 44 pcs = 0.99 m²', () => {
    expect(m2PerCarton([150, 150], 44)).toBe(0.99)
  })
  it('600×600 × 4 pcs = 1.44 m² (the spec’s illustrative carton)', () => {
    expect(m2PerCarton([600, 600], 4)).toBe(1.44)
  })
  it('handles a rectangular format', () => {
    expect(m2PerCarton([200, 100], 20)).toBe(0.4)
    expect(tileAreaM2([200, 100]).toNumber()).toBe(0.02)
  })
})

describe('cartonsFor — always rounds up', () => {
  it('rounds a partial carton up: you cannot buy 11.4 cartons', () => {
    // 100 m² + 10% = 110 → 110 / 1.35 = 81.48… → 82
    expect(cartonsFor(100, 10, 1.35)).toBe(82)
  })

  it('does NOT round up an exact fit — the float trap, on a real catalog carton', () => {
    // The 150×150 series ships 0.99 m²/carton. 48 whole cartons is exactly
    // 47.52 m², but in IEEE-754 doubles 47.52 / 0.99 === 48.00000000000001,
    // so a naive Math.ceil sells the buyer a 49th carton they do not need.
    expect(47.52 / 0.99).toBeGreaterThan(48) // documents the trap
    expect(Math.ceil(47.52 / 0.99)).toBe(49) // what the naive version would quote
    expect(cartonsFor(47.52, 0, 0.99)).toBe(48) // Decimal gets it right
  })

  it('does not round up an exact fit after waste is applied', () => {
    // 5.4 m² + 10% = 5.94 m² = exactly 6 cartons of 0.99 — and (5.4 × 1.1) / 0.99
    // overshoots in float too.
    expect((5.4 * 1.1) / 0.99).toBeGreaterThan(6)
    expect(cartonsFor(5.4, 10, 0.99)).toBe(6)
    expect(cartonsFor(100, 35, 1.35)).toBe(100)
  })

  it('a single square metre over a carton boundary costs a whole carton', () => {
    expect(cartonsFor(1.35, 0, 1.35)).toBe(1)
    expect(cartonsFor(1.36, 0, 1.35)).toBe(2)
  })

  it('treats zero, negative and non-finite area as nothing to order', () => {
    expect(cartonsFor(0, 10, 1.35)).toBe(0)
    expect(cartonsFor(-50, 10, 1.35)).toBe(0)
    expect(cartonsFor(Number.NaN, 10, 1.35)).toBe(0)
  })

  it('refuses to divide by a missing or zero carton size', () => {
    expect(cartonsFor(100, 10, 0)).toBe(0)
    expect(cartonsFor(100, 10, Number.NaN)).toBe(0)
  })
})

describe('waste', () => {
  it('clamps out-of-range percentages instead of producing absurd cartons', () => {
    expect(normalizeWastePct(-5).toNumber()).toBe(0)
    expect(normalizeWastePct(250).toNumber()).toBe(100)
    expect(normalizeWastePct(Number.NaN).toNumber()).toBe(10)
  })

  it('15% diagonal costs more cartons than 10% straight', () => {
    expect(cartonsFor(340, 15, 1.35)).toBeGreaterThan(cartonsFor(340, 10, 1.35))
  })
})

describe('lineTotals', () => {
  it('reports supplied m², surplus, weight and pallets off the ceiled cartons', () => {
    const t = lineTotals(T300, { areaM2: 340, wastePct: 10 })
    // 340 × 1.10 = 374 m² → 374 / 1.35 = 277.03… → 278 cartons
    expect(t.withWasteM2).toBe(374)
    expect(t.cartons).toBe(278)
    expect(t.suppliedM2).toBe(375.3) // 278 × 1.35
    expect(t.surplusM2).toBe(1.3)
    expect(t.kg).toBe(6950) // 278 × 25
    expect(t.pallets).toBe(6) // ceil(278 / 48)
  })

  it('an empty line contributes nothing', () => {
    expect(lineTotals(T300, { areaM2: 0, wastePct: 10 }).cartons).toBe(0)
    expect(lineTotals(T300, { areaM2: 0, wastePct: 10 }).pallets).toBe(0)
  })

  it('never divides by a zero pallet size', () => {
    const broken = { ...T300, cartons_per_pallet: 0 }
    expect(lineTotals(broken, { areaM2: 10, wastePct: 0 }).pallets).toBe(8)
  })
})

describe('sumTotals', () => {
  it('sums pallets per line — a pallet carries one SKU', () => {
    const a = lineTotals(T300, { areaM2: 60, wastePct: 10 }) // 49 cartons → 2 pallets
    const b = lineTotals(T150, { areaM2: 60, wastePct: 10 }) // 67 cartons → 2 pallets
    const total = sumTotals([a, b])
    expect(a.pallets + b.pallets).toBe(total.pallets)
    // recomputing on the combined carton count would understate the pallets
    expect(total.pallets).toBeGreaterThan(Math.ceil((a.cartons + b.cartons) / 63))
  })

  it('counts only lines that actually order something', () => {
    const empty = lineTotals(T300, { areaM2: 0, wastePct: 10 })
    const real = lineTotals(T300, { areaM2: 50, wastePct: 10 })
    expect(sumTotals([empty, real]).lines).toBe(1)
  })

  it('adds weights without float drift', () => {
    const many = Array.from({ length: 10 }, () => lineTotals(T150, { areaM2: 12.3, wastePct: 10 }))
    expect(sumTotals(many).kg).toBe(many[0].kg * 10)
  })
})

describe('containerFill — tiles fill by weight', () => {
  it('is empty at zero', () => {
    const f = containerFill(0, '20GP')
    expect(f.containersNeeded).toBe(0)
    expect(f.fillPct).toBe(0)
    expect(f.remainingKg).toBe(f.payloadKg)
  })

  it('reports part-fill of a single 20GP', () => {
    const f = containerFill(14100, '20GP') // exactly half of 28 200
    expect(f.containersNeeded).toBe(1)
    expect(f.fillPct).toBe(50)
    expect(f.remainingKg).toBe(14100)
  })

  it('does not open a second container for an exact fit', () => {
    const f = containerFill(28200, '20GP')
    expect(f.containersNeeded).toBe(1)
    expect(f.fillPct).toBe(100)
    expect(f.remainingKg).toBe(0)
  })

  it('opens a second container one kilo over, and reports the second box’s space', () => {
    const f = containerFill(28201, '20GP')
    expect(f.containersNeeded).toBe(2)
    expect(f.ratio).toBeGreaterThan(1)
    expect(f.fillPct).toBe(100) // the bar caps; the count carries the overflow
    expect(f.remainingKg).toBe(28199)
  })

  it('a 40GP carries the same payload as a 20GP — the weight limit, not the space', () => {
    // The tile-trade point the spec insists on printing: doubling the box does
    // not double the tiles you can put in it.
    expect(containerFill(28200, '40GP').containersNeeded).toBe(1)
    expect(containerFill(28200, '40GP').fillPct).toBe(100)
  })
})

describe('cartonsPerPallet', () => {
  it('builds pallets to the weight cap', () => {
    expect(cartonsPerPallet(25)).toBe(48) // 1200 / 25
    expect(cartonsPerPallet(19)).toBe(63) // floor(1200 / 19) = 63
  })

  it('never returns zero for an absurd carton weight', () => {
    expect(cartonsPerPallet(5000)).toBe(1)
    expect(cartonsPerPallet(0)).toBe(1)
  })
})
