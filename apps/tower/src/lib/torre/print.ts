// src/lib/torre/print.ts
// Mister Torre — the branded print model for a cotización (Loop L1, PDF export). PURE +
// unit-tested. It produces a STRUCTURED print document (not an HTML/hex blob) so the
// print component renders it with semantic tokens (no raw hex escapes the token system,
// QA gate 2) and print-to-PDF over that component gives the branded PDF.
//
// Honesty rides through: a blocked scenario renders '—', and its confidence state is
// shown next to every price — an estimado never looks verified on the page.
import { CONFIDENCE_LABEL, type CotizacionPayload } from './artifacts'

export interface PrintRow {
  label: { es: string; en: string }
  value: string
}

export interface CotizacionPrintModel {
  brand: string
  title: { es: string; en: string }
  /** Header meta (client, lane, validity, currency, quantity). */
  meta: PrintRow[]
  product: { es: string; en: string; value: string }
  scenarioHeader: { es: string; en: string }[]
  /** One row per scenario: [incoterm, landed, unit, confidence-label]. */
  scenarioRows: string[][]
  terms: string[]
  /** Confidence states actually present, with their bilingual labels (a legend). */
  legend: { state: string; label: { es: string; en: string } }[]
  /** Standing footnotes (not an invoice; wholesale only). */
  footnotes: { es: string; en: string }[]
}

function fmtMinor(m: number | null): string {
  return m === null ? '—' : (m / 100).toFixed(2)
}

/**
 * PURE: assemble the branded print model from a cotización payload. `brand` defaults to
 * Wings; an endorsed/represented brand passes its own name (§5 lockup lives in the
 * component footer, never the hero).
 */
export function cotizacionPrintModel(p: CotizacionPayload, brand = 'Wings Global Trade'): CotizacionPrintModel {
  const meta: PrintRow[] = [
    { label: { es: 'Cliente', en: 'Client' }, value: p.clientName ?? '—' },
    { label: { es: 'Lane', en: 'Lane' }, value: p.laneCode ?? '—' },
    { label: { es: 'Válida hasta', en: 'Valid until' }, value: p.validityUntil },
    { label: { es: 'Moneda', en: 'Currency' }, value: p.currency },
    { label: { es: 'Cantidad', en: 'Quantity' }, value: String(p.quantity) },
  ]

  const scenarioRows = p.scenarios.map((s) => [
    s.incoterm,
    fmtMinor(s.landedCostMinor),
    fmtMinor(s.unitPriceMinor),
    CONFIDENCE_LABEL[s.confidence].es,
  ])

  // Legend: only the confidence states actually used (dedup, stable order by appearance).
  const seen = new Set<string>()
  const legend: CotizacionPrintModel['legend'] = []
  for (const s of p.scenarios) {
    if (!seen.has(s.confidence)) {
      seen.add(s.confidence)
      legend.push({ state: s.confidence, label: CONFIDENCE_LABEL[s.confidence] })
    }
  }

  return {
    brand,
    title: { es: 'Cotización', en: 'Quotation' },
    meta,
    product: { es: 'Producto', en: 'Product', value: p.machine.productName },
    scenarioHeader: [
      { es: 'Incoterm', en: 'Incoterm' },
      { es: 'Costo puesto', en: 'Landed cost' },
      { es: 'Precio unitario', en: 'Unit price' },
      { es: 'Confianza', en: 'Confidence' },
    ],
    scenarioRows,
    terms: p.terms,
    legend,
    footnotes: [
      { es: 'Documento de cotización mayorista. No constituye una factura.', en: 'Wholesale quotation document. Not an invoice.' },
      { es: 'Precios sujetos a confirmación dentro de la validez indicada.', en: 'Prices subject to confirmation within the stated validity.' },
    ],
  }
}
