// src/lib/costing/export-engine.ts
// Export-cost engine for the ORIGIN archetype (root CLAUDE.md §3 — the buyer buys
// provenance + documentation OUTBOUND; unit = per container / per certificate).
// This is the OUTBOUND counterpart to the SUNAT import engine: an export sale
// carries NO destination import duties/IGV (exports are zero-rated at origin), so
// the math is a transparent cost BUILD-UP by Incoterm, then a margin — not the
// import engine's tax chain. Kept pure + unit-tested (export-engine.test.ts).
//
// decimal.js is the sanctioned numeric core here too (same money discipline as
// the import engine); integer-minor conversion happens at the persistence
// boundary, never in this module.
import Decimal from 'decimal.js'

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP })

function d(n: number): Decimal {
  return new Decimal(n)
}
function r2(x: Decimal): Decimal {
  return x.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}
function r6(x: Decimal): Decimal {
  return x.toDecimalPlaces(6, Decimal.ROUND_HALF_UP)
}
function num(x: Decimal): number {
  return x.toNumber()
}

/** Incoterm the seller quotes AT — how far up the chain the seller's price reaches.
 *  EXW: goods only · FOB: through loading at origin · CFR: + int'l freight · CIF:
 *  + insurance. (The ORIGIN lane most often sells FOB or CIF.) */
export type ExportIncoterm = 'EXW' | 'FOB' | 'CFR' | 'CIF'

export interface ExportInputs {
  productName: string
  /** Origin port / country label — provenance is the ORIGIN lane's product. */
  originLabel: string
  /** Incoterm the offer is quoted at. */
  incoterm: ExportIncoterm
  /** Units in the shipment (containers / MT / cartons). ≥1; drives the unit price.
   *  Default 1 → the total IS the unit price. */
  quantity: number
  unitLabel: string

  // ── Cost components (USD major units) ──────────────────────────────────────
  /** Ex-works purchase from the producer (the EXW value). */
  goodsCost: number
  /** Inland haulage: producer → port of loading. */
  inlandFreight: number
  /** Origin terminal handling + loading (THC, stuffing). */
  exportHandling: number
  /** Provenance documentation — certificate of origin, phyto, fumigation,
   *  inspection, legalization. The ORIGIN lane's premium; exhibited, not hidden. */
  documentation: number
  /** Export customs brokerage / agent at origin. */
  customsBrokerageOrigin: number
  /** Any other origin-side charges (bank, courier, misc). */
  otherOriginCharges: number
  /** International ocean/air freight — added only for CFR / CIF. */
  internationalFreight: number
  /** Marine insurance rate (decimal fraction) on the CFR value — added for CIF. */
  insuranceRate: number

  // ── Margin ─────────────────────────────────────────────────────────────────
  marginMode: 'percent' | 'target_price'
  /** Decimal fraction (0.1 = 10%) when marginMode = 'percent'. */
  marginPercent: number
  /** Total offer price (at the chosen Incoterm) when marginMode = 'target_price'. */
  targetOfferPrice: number
}

export interface ExportResult {
  /** Goods only (EXW). */
  exwCost: number
  /** Cost to place goods on board at origin (EXW + inland + handling + docs +
   *  brokerage + other) — the FOB cost, whatever the quoted Incoterm. */
  fobCost: number
  /** FOB + international freight. */
  cfrCost: number
  /** Marine insurance (CIF only; 0 otherwise). */
  insurance: number
  /** CFR + insurance. */
  cifCost: number
  /** The cost at the QUOTED Incoterm — the base the margin is taken on. */
  offerBaseCost: number
  marginRate: number
  marginUSD: number
  /** Total offer price at the quoted Incoterm. */
  offerPrice: number
  /** offerPrice ÷ quantity — the per-container / per-MT number the buyer negotiates. */
  offerPricePerUnit: number
}

/**
 * Export-cost build-up + margin. Pure. The FOB cost is always computed (it is the
 * spine of the chain); CFR/CIF add freight/insurance; the QUOTED Incoterm selects
 * which of {EXW, FOB, CFR, CIF} the margin is applied to. Insurance is levied on
 * the CFR value (freight-inclusive), the common marine-cargo basis.
 */
export function computeExportCost(inputs: ExportInputs): ExportResult {
  const qty = inputs.quantity > 0 ? inputs.quantity : 1

  const exwCost = r2(d(inputs.goodsCost))
  const fobCost = r2(
    exwCost
      .plus(inputs.inlandFreight)
      .plus(inputs.exportHandling)
      .plus(inputs.documentation)
      .plus(inputs.customsBrokerageOrigin)
      .plus(inputs.otherOriginCharges),
  )
  const cfrCost = r2(fobCost.plus(inputs.internationalFreight))
  const insurance = r2(d(inputs.insuranceRate).times(cfrCost))
  const cifCost = r2(cfrCost.plus(insurance))

  const baseByIncoterm: Record<ExportIncoterm, Decimal> = {
    EXW: exwCost,
    FOB: fobCost,
    CFR: cfrCost,
    CIF: cifCost,
  }
  const offerBaseCost = baseByIncoterm[inputs.incoterm]

  let marginRate: number
  let marginUSD: Decimal
  let offerPrice: Decimal
  if (inputs.marginMode === 'target_price') {
    offerPrice = r2(d(inputs.targetOfferPrice))
    marginUSD = r2(offerPrice.minus(offerBaseCost))
    marginRate = offerBaseCost.isZero() ? 0 : num(r6(marginUSD.dividedBy(offerBaseCost)))
  } else {
    marginRate = inputs.marginPercent
    marginUSD = r2(offerBaseCost.times(d(marginRate)))
    offerPrice = r2(offerBaseCost.plus(marginUSD))
  }

  const offerPricePerUnit = r2(offerPrice.dividedBy(qty))

  return {
    exwCost: num(exwCost),
    fobCost: num(fobCost),
    cfrCost: num(cfrCost),
    insurance: num(insurance),
    cifCost: num(cifCost),
    offerBaseCost: num(offerBaseCost),
    marginRate,
    marginUSD: num(marginUSD),
    offerPrice: num(offerPrice),
    offerPricePerUnit: num(offerPricePerUnit),
  }
}

/** Reference defaults — a FOB origin offer, one 40' container, 10% margin. */
export const DEFAULT_EXPORT_INPUTS: ExportInputs = {
  productName: '',
  originLabel: 'Callao, Perú',
  incoterm: 'FOB',
  quantity: 1,
  unitLabel: 'contenedor',
  goodsCost: 18000,
  inlandFreight: 900,
  exportHandling: 450,
  documentation: 350,
  customsBrokerageOrigin: 300,
  otherOriginCharges: 0,
  internationalFreight: 2600,
  insuranceRate: 0.005,
  marginMode: 'percent',
  marginPercent: 0.1,
  targetOfferPrice: 25000,
}
