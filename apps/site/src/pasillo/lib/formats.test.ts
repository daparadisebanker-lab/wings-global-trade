// The format comparison is a buying decision made on these numbers. Every one
// of them is arithmetic on a printed figure, and the tests hold that — a
// recommendation, a rounded-for-looks figure or an invented spec reaching this
// panel is the failure mode worth catching.

import { describe, expect, it } from 'vitest'
import { SERIES } from '@/pasillo/data/catalogue'
import { FORMAT_FACTS, FORMAT_PAYLOAD_KG, cartonsFor } from '@/pasillo/lib/formats'

describe('format facts', () => {
  it('carries every format the catalogue has, and only those', () => {
    const printed = new Set(SERIES.map((s) => s.format_mm.join('×')))
    expect(new Set(FORMAT_FACTS.map((f) => f.format))).toEqual(printed)
  })

  it('quotes the DOMINANT packing, not the most flattering one', () => {
    // 300×300 ships 15 pcs / 25 kg on 185 SKUs and 11 pcs / 18,5 kg on 7. The
    // lighter carton makes the format look better and is not what arrives.
    const big = FORMAT_FACTS.find((f) => f.tileMm === 300)!
    expect(big.pcsPerCtn).toBe(15)
    expect(big.kgPerCtn).toBe(25)
  })

  it('derives pieces per m² from the edge, never from a table', () => {
    for (const f of FORMAT_FACTS) {
      expect(f.piecesPerM2).toBeCloseTo(1 / (f.tileMm / 1000) ** 2, 6)
    }
  })

  it('floors cartons at the payload limit — a carton you cannot load is not coverage', () => {
    for (const f of FORMAT_FACTS) {
      expect(f.cartonsAtLimit).toBe(Math.floor(FORMAT_PAYLOAD_KG / f.kgPerCtn))
      expect(f.cartonsAtLimit * f.kgPerCtn).toBeLessThanOrEqual(FORMAT_PAYLOAD_KG)
    }
  })

  it('holds the trade the panel states: small covers more m², in far more pieces', () => {
    const [small, big] = FORMAT_FACTS
    expect(small.tileMm).toBeLessThan(big.tileMm)
    expect(small.m2AtLimit).toBeGreaterThan(big.m2AtLimit)
    expect(small.piecesAtLimit).toBeGreaterThan(big.piecesAtLimit * 3)
  })

  it('rounds a project up to whole cartons, because whole cartons ship', () => {
    const f = FORMAT_FACTS[0]
    // 400 / 1,0125 = 395,06 → 396, never 395.
    expect(cartonsFor(400, f).cartons).toBe(Math.ceil(400 / f.m2PerCtn))
    expect(cartonsFor(400, f).cartons * f.m2PerCtn).toBeGreaterThanOrEqual(400)
  })
})
