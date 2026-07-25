// La Escalera · Rung 3 — the arithmetic.
//
// Spec (LA ESCALERA §RUNG 3): "The math is money math: decimal.js throughout,
// ceil rules unit-tested, every constant (m²/carton, kg/carton, cartons/pallet)
// versioned per SKU. One wrong carton count in front of a buyer ends the tool's
// credibility."
//
// Every number a buyer sees is produced here. Two rules govern this file:
//   1. All arithmetic runs through Decimal. `number` appears only at the boundary.
//   2. Nothing is invented. A constant is either read off the supplier catalog
//      ('catalog'), computed exactly from catalog values ('derived'), or an
//      explicit planning default awaiting supplier confirmation ('assumed').
//      Assumed values are surfaced in the UI and in every export — never hidden.

import Decimal from 'decimal.js'
import { CONTAINER_KINDS, type ContainerKindSpec } from '@wings/trade-ui'

/**
 * Bump when any packing constant or rule below changes. Stamped onto every
 * quote export so a carton count can always be traced to the rules that made it.
 */
export const PACKING_CONSTANTS_VERSION = '2026-07-25.1'

/** Where a packing number came from. Drives the "confirm with supplier" markers. */
export type Provenance = 'catalog' | 'derived' | 'assumed'

export interface TilePacking {
  /** pieces per carton — printed on the catalog series banner */
  pcs_per_carton: number
  /** m² per carton — derived exactly: format_mm area × pcs_per_carton */
  m2_per_carton: number
  /** kg per carton — printed on the catalog series banner */
  kg_per_carton: number
  /** cartons per pallet — see PALLET_CAPACITY_KG; assumed until confirmed */
  cartons_per_pallet: number
  provenance: Record<
    'pcs_per_carton' | 'm2_per_carton' | 'kg_per_carton' | 'cartons_per_pallet',
    Provenance
  >
}

/**
 * Working pallet weight cap, kg.
 *
 * The supplier catalogs give pieces/carton and kg/carton but NOT cartons/pallet.
 * Rather than invent a per-SKU constant and present it as supplier data, pallets
 * are built to a weight cap and the result is flagged `assumed` everywhere it
 * surfaces. Collecting the real per-SKU figure is part of Rung 3's data work
 * (spec: "the prerequisite the spec deliberately forces").
 */
export const PALLET_CAPACITY_KG = 1200

/** Cartons that fit one pallet at PALLET_CAPACITY_KG. Never returns 0. */
export function cartonsPerPallet(kgPerCarton: number): number {
  const kg = new Decimal(kgPerCarton)
  if (!kg.isFinite() || kg.lte(0)) return 1
  return Math.max(1, new Decimal(PALLET_CAPACITY_KG).div(kg).floor().toNumber())
}

/** m² of a single tile face, from its format in millimetres. */
export function tileAreaM2(formatMm: readonly [number, number]): Decimal {
  return new Decimal(formatMm[0]).div(1000).times(new Decimal(formatMm[1]).div(1000))
}

/** m² per carton — exact, from the tile format and the catalog's pcs/carton. */
export function m2PerCarton(
  formatMm: readonly [number, number],
  pcsPerCarton: number,
): number {
  return tileAreaM2(formatMm).times(pcsPerCarton).toDecimalPlaces(4).toNumber()
}

// ── Waste ──────────────────────────────────────────────────────────────────
// Industry defaults, editable per line (spec §RUNG 3: "10% straight lay / 15%
// diagonal or herringbone (industry defaults, editable)").

export interface WastePreset {
  id: 'straight' | 'diagonal'
  pct: number
  label: string
  detail: string
}

export const WASTE_PRESETS: readonly WastePreset[] = [
  // `detail` sits inside a narrow <select> on a phone — it has to fit.
  { id: 'straight', pct: 10, label: 'Recto', detail: 'Recto · 10%' },
  { id: 'diagonal', pct: 15, label: 'Diagonal', detail: 'Diagonal · 15%' },
] as const

export const DEFAULT_WASTE_PCT = 10

// ── The line calculation ───────────────────────────────────────────────────

export interface LineInput {
  /** m² the buyer actually needs to cover. */
  areaM2: number
  /** waste percentage, e.g. 10 or 15. Editable, so validated here. */
  wastePct: number
}

export interface LineTotals {
  /** m² requested, before waste */
  requestedM2: number
  /** m² including the waste allowance */
  withWasteM2: number
  /** cartons to order — ALWAYS rounded up; you cannot buy 11.4 cartons */
  cartons: number
  /** m² actually supplied by that many whole cartons */
  suppliedM2: number
  /** m² supplied beyond the waste-adjusted requirement */
  surplusM2: number
  /** gross weight of those cartons */
  kg: number
  /** pallets those cartons occupy (assumed cartons/pallet) */
  pallets: number
}

const ZERO_LINE: LineTotals = {
  requestedM2: 0,
  withWasteM2: 0,
  cartons: 0,
  suppliedM2: 0,
  surplusM2: 0,
  kg: 0,
  pallets: 0,
}

/** Clamp a user-entered waste percentage into a sane band. */
export function normalizeWastePct(pct: number): Decimal {
  const d = new Decimal(Number.isFinite(pct) ? pct : DEFAULT_WASTE_PCT)
  if (d.lt(0)) return new Decimal(0)
  if (d.gt(100)) return new Decimal(100)
  return d
}

/**
 * The single carton rule. Area + waste, divided by m²/carton, ROUNDED UP.
 * Exported on its own because it is the number the whole tool is judged on.
 */
export function cartonsFor(areaM2: number, wastePct: number, m2Carton: number): number {
  const area = new Decimal(Number.isFinite(areaM2) ? areaM2 : 0)
  const perCarton = new Decimal(m2Carton)
  if (area.lte(0) || !perCarton.isFinite() || perCarton.lte(0)) return 0
  const withWaste = area.times(normalizeWastePct(wastePct).div(100).plus(1))
  return withWaste.div(perCarton).ceil().toNumber()
}

/** Full per-line arithmetic for one tile in the record. */
export function lineTotals(packing: TilePacking, input: LineInput): LineTotals {
  const area = new Decimal(Number.isFinite(input.areaM2) ? input.areaM2 : 0)
  const perCarton = new Decimal(packing.m2_per_carton)
  if (area.lte(0) || !perCarton.isFinite() || perCarton.lte(0)) return ZERO_LINE

  const withWaste = area.times(normalizeWastePct(input.wastePct).div(100).plus(1))
  const cartons = withWaste.div(perCarton).ceil()
  const supplied = cartons.times(perCarton)
  const perPallet = new Decimal(Math.max(1, packing.cartons_per_pallet))

  return {
    requestedM2: area.toDecimalPlaces(2).toNumber(),
    withWasteM2: withWaste.toDecimalPlaces(2).toNumber(),
    cartons: cartons.toNumber(),
    suppliedM2: supplied.toDecimalPlaces(2).toNumber(),
    surplusM2: supplied.minus(withWaste).toDecimalPlaces(2).toNumber(),
    kg: cartons.times(packing.kg_per_carton).toDecimalPlaces(1).toNumber(),
    pallets: cartons.div(perPallet).ceil().toNumber(),
  }
}

// ── Record totals ──────────────────────────────────────────────────────────

export interface RecordTotals {
  lines: number
  cartons: number
  kg: number
  /**
   * Pallets are summed per line, not recomputed on total cartons: in the tile
   * trade a pallet carries one SKU. Mixed pallets exist but are the exception,
   * and assuming them would under-state the pallet count on a real order.
   */
  pallets: number
  suppliedM2: number
}

export function sumTotals(all: readonly LineTotals[]): RecordTotals {
  return all.reduce<RecordTotals>(
    (acc, t) => ({
      lines: acc.lines + (t.cartons > 0 ? 1 : 0),
      cartons: acc.cartons + t.cartons,
      kg: new Decimal(acc.kg).plus(t.kg).toDecimalPlaces(1).toNumber(),
      pallets: acc.pallets + t.pallets,
      suppliedM2: new Decimal(acc.suppliedM2).plus(t.suppliedM2).toDecimalPlaces(2).toNumber(),
    }),
    { lines: 0, cartons: 0, kg: 0, pallets: 0, suppliedM2: 0 },
  )
}

// ── Container fill ─────────────────────────────────────────────────────────
// Tiles fill a container by WEIGHT before volume — the honest note the spec
// insists is printed beside the bar. So the meter is a payload meter.
//
// Payloads come from @wings/trade-ui CONTAINER_KINDS (the ecosystem's shared ISO
// geometry). This app does not keep its own copy — Prime Directive 1.

export type ContainerKind = ContainerKindSpec['kind']

export const ESCALERA_CONTAINERS: readonly ContainerKindSpec[] = CONTAINER_KINDS.filter(
  (k) => k.kind === '20GP' || k.kind === '40GP',
)

export function containerSpec(kind: ContainerKind): ContainerKindSpec {
  const found = CONTAINER_KINDS.find((k) => k.kind === kind)
  if (!found) throw new Error(`unknown container kind: ${kind}`)
  return found
}

export interface ContainerFill {
  kind: ContainerKind
  label: string
  /** maximum payload of the box, kg */
  payloadKg: number
  /** the record's gross weight, kg */
  loadedKg: number
  /**
   * loaded ÷ payload, at full precision. > 1 means the load needs more than one
   * box. Deliberately NOT rounded: rounding 28 201 kg in a 28 200 kg container
   * to 1.0000 would read as "exactly one container" while two are needed.
   */
  ratio: number
  /** ratio clamped to 0..1, for the bar width */
  fillPct: number
  /** whole containers this load needs */
  containersNeeded: number
  /** kg still loadable into the last container before hitting payload */
  remainingKg: number
}

export function containerFill(totalKg: number, kind: ContainerKind): ContainerFill {
  const spec = containerSpec(kind)
  const loaded = new Decimal(Number.isFinite(totalKg) && totalKg > 0 ? totalKg : 0)
  const payload = new Decimal(spec.payload)
  const ratio = loaded.div(payload)
  const needed = loaded.lte(0) ? 0 : ratio.ceil().toNumber()
  const usedInLast = needed <= 1 ? loaded : loaded.minus(payload.times(needed - 1))

  return {
    kind: spec.kind,
    label: spec.label,
    payloadKg: spec.payload,
    loadedKg: loaded.toDecimalPlaces(1).toNumber(),
    ratio: ratio.toNumber(),
    fillPct: Decimal.min(ratio, 1).times(100).toDecimalPlaces(1).toNumber(),
    containersNeeded: needed,
    remainingKg: payload.minus(usedInLast).toDecimalPlaces(1).toNumber(),
  }
}

// ── Formatting ─────────────────────────────────────────────────────────────
// Tabular, es-ES, no currency anywhere in this tool — La Escalera quotes
// quantities so the supplier can quote the price.

const nf = (min: number, max: number) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: min, maximumFractionDigits: max })

export const fmtM2 = (n: number) => nf(2, 2).format(n)
export const fmtInt = (n: number) => nf(0, 0).format(n)
export const fmtKg = (n: number) => nf(0, 0).format(Math.round(n))
/** Percentages go through the same locale as everything else — a stray "35.8%"
 *  next to "10.089 kg" reads as a different number system on the same line. */
export const fmtPct = (n: number) => nf(0, 1).format(n)
