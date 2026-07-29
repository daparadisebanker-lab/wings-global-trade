// El Pasillo — reading the two-tier catalogue.
//
// Series truth is stated once and inherited. Nothing here copies a packing
// figure onto a SKU: a SKU that carried its own coverage would eventually
// disagree with its series, and the disagreement would reach a buyer as a wrong
// carton count.

import { SERIES, SKUS } from '@/pasillo/data/catalogue'
import { fmtM2 } from '@/pasillo/lib/packing'
import type { Finish, Relief, Series, Sku } from '@/pasillo/types/catalogue'

export { SERIES, SKUS }

const seriesByUid = new Map(SERIES.map((s) => [s.series_uid, s]))
const skusBySeries = new Map<string, Sku[]>()
for (const sku of SKUS) {
  const list = skusBySeries.get(sku.series_uid)
  if (list) list.push(sku)
  else skusBySeries.set(sku.series_uid, [sku])
}
const skuByUid = new Map(SKUS.map((s) => [s.sku_uid, s]))

export const getSeries = (uid: string): Series | undefined => seriesByUid.get(uid)
export const getSku = (uid: string): Sku | undefined => skuByUid.get(uid)
export const skusOf = (seriesUid: string): Sku[] => skusBySeries.get(seriesUid) ?? []

/** The lane order. Fixed for the life of the catalogue — the aisle never reorders. */
export const LANE: Series[] = SERIES

// ── Spanish surface vocabulary ─────────────────────────────────────────────
// The canonical enums are English because they are data; everything a buyer
// reads is Spanish because the buyer is.

const FINISH_ES: Record<Finish, string> = {
  matte: 'Mate',
  glossy: 'Brillante',
  massed_glaze: 'Esmalte macizo',
}

const RELIEF_ES: Record<Relief, string> = {
  flat: 'Liso',
  sculptured: 'Esculpido',
  uneven: 'Irregular',
  mold: 'Moldeado',
}

/** "Mate · Esculpido" — relief is dropped when it adds nothing. */
export function finishLabel(sku: Sku): string {
  const finish = FINISH_ES[sku.finish]
  return sku.relief === 'flat' ? finish : `${finish} · ${RELIEF_ES[sku.relief]}`
}

/** "1 patrón" / "12 patrones" — the third line of the caption stack. */
export function patternLabel(sku: Sku): string {
  const n = sku.pattern_count
  if (n == null) return 'patrones sin confirmar'
  return n === 1 ? '1 patrón' : `${n} patrones`
}

export const formatLabel = (s: Series): string => `${s.format_mm[0]}×${s.format_mm[1]}`

/** The inverted spec bar's line: series truth, stated once. */
export function specBarLine(s: Series): string {
  return `${s.pcs_per_ctn} PCS/CTN · ${s.kgs_per_ctn} KGS/CTN · ${fmtM2(s.m2_per_ctn)} m²`
}

// ── The series names ───────────────────────────────────────────────────────
// These are the CATEGORIES a buyer navigates by, and the supplier prints all
// ten in English. A Peruvian contractor scanning an aisle for terracotta does
// not read "Flat And Matte Series".
//
// The translation lives HERE and not in the data, for two reasons that are not
// stylistic. data/catalogue.ts is generated — a name written into it is lost on
// the next pipeline run. And `name_raw` still has a job: it is what the factory
// calls the series, so it is what the outbound RFQ must say. The buyer reads
// Spanish; the supplier reads their own catalogue back.
//
// Two series are both printed "Massed Glaze", at 150 and at 300 — and they get
// the SAME Spanish name, deliberately. The format sits directly beneath the
// name on every surface that shows one, so a numeric suffix ("Esmalte Macizo
// 15") would repeat the format in worse words. The one place that shows a name
// with no format is the Lista's series filter, and that dropdown states the
// format itself — see seriesOption().
const SERIES_ES: Record<string, string> = {
  'WGT-HUAZHUAN-FLATANDMATTESERIES-150': 'Liso Mate',
  'WGT-HUAZHUAN-COLOREDGEOMETRICSERIES-150': 'Geométrico en Color',
  'WGT-HUAZHUAN-HANDPAINTEDSERIES-150': 'Pintado a Mano',
  'WGT-HUAZHUAN-MASSEDGLAZE-150': 'Esmalte Macizo',
  'WGT-HUAZHUAN-FLOWERSEASERIES-300': 'Mar de Flores',
  'WGT-HUAZHUAN-MASSEDGLAZESERIES-300': 'Esmalte Macizo',
  'WGT-HUAZHUAN-BLACKWHITESERIES-300': 'Blanco y Negro',
  'WGT-HUAZHUAN-PURECOLORSERIES-300': 'Color Puro',
  'WGT-HUAZHUAN-WOODENTILE-300': 'Símil Madera',
  'WGT-HUAZHUAN-MIXEDSERIES-300': 'Mixta',
}

/**
 * "Esmalte Macizo · 150×150 · 22 diseños" — for the Lista's series filter,
 * the only surface that shows a series name with nothing else beside it. Two
 * series share the name "Esmalte Macizo"; without the format the dropdown
 * would offer the same option twice.
 */
export function seriesOption(s: Series): string {
  return `${seriesName(s)} · ${formatLabel(s)} · ${s.sku_count} diseños`
}

/** What the buyer reads. Falls back to the printed name, never to a blank. */
export function seriesName(s: Series): string {
  return SERIES_ES[s.series_uid] ?? s.name_raw
}

/**
 * What the FACTORY calls it — shown beside the Spanish name wherever a buyer
 * might quote the series back to a supplier, and used verbatim in the RFQ.
 * Null when we have not renamed it, so nothing renders the same string twice.
 */
export function seriesNameRaw(s: Series): string | null {
  return SERIES_ES[s.series_uid] ? s.name_raw : null
}

// The supplier printed six colour names, all English. Same rule: the buyer
// reads Spanish, the RFQ keeps the printed string.
const COLOUR_ES: Record<string, string> = {
  'Blue Green': 'Verde Azulado',
  'Dark Gray': 'Gris Oscuro',
  'Deep Yellow': 'Amarillo Intenso',
  'Earthy Yellow': 'Amarillo Tierra',
  'White Gray': 'Gris Blanco',
  'Zirconium Red': 'Rojo Circonio',
}

/** The supplier's colour name, in Spanish. Null when they printed none. */
export function colourLabel(sku: Sku): string | null {
  if (!sku.colour_name) return null
  return COLOUR_ES[sku.colour_name] ?? sku.colour_name
}

/**
 * A face to show for this SKU at a given position in a repeat.
 *
 *  multi     — N real faces: rotate through them, which is what installation
 *              actually looks like
 *  composite — one printed photo that already contains N variants: repeat it,
 *              never fake a rotation we do not have images for
 *  single    — the one face
 */
export function faceAt(sku: Sku, index: number): string {
  if (sku.face_kind === 'multi' && sku.faces.length > 1) {
    return sku.faces[index % sku.faces.length]
  }
  return sku.faces[0]
}

/** Can the 3×3 honestly show a mixed field, or only a repeated one? */
export const canRandomiseRepeat = (sku: Sku): boolean =>
  sku.face_kind === 'multi' && sku.faces.length > 1

// ── Facet source (colour axis) ─────────────────────────────────────────────
// Only the colour axis is derivable from what we have. Pattern family needs a
// vision pass or supplier classification and is deliberately absent rather than
// guessed — a facet rail that mislabels a tile is worse than one that omits it.

export interface ColourFacet {
  hex: string
  /** the supplier's own name where they printed one */
  name: string | null
  count: number
}

/** Coarse hue buckets over the extracted dominants, for a colour facet. */
export function colourFacets(skus: readonly Sku[] = SKUS): ColourFacet[] {
  const buckets = new Map<string, { hex: string; name: string | null; count: number }>()
  for (const sku of skus) {
    const hex = sku.colours[0]
    if (!hex) continue
    const key = bucketOf(hex)
    const b = buckets.get(key)
    if (b) {
      b.count += 1
      if (!b.name && sku.colour_name) b.name = sku.colour_name
    } else {
      buckets.set(key, { hex, name: sku.colour_name, count: 1 })
    }
  }
  return [...buckets.values()].sort((a, b) => b.count - a.count)
}

function bucketOf(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const light = Math.round(((max + min) / 2 / 255) * 3)
  if (max - min < 24) return `n${light}` // achromatic
  let h = 0
  if (max === r) h = ((g - b) / (max - min)) % 6
  else if (max === g) h = (b - r) / (max - min) + 2
  else h = (r - g) / (max - min) + 4
  return `h${Math.round((((h * 60) + 360) % 360) / 30)}-${light}`
}
