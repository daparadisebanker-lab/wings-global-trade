// src/lib/costing/engine.ts
// Peru SUNAT import-cost engine — a FAITHFUL PORT of wings-operations
// lib/calculations.ts (engine commit c74b60e), validated to fixtures.json
// (185 rows, |Δ| ≤ 0.005) by src/lib/costing/parity.test.ts.
//
// Ported verbatim in logic. `decimal.js` is the sanctioned numeric core here
// (arbitrary-precision decimal — NOT IEEE float): the SUNAT chain rounds at
// ~18 defined points and does a load-bearing soles↔USD round-trip that a naive
// integer rewrite would drift on. Integer-minor conversion happens at the
// persistence boundary (costing action layer), never in this module (SPEC §2.1).
//
// As-coded quirks are replicated on purpose (EXCEL_PARITY.md), NOT "fixed":
//  · `electric` ISC falls through the gasoline CC rule (flagged upstream review)
//  · Bloque 2 (neto real) == Bloque 1 (bruto) by design (recoverable taxes)
//  · Margen Neto de Caja is normally negative during the IGV recovery window
//  · percent-mode marginRate and margenNetoCajaPct are deliberately unrounded
import Decimal from 'decimal.js'
import type { ImportInputs, ImportResult } from './types'

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
function n(x: Decimal): number {
  return x.toNumber()
}

/**
 * ISC rate from fuel + engine displacement. hybrid/diesel → 0; otherwise
 * ≤1400cc → 5%, >1400cc → 7.5%. NOTE (parity): `electric` intentionally falls
 * through to the gasoline CC rule — replicated as-coded; probable upstream
 * review item, not fixed here.
 */
export function deriveISCRate(inputs: Pick<ImportInputs, 'fuelType' | 'engineCC'>): number {
  if (inputs.fuelType === 'hybrid') return 0
  if (inputs.fuelType === 'diesel') return 0
  return inputs.engineCC <= 1400 ? 0.05 : 0.075
}

/** Full SUNAT landed-cost + margin computation. Byte-faithful to the source. */
export function computeImportCost(inputs: ImportInputs): ImportResult {
  const {
    freightZofratacna,
    portExpenses,
    customsAgency,
    handlingStowage,
    igvRate,
    percepcionRate,
    insuranceRate,
    exchangeRate,
    marginMode,
    marginPercent,
    targetSalePrice,
  } = inputs

  const incoterm = inputs.incoterm ?? 'FOB'

  const FOB = d(inputs.fob)
  const freightInt = d(inputs.freightInternational)
  const transOrig = d(inputs.transportOrigin ?? 0)
  const insRate = d(insuranceRate)
  const adVal = d(inputs.adValoremRate)
  const igv = d(igvRate)
  const perc = d(percepcionRate)
  const tc = d(exchangeRate)

  // ── CIF base per Incoterm ────────────────────────────────────────────────
  let cifBase: Decimal
  switch (incoterm) {
    case 'EXW':
      cifBase = r2(FOB.plus(transOrig).plus(freightInt))
      break
    case 'FOB':
      cifBase = r2(FOB.plus(freightInt))
      break
    case 'CFR':
    case 'CIF':
      cifBase = r2(FOB)
      break
    default:
      cifBase = r2(FOB.plus(freightInt))
  }

  const insurance = incoterm === 'CIF' ? d(0) : r2(insRate.times(cifBase))
  const cif = incoterm === 'CIF' ? cifBase : r2(cifBase.plus(insurance))

  // ── Customs duties ───────────────────────────────────────────────────────
  const adValorem = r2(adVal.times(cif))
  const iscRate = deriveISCRate(inputs)
  const isc = r2(d(iscRate).times(cif.plus(adValorem)))

  // ── IGV importación (on CIF+AdVal+ISC, soles → USD round-trip) ───────────
  const dutiableBaseSoles = r2(cif.plus(adValorem).plus(isc).times(tc))
  const igvImportacion = r2(dutiableBaseSoles.times(igv).dividedBy(tc))

  // ── Percepción (of CIF+AdVal+ISC+IGV, soles → USD) ───────────────────────
  const percepcionBaseSoles = r2(cif.plus(adValorem).plus(isc).plus(igvImportacion).times(tc))
  const percepcion = r2(percepcionBaseSoles.times(perc).dividedBy(tc))

  // ── Local logistics ──────────────────────────────────────────────────────
  const gastosVinculados = r2(
    d(freightZofratacna).plus(portExpenses).plus(customsAgency).plus(handlingStowage),
  )

  // ── Landed cost (no recoverable taxes) ──────────────────────────────────
  const landedCost = r2(cif.plus(adValorem).plus(isc).plus(gastosVinculados))

  // ── Cash outlay (includes recoverable advances) ─────────────────────────
  const cashOutlay = r2(landedCost.plus(igvImportacion).plus(percepcion))

  // ── Margin & pricing ─────────────────────────────────────────────────────
  let marginRate: number
  let marginUSD: Decimal
  let salePrice: Decimal

  if (marginMode === 'target_price') {
    const targetExIgv = r2(d(targetSalePrice).dividedBy(d(1).plus(igv)))
    salePrice = targetExIgv
    marginUSD = r2(salePrice.minus(landedCost))
    marginRate = landedCost.isZero() ? 0 : n(r6(marginUSD.dividedBy(landedCost)))
  } else {
    const minByPercent = marginPercent
    const minByUSD = n(landedCost) > 0 ? 1000 / n(landedCost) : 0
    marginRate = Math.max(minByPercent, minByUSD)
    marginUSD = r2(landedCost.times(d(marginRate)))
    salePrice = r2(landedCost.plus(marginUSD))
  }

  const igvVentas = r2(salePrice.times(igv))
  const salePriceFinal = r2(salePrice.plus(igvVentas))
  const igvNetPayable = r2(igvVentas.minus(igvImportacion).times(tc))

  // ── Módulo 7 — tres bloques de margen ────────────────────────────────────
  const margenBruto = n(marginUSD)
  const margenBrutoPct = marginRate

  const impuestosRecuperablesUSD = r2(igvImportacion.plus(percepcion))
  const impuestosRecuperablesPEN = r2(impuestosRecuperablesUSD.times(tc))

  const margenNetoReal = margenBruto
  const margenNetoRealPct = margenBrutoPct

  const margenNetoCaja = n(r2(marginUSD.minus(impuestosRecuperablesUSD)))
  const margenNetoCajaPct = n(landedCost) > 0 ? margenNetoCaja / n(landedCost) : 0

  return {
    insurance: n(insurance),
    cif: n(cif),
    adValorem: n(adValorem),
    iscRate,
    isc: n(isc),
    igvImportacion: n(igvImportacion),
    percepcion: n(percepcion),
    gastosVinculados: n(gastosVinculados),
    landedCost: n(landedCost),
    cashOutlay: n(cashOutlay),
    marginRate,
    marginUSD: n(marginUSD),
    salePrice: n(salePrice),
    igvVentas: n(igvVentas),
    salePriceFinal: n(salePriceFinal),
    igvNetPayable: n(igvNetPayable),
    netProfit: n(marginUSD),
    margenBruto,
    margenBrutoPct,
    impuestosRecuperablesUSD: n(impuestosRecuperablesUSD),
    impuestosRecuperablesPEN: n(impuestosRecuperablesPEN),
    margenNetoReal,
    margenNetoRealPct,
    margenNetoCaja,
    margenNetoCajaPct,
  }
}

/** Reference default inputs (source parity — FOB, gasoline 1500cc, TC 3.70). */
export const DEFAULT_INPUTS: ImportInputs = {
  productName: '',
  brand: 'Toyota',
  model: '',
  fuelType: 'gasoline',
  engineCC: 1500,
  origin: 'china',
  year: 2026,
  incoterm: 'FOB',
  fob: 14000,
  transportOrigin: 0,
  freightInternational: 2000,
  freightZofratacna: 500,
  portExpenses: 375,
  customsAgency: 300,
  handlingStowage: 0,
  adValoremRate: 0,
  igvRate: 0.18,
  percepcionRate: 0.035,
  insuranceRate: 0.015,
  exchangeRate: 3.7,
  marginMode: 'percent',
  marginPercent: 0.1,
  targetSalePrice: 25000,
}
