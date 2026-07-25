// La Escalera · Rung 3 — the record becomes an order draft.
//
// One derivation, three consumers: the muestrario screen, the WhatsApp message
// and the PDF all read the Quote built here. They must never each do their own
// arithmetic — the number the buyer sees on screen has to be the number the
// supplier receives.

import {
  containerFill,
  lineTotals,
  sumTotals,
  PACKING_CONSTANTS_VERSION,
  type ContainerFill,
  type ContainerKind,
  type LineTotals,
  type RecordTotals,
} from '@/lib/packing'
import type { Buyer, RecordEntry } from '@/lib/record'
import type { Tile } from '@/types/tile'

export interface QuoteLine {
  entry: RecordEntry
  tile: Tile
  totals: LineTotals
  /** true once the buyer has actually asked for an area */
  priced: boolean
}

export interface Quote {
  lines: QuoteLine[]
  /** lines with an area — the ones the supplier can price */
  pricedLines: QuoteLine[]
  totals: RecordTotals
  fill: ContainerFill
  buyer: Buyer
  /** any packing constant on any line that is still an assumption */
  hasAssumedPacking: boolean
  rulesVersion: string
}

export function buildQuote(
  entries: readonly RecordEntry[],
  tilesById: ReadonlyMap<string, Tile>,
  kind: ContainerKind,
): Quote {
  const lines: QuoteLine[] = []

  for (const entry of entries) {
    const tile = tilesById.get(entry.tileId)
    if (!tile) continue // a stale record must never crash the sheet
    const totals = lineTotals(tile.packing, {
      areaM2: entry.areaM2 ?? 0,
      wastePct: entry.wastePct,
    })
    lines.push({ entry, tile, totals, priced: (entry.areaM2 ?? 0) > 0 })
  }

  const pricedLines = lines.filter((l) => l.priced)
  const totals = sumTotals(pricedLines.map((l) => l.totals))

  return {
    lines,
    pricedLines,
    totals,
    fill: containerFill(totals.kg, kind),
    buyer: { name: '', company: '', project: '' },
    hasAssumedPacking: pricedLines.some((l) =>
      Object.values(l.tile.packing.provenance).some((p) => p === 'assumed'),
    ),
    rulesVersion: PACKING_CONSTANTS_VERSION,
  }
}

/** The tile-trade fact the spec insists is printed beside every fill bar. */
export const WEIGHT_NOTE =
  'Los azulejos llenan el contenedor por peso antes que por volumen.'

export const ASSUMED_PALLET_NOTE =
  'Cajas por pallet es un supuesto de planificación (pallet de 1 200 kg): el catálogo del proveedor no lo publica. Confirmar al cotizar.'
