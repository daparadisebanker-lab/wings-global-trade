// src/lib/cif-calculator.ts
// Deterministic CIF estimation engine.
// Formula per /spec/CLAUDE.md + /spec/contributions/finance.md:
//   FOB       = target_price_usd * quantity * (1 + sourcing_margin)
//   Freight   = lookup(source_market, destination_port, container_type)
//   Insurance = (FOB + Freight) * 0.015  (min $150 per shipment)
//   CIF       = FOB + Freight + Insurance
//   Duty      = CIF * duty_rate / 100

import type { CifInput, CifEstimate } from '@/types/accio'
import type { FreeZone } from '@/types/database'
import { lookupDutyRate } from '@/lib/duty-rates'
import { parseQuantityNumeric } from '@/lib/utils'

// --- Sourcing margins by product category — per ENRICHED_SPEC §7 ---
// slug keys: maquinaria-agricola 18%, camiones 15%, buses 15%, equipo-industrial 20%, repuestos 22%
const SOURCING_MARGINS = {
  machinery: 0.18,
  vehicles: 0.15,
  parts: 0.22,
  equipment: 0.2,
} as const

// --- Free zone routing ---
const ZOFRATACNA_COUNTRIES = new Set(['Perú', 'Peru', 'Bolivia'])
const ZOFRI_COUNTRIES = new Set(['Chile', 'Colombia', 'Panamá', 'Panama'])

// --- Free zone savings (% vs. standard corridor) ---
const FREE_ZONE_SAVINGS: Record<FreeZone, number> = {
  ZOFRATACNA: 18.5,
  ZOFRI: 16.2,
}

// --- Default destination ports by country ---
const DEFAULT_PORTS: Record<string, string> = {
  'Perú': 'Callao',
  Peru: 'Callao',
  Bolivia: 'Arica',
  Chile: 'Iquique',
  Colombia: 'Buenaventura',
  'Panamá': 'Balboa',
  Panama: 'Balboa',
  'Costa Rica': 'Limón',
  'R. Dominicana': 'Caucedo',
}

// --- Reference freight rates (USD per 40HC equivalent) by source market ---
// Source: finance.md freight table
const FREIGHT_BASE: Record<string, number> = {
  China: 3200,
  Tailandia: 3000,
  Thailand: 3000,
  'Japón': 3400,
  Japan: 3400,
  Dubai: 3600,
}

const DEFAULT_FREIGHT = 3300

// Minimum insurance per shipment — per finance.md edge case
const MIN_INSURANCE = 150

export function selectFreeZone(country: string): FreeZone {
  if (ZOFRI_COUNTRIES.has(country)) return 'ZOFRI'
  if (ZOFRATACNA_COUNTRIES.has(country)) return 'ZOFRATACNA'
  // Default: ZOFRATACNA (primary Peru corridor)
  return 'ZOFRATACNA'
}

/** Recommend a source market from the HS code chapter. Defaults to China. */
export function recommendSourceMarket(hsCode?: string | null): string {
  if (!hsCode) return 'China'
  const chapter = hsCode.replace(/[^\d]/g, '').slice(0, 2)
  // Vehicles (87) frequently sourced from Japan as alternative; default China.
  if (chapter === '87') return 'China'
  return 'China'
}

/** Pick a sourcing margin by inspecting the product description / HS chapter. */
function selectSourcingMargin(input: CifInput): number {
  const text = `${input.product_description} ${input.hs_code ?? ''}`.toLowerCase()
  const chapter = input.hs_code?.replace(/[^\d]/g, '').slice(0, 2)

  if (/repuesto|filtro|parte|kit|neum|llanta|spare/.test(text)) return SOURCING_MARGINS.parts
  if (
    /camion|camión|bus|volquete|furgon|furgón|tractor|veh|truck/.test(text) ||
    chapter === '87'
  )
    return SOURCING_MARGINS.vehicles
  if (/generador|compresor|montacarga|equipo|planta|bomba/.test(text)) {
    return SOURCING_MARGINS.equipment
  }
  return SOURCING_MARGINS.machinery
}

function defaultPort(country: string): string {
  return DEFAULT_PORTS[country] ?? 'Callao'
}

/** Estimate freight based on source market and quantity (containers). */
function calculateFreight(sourceMarket: string, quantityNumeric: number): number {
  const perContainer = FREIGHT_BASE[sourceMarket] ?? DEFAULT_FREIGHT
  // Heuristic: 1 container per ~10 large units, minimum 1 container.
  const containers = Math.max(1, Math.ceil(quantityNumeric / 10))
  // ZOFRATACNA/ZOFRI add +$200 port-to-zone transfer per finance.md
  return (perContainer + 200) * containers
}

export function calculateCIF(input: CifInput): CifEstimate {
  // Edge case: target_price_usd 0 or null → handled upstream in API
  // Edge case: quantity 0 → handled upstream in API
  const freeZone = selectFreeZone(input.destination_country)
  const sourceMarket = input.source_market ?? recommendSourceMarket(input.hs_code)
  const sourcingMargin = selectSourcingMargin(input)

  const quantityNumeric =
    input.quantity_numeric ?? parseQuantityNumeric(input.quantity)

  // 1. FOB
  const fobEstimate = round2(
    input.target_price_usd * quantityNumeric * (1 + sourcingMargin),
  )

  // 2. Freight
  const freightEstimate = round2(calculateFreight(sourceMarket, quantityNumeric))

  // 3. Insurance — 1.5% of (FOB + Freight), min $150 per finance.md
  const rawInsurance = round2((fobEstimate + freightEstimate) * 0.015)
  const insuranceEstimate = Math.max(rawInsurance, MIN_INSURANCE)

  // 4. CIF
  const cifTotal = round2(fobEstimate + freightEstimate + insuranceEstimate)

  // 5. Duty
  const dutyRate = lookupDutyRate(input.destination_country, input.hs_code)
  const dutyAmount = round2(cifTotal * (dutyRate / 100))

  // 6. Free zone savings
  const freeZoneSavingsPct = FREE_ZONE_SAVINGS[freeZone]

  const methodology = `FOB estimado a partir del precio objetivo (${input.target_price_usd} USD/unidad) por ${quantityNumeric} unidades más margen de sourcing del ${Math.round(
    sourcingMargin * 100,
  )}%. Flete calculado vía ${sourceMarket} + transferencia zona franca (+$200). Seguro 1.5% (cláusula ICC C, mín. USD 150). Arancel ${dutyRate.toFixed(1)}% según país de destino y capítulo arancelario.`

  return {
    free_zone: freeZone,
    source_market: sourceMarket,
    fob_estimate_usd: fobEstimate,
    freight_estimate_usd: freightEstimate,
    insurance_estimate_usd: insuranceEstimate,
    cif_total_usd: cifTotal,
    duty_rate_pct: dutyRate,
    duty_amount_usd: dutyAmount,
    free_zone_savings_pct: freeZoneSavingsPct,
    // Per ENRICHED_SPEC §7 — exact disclaimer text
    disclaimer:
      'Estimado preliminar generado por Mister. Los valores finales de flete, arancel y honorarios se confirman con la propuesta formal de Wings.',
    methodology,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
