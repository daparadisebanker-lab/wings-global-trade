// La Escalera — the generated catalog under test.
//
// tiles.ts is machine-written from the printed supplier sheets. These checks are
// what stop a bad regeneration from reaching a buyer: a tile whose photo is
// missing, a duplicated SKU id that would collide in the record, or an
// m²/carton that no longer matches its own format and piece count.

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TILES } from './tiles'
import { cartonsPerPallet, m2PerCarton } from '@/lib/packing'

const PUBLIC = resolve(__dirname, '../../public')

describe('generated catalog', () => {
  it('has every face read off the two catalogs', () => {
    expect(TILES.length).toBe(275)
  })

  it('has unique ids — the record is keyed on them', () => {
    const ids = TILES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ships a card image and a thumbnail for every tile', () => {
    const missing = TILES.filter(
      (t) => !existsSync(resolve(PUBLIC, `.${t.image}`)) || !existsSync(resolve(PUBLIC, `.${t.thumb}`)),
    ).map((t) => t.id)
    expect(missing).toEqual([])
  })

  it('derives m²/carton exactly from format × pieces', () => {
    const wrong = TILES.filter(
      (t) => t.packing.m2_per_carton !== m2PerCarton(t.format_mm, t.packing.pcs_per_carton),
    ).map((t) => `${t.id}: ${t.packing.m2_per_carton}`)
    expect(wrong).toEqual([])
  })

  it('derives cartons/pallet from the pallet weight cap', () => {
    const wrong = TILES.filter(
      (t) => t.packing.cartons_per_pallet !== cartonsPerPallet(t.packing.kg_per_carton),
    ).map((t) => t.id)
    expect(wrong).toEqual([])
  })

  it('has usable packing numbers on every line — a zero here divides by zero', () => {
    for (const t of TILES) {
      expect(t.packing.pcs_per_carton, t.id).toBeGreaterThan(0)
      expect(t.packing.kg_per_carton, t.id).toBeGreaterThan(0)
      expect(t.packing.m2_per_carton, t.id).toBeGreaterThan(0)
      expect(t.packing.cartons_per_pallet, t.id).toBeGreaterThan(0)
      expect(t.format_mm[0], t.id).toBeGreaterThan(0)
      expect(t.format_mm[1], t.id).toBeGreaterThan(0)
      expect(t.thickness_mm, t.id).toBeGreaterThan(0)
    }
  })

  it('names a series and a finish on every card', () => {
    for (const t of TILES) {
      expect(t.series.length, t.id).toBeGreaterThan(0)
      expect(t.finish.length, t.id).toBeGreaterThan(0)
      expect(t.code.length, t.id).toBeGreaterThan(0)
    }
  })

  it('marks cartons/pallet as assumed — it is not published by the supplier', () => {
    for (const t of TILES) {
      expect(t.packing.provenance.cartons_per_pallet, t.id).toBe('assumed')
      expect(t.packing.provenance.pcs_per_carton, t.id).toBe('catalog')
      expect(t.packing.provenance.m2_per_carton, t.id).toBe('derived')
    }
  })

  it('does not invent specs the catalogs never printed', () => {
    // If these ever become populated it must be because real supplier data
    // arrived — not because a model guessed from a photograph.
    for (const t of TILES) {
      expect(t.pei, t.id).toBeUndefined()
      expect(t.slip_rating, t.id).toBeUndefined()
      expect(t.shade_variation, t.id).toBeUndefined()
      expect(t.water_absorption_pct, t.id).toBeUndefined()
    }
  })

  it('keeps pattern-group variants pointing at their printed SKU', () => {
    for (const t of TILES.filter((x) => x.variantOf)) {
      expect(t.id.startsWith(`${t.variantOf}-p`), t.id).toBe(true)
      expect(t.code).toBe(t.variantOf)
    }
  })
})
