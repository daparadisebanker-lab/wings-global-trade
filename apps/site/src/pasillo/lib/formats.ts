// "¿Qué formato?" — the arithmetic behind the choice.
//
// This is the fix, not a tutorial step. A buyer choosing between 150×150 and
// 300×300 is not confused about where the filter is; they are missing the
// figures that make the choice decidable. A tour step pointing at the format
// chips would have taught the location of a control they had already found.
//
// WHAT THIS WILL NOT DO. It states no recommendation — not "150 suits bathrooms",
// not "300 reads calmer in a large room". The supplier prints piece counts,
// weights and coverage; they print nothing about application, and neither does
// this. Every figure below is arithmetic on a printed value, and the buyer's
// architect already decided the aesthetic. What they cannot get anywhere else is
// what the format costs to lay, to handle and to ship.

import { SERIES } from '@/pasillo/data/catalogue'
import { CONTAINERS } from '@/pasillo/lib/packing'

export interface FormatFacts {
  /** "150×150" */
  format: string
  tileMm: number
  /** distinct series carrying this format */
  seriesCount: number
  skuCount: number
  /** pieces to lay one m² — 1 / (edge²) */
  piecesPerM2: number
  /** the packing a buyer most often meets, by SKU count, not by convenience */
  m2PerCtn: number
  kgPerCtn: number
  pcsPerCtn: number
  /** cartons to cover one m², whole cartons — the number that gets ordered */
  cartonsPerM2: number
  /** at the payload limit */
  cartonsAtLimit: number
  m2AtLimit: number
  piecesAtLimit: number
}

const PAYLOAD_KG = CONTAINERS[0].payload

/**
 * One row per format the catalogue actually carries — derived, never typed, so
 * a pipeline run that adds a 600×600 adds a row here and to every surface that
 * reads this.
 *
 * The packing quoted is the DOMINANT one: the packing carried by the most SKUs
 * in that format, not the lightest or the most flattering. A buyer comparing
 * formats should be shown the carton they are most likely to actually receive.
 */
export const FORMAT_FACTS: FormatFacts[] = (() => {
  const byFormat = new Map<string, typeof SERIES>()
  for (const s of SERIES) {
    const k = s.format_mm.join('×')
    const list = byFormat.get(k)
    if (list) list.push(s)
    else byFormat.set(k, [s])
  }

  return [...byFormat.entries()]
    .map(([format, series]) => {
      // Dominant packing = the one the most SKUs ship in.
      const packs = new Map<string, { s: (typeof series)[number]; skus: number }>()
      for (const s of series) {
        const k = `${s.pcs_per_ctn}|${s.kgs_per_ctn}`
        const p = packs.get(k)
        if (p) p.skus += s.sku_count
        else packs.set(k, { s, skus: s.sku_count })
      }
      const dominant = [...packs.values()].sort((a, b) => b.skus - a.skus)[0].s
      const tileMm = dominant.format_mm[0]
      const cartonsAtLimit = Math.floor(PAYLOAD_KG / dominant.kgs_per_ctn)

      return {
        format,
        tileMm,
        seriesCount: series.length,
        skuCount: series.reduce((a, s) => a + s.sku_count, 0),
        piecesPerM2: 1 / (tileMm / 1000) ** 2,
        m2PerCtn: dominant.m2_per_ctn,
        kgPerCtn: dominant.kgs_per_ctn,
        pcsPerCtn: dominant.pcs_per_ctn,
        cartonsPerM2: 1 / dominant.m2_per_ctn,
        cartonsAtLimit,
        m2AtLimit: cartonsAtLimit * dominant.m2_per_ctn,
        piecesAtLimit: cartonsAtLimit * dominant.pcs_per_ctn,
      }
    })
    .sort((a, b) => a.tileMm - b.tileMm)
})()

export const FORMAT_PAYLOAD_KG = PAYLOAD_KG

/**
 * Cartons for a real area, per format — whole cartons, rounded up, because that
 * is what ships. Used by the decision panel's "for my project" line, which is
 * the only part of the comparison a buyer can put their own number into.
 */
export function cartonsFor(area: number, f: FormatFacts): { cartons: number; pieces: number } {
  const cartons = Math.ceil(area / f.m2PerCtn)
  return { cartons, pieces: cartons * f.pcsPerCtn }
}
