// El Pasillo — the volume math.
//
// A muestrario that totals items but not m² and container fill is not a
// procurement document. This module is what makes it one.
//
// Two rules govern it:
//   1. All arithmetic runs through Decimal. `number` appears only at the
//      boundary. A naive Math.ceil(47.52 / 0.99) returns 49 cartons where the
//      answer is 48 — on a real carton from this catalogue.
//   2. Every constant comes from the series tier, which came off the supplier's
//      printed spec bar. Nothing here is assumed.

import Decimal from 'decimal.js'
// Imported through the package's `/containers` subpath rather than its barrel:
// the barrel re-exports organs that pull in an animation library, and this
// module is on every route.
import { CONTAINER_KINDS, type ContainerKindSpec } from '@wings/trade-ui/containers'
import type { Series } from '@/pasillo/types/catalogue'

/** Bump when any rule below changes. Stamped onto every export. */
export const PACKING_RULES_VERSION = '2026-07-28.1'

/** The basis a quantity was entered in. Stored as entered, never normalised —
 *  switching the footer's basis must not rewrite what the buyer typed. */
export type Basis = 'm2' | 'ctn' | 'pcs'

export interface Quantity {
  value: number
  basis: Basis
}

export interface LineTotals {
  /** cartons to ship — ALWAYS rounded up; a fraction of a carton cannot be bought */
  cartons: number
  /** m² those whole cartons actually supply */
  m2: number
  /** pieces in those cartons */
  pcs: number
  /** gross weight of those cartons */
  kg: number
}

const ZERO: LineTotals = { cartons: 0, m2: 0, pcs: 0, kg: 0 }

/** Cartons needed to cover an area. The number the whole tool is judged on. */
export function cartonsForM2(m2: number, m2PerCtn: number): number {
  const area = new Decimal(Number.isFinite(m2) ? m2 : 0)
  const per = new Decimal(m2PerCtn)
  if (area.lte(0) || !per.isFinite() || per.lte(0)) return 0
  return area.div(per).ceil().toNumber()
}

/**
 * One line of the ledger. Whatever basis the buyer worked in, the shippable
 * unit is a whole carton, so every basis resolves to cartons first and the
 * other figures follow from that — never the other way round.
 */
export function lineTotals(qty: Quantity | null | undefined, series: Series): LineTotals {
  if (!qty || !Number.isFinite(qty.value) || qty.value <= 0) return ZERO
  const v = new Decimal(qty.value)
  const perCtn = new Decimal(series.m2_per_ctn)
  const pcsPerCtn = new Decimal(series.pcs_per_ctn)
  if (!perCtn.isFinite() || perCtn.lte(0) || pcsPerCtn.lte(0)) return ZERO

  let cartons: Decimal
  if (qty.basis === 'ctn') cartons = v.ceil()
  else if (qty.basis === 'pcs') cartons = v.div(pcsPerCtn).ceil()
  else cartons = v.div(perCtn).ceil()

  return {
    cartons: cartons.toNumber(),
    m2: cartons.times(perCtn).toDecimalPlaces(2).toNumber(),
    pcs: cartons.times(pcsPerCtn).toNumber(),
    kg: cartons.times(series.kgs_per_ctn).toDecimalPlaces(1).toNumber(),
  }
}

export interface RecordTotals {
  skus: number
  cartons: number
  m2: number
  pcs: number
  kg: number
}

export function sumTotals(all: readonly LineTotals[]): RecordTotals {
  return all.reduce<RecordTotals>(
    (a, t) => ({
      skus: a.skus + (t.cartons > 0 ? 1 : 0),
      cartons: a.cartons + t.cartons,
      m2: new Decimal(a.m2).plus(t.m2).toDecimalPlaces(2).toNumber(),
      pcs: a.pcs + t.pcs,
      kg: new Decimal(a.kg).plus(t.kg).toDecimalPlaces(1).toNumber(),
    }),
    { skus: 0, cartons: 0, m2: 0, pcs: 0, kg: 0 },
  )
}

// ── Container fill ─────────────────────────────────────────────────────────
// Tiles fill a container by WEIGHT long before volume, so the meter is a
// payload meter and the footer says so. A 40' box does not carry twice the
// tiles of a 20' — it carries the same payload in a longer room.
//
// Payloads come from @wings/trade-ui CONTAINER_KINDS; this app keeps no copy.

export type ContainerKind = ContainerKindSpec['kind']

export const CONTAINERS: readonly ContainerKindSpec[] = CONTAINER_KINDS.filter(
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
  payloadKg: number
  loadedKg: number
  /** loaded ÷ payload, unrounded. 0.8 means "0.8 × 20' FCL". */
  fcl: number
  /** 0–100, clamped, for the bar */
  pct: number
  containersNeeded: number
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
    fcl: ratio.toNumber(),
    pct: Decimal.min(ratio, 1).times(100).toDecimalPlaces(1).toNumber(),
    containersNeeded: needed,
    remainingKg: payload.minus(usedInLast).toDecimalPlaces(1).toNumber(),
  }
}

// ── Formatting ─────────────────────────────────────────────────────────────
// es-ES throughout. No currency anywhere: this tool states quantities so the
// supplier can state the price.

const nf = (min: number, max: number) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: min, maximumFractionDigits: max })

export const fmtM2 = (n: number) => nf(2, 2).format(n)
export const fmtInt = (n: number) => nf(0, 0).format(n)
export const fmtKg = (n: number) => nf(0, 0).format(Math.round(n))
export const fmtFcl = (n: number) => nf(1, 2).format(n)

export const BASIS_LABEL: Record<Basis, string> = {
  m2: 'm²',
  ctn: 'cajas',
  pcs: 'piezas',
}
