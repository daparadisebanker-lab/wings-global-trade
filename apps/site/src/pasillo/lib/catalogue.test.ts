// The buyer-facing vocabulary. The supplier prints ten series names and six
// colour names in English; everything a Peruvian contractor reads is Spanish,
// and the RFQ still has to carry the factory's own words. These tests hold that
// contract — including the one place it is deliberately ambiguous.

import { describe, expect, it } from 'vitest'
import { SERIES, SKUS } from '@/pasillo/data/catalogue'
import {
  colourLabel,
  seriesName,
  seriesNameRaw,
  seriesOption,
} from '@/pasillo/lib/catalogue'

describe('series vocabulary', () => {
  it('renames every series the catalogue carries', () => {
    // A missed uid falls back to the printed English silently, which is exactly
    // the bug this file exists to catch when the pipeline adds a series.
    // The English words this catalogue actually prints. "Color" is absent on
    // purpose — it is a Spanish word too, and "Color Puro" is the right answer.
    const ENGLISH = /\b(Series|Glaze|Glazed|Wooden|tile|Flat|Matte|Hand-Painted|Flower|Sea|Black|White|Pure|Mixed|Colored|Geometric|Massed)\b/
    for (const s of SERIES) {
      expect(seriesName(s), s.series_uid).not.toBe(s.name_raw)
      expect(seriesName(s), s.series_uid).not.toMatch(ENGLISH)
    }
  })

  it('keeps the factory name reachable for every renamed series', () => {
    for (const s of SERIES) expect(seriesNameRaw(s)).toBe(s.name_raw)
  })

  it('lets the two "Esmalte Macizo" series share a name, and disambiguates the one place that cannot', () => {
    // The supplier prints "Massed Glaze" at 150 and "Massed Glaze Series" at
    // 300. Both are the same product idea, so both get the same Spanish name;
    // every surface that shows a name also shows the format — except the Lista
    // filter, which is why seriesOption exists.
    const twins = SERIES.filter((s) => seriesName(s) === 'Esmalte Macizo')
    expect(twins).toHaveLength(2)
    expect(new Set(twins.map((s) => s.format_mm.join('×'))).size).toBe(2)
    expect(new Set(twins.map(seriesOption)).size).toBe(2)
  })

  it('gives every series a distinct option label', () => {
    expect(new Set(SERIES.map(seriesOption)).size).toBe(SERIES.length)
  })
})

describe('colour vocabulary', () => {
  it('translates every printed colour name', () => {
    const printed = [...new Set(SKUS.map((s) => s.colour_name).filter(Boolean))]
    expect(printed.length).toBeGreaterThan(0)
    for (const sku of SKUS) {
      if (!sku.colour_name) continue
      expect(colourLabel(sku), sku.colour_name).not.toBe(sku.colour_name)
    }
  })

  it('is null where the supplier printed no colour, rather than inventing one', () => {
    const bare = SKUS.find((s) => !s.colour_name)
    expect(bare).toBeDefined()
    expect(colourLabel(bare!)).toBeNull()
  })
})
