// La Escalera · the tile record type.
//
// Spec §CROSS-CUTTING declares `interface Tile extends Product`. This tool has
// no backend and therefore no canonical Product — the fields below are the tile
// extension written out in full, ready to be re-based on Product when the
// catalog moves server-side.
//
// Optionality here is deliberate and load-bearing. The supplier catalogs give
// format, thickness, finish and packing. They do NOT give PEI, slip rating,
// water absorption or shade variation. Those stay `undefined` rather than being
// invented — the card renders them as "pendiente" and collecting them is part
// of the Rung 3 data work the spec deliberately forces.

import type { TilePacking } from '@/lib/packing'

export type Material = 'porcelain' | 'ceramic' | 'natural' | 'terrazzo'
export type SlipRating = 'R9' | 'R10' | 'R11' | 'R12' | 'R13'
export type ShadeVariation = 'V1' | 'V2' | 'V3' | 'V4'
export type Pei = 1 | 2 | 3 | 4 | 5

export interface Tile {
  /** stable id — the SKU code, suffixed when one code covers many faces */
  id: string
  /** the supplier SKU exactly as printed in the catalog */
  code: string
  /** what the buyer reads on the card */
  name: string
  series: string
  format_mm: [number, number]
  thickness_mm: number
  material?: Material
  /** e.g. "Flat, Matte Surface" — as printed */
  finish: string
  /** the red parenthetical on the catalog: a colour name, or the pattern count */
  note?: string
  slip_rating?: SlipRating
  pei?: Pei
  water_absorption_pct?: number
  shade_variation?: ShadeVariation
  packing: TilePacking
  /** full-bleed card photograph, served from /tiles */
  image: string
  /** 160px face for muestrario rows — a card image behind an 80px row is waste */
  thumb: string
  /** for a SKU that covers N printed pattern faces, the N */
  patterns?: number
  /** when this face is one of a pattern group, the shared SKU's id */
  variantOf?: string
  /** provenance back to the printed page this was read from */
  source: { catalog: 'A' | 'B'; page: string; n: number }
}

/** Short "60×60" style chip. */
export function formatChip(t: Pick<Tile, 'format_mm'>): string {
  return `${t.format_mm[0]}×${t.format_mm[1]}`
}
