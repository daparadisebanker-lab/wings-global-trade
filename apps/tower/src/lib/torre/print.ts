// src/lib/torre/print.ts
// Mister Torre — the branded print model for a cotización (Loop L1, PDF export). PURE +
// unit-tested. It produces a STRUCTURED print document (not an HTML/hex blob) so the
// print component renders it with semantic tokens (no raw hex escapes the token system,
// QA gate 2) and print-to-PDF over that component gives the branded PDF.
//
// Honesty rides through: a blocked scenario renders '—', and each price carries its
// confidence STATE (not a baked-language label) so an English quote shows the English
// confidence word; an unapprovable payload is flagged so a blocked draft can't masquerade
// as a clean client document.
import { type ConfidenceState, type CotizacionPayload, isApprovable } from './artifacts'

export interface PrintRow {
  label: { es: string; en: string }
  value: string
}

export interface PrintScenario {
  incoterm: string
  /** Landed cost, major units 2dp, or '—' when blocked. */
  landed: string
  unit: string
  /** The confidence STATE — the component renders its label in the viewer's language. */
  confidence: ConfidenceState
}

export interface CotizacionPrintModel {
  brand: string
  /** Cotización version (revisions print distinct documents). */
  version: number
  /** ISO issue date, if the caller supplies one. */
  issuedAt: string | null
  /** false when the payload still has open blockers — the component marks it clearly. */
  approvable: boolean
  title: { es: string; en: string }
  /** Header meta (client, lane, validity, currency, quantity). */
  meta: PrintRow[]
  product: { es: string; en: string; value: string }
  scenarioHeader: { es: string; en: string }[]
  scenarios: PrintScenario[]
  terms: string[]
  /** Confidence states actually present (a legend); component maps to labels. */
  legend: ConfidenceState[]
  /** The §5 Wings trade-document credit, populated ONLY for a non-Wings (endorsed) brand. */
  endorsement: { es: string; en: string } | null
  /** Standing footnotes (not an invoice; wholesale only). */
  footnotes: { es: string; en: string }[]
}

const WINGS = 'Wings Global Trade'

function fmtMinor(m: number | null): string {
  return m === null ? '—' : (m / 100).toFixed(2)
}

/**
 * PURE: assemble the branded print model from a cotización payload. `brand` defaults to
 * Wings; an endorsed/represented brand passes its own name — the §5 "Represented by Wings
 * Global Trade" credit is then populated for the component's footer/colophon (never hero).
 */
export function cotizacionPrintModel(
  p: CotizacionPayload,
  opts: { brand?: string; issuedAt?: string } = {},
): CotizacionPrintModel {
  const brand = opts.brand ?? WINGS
  const meta: PrintRow[] = [
    { label: { es: 'Cliente', en: 'Client' }, value: p.clientName ?? '—' },
    { label: { es: 'Lane', en: 'Lane' }, value: p.laneCode ?? '—' },
    { label: { es: 'Válida hasta', en: 'Valid until' }, value: p.validityUntil },
    { label: { es: 'Moneda', en: 'Currency' }, value: p.currency },
    { label: { es: 'Cantidad', en: 'Quantity' }, value: String(p.quantity) },
  ]

  const scenarios: PrintScenario[] = p.scenarios.map((s) => ({
    incoterm: s.incoterm,
    landed: fmtMinor(s.landedCostMinor),
    unit: fmtMinor(s.unitPriceMinor),
    confidence: s.confidence,
  }))

  // Legend: confidence states actually used, de-duplicated, in order of appearance.
  const seen = new Set<ConfidenceState>()
  const legend: ConfidenceState[] = []
  for (const s of p.scenarios) {
    if (!seen.has(s.confidence)) {
      seen.add(s.confidence)
      legend.push(s.confidence)
    }
  }

  return {
    brand,
    version: p.version,
    issuedAt: opts.issuedAt ?? null,
    approvable: isApprovable(p),
    title: { es: 'Cotización', en: 'Quotation' },
    meta,
    product: { es: 'Producto', en: 'Product', value: p.machine.productName },
    scenarioHeader: [
      { es: 'Incoterm', en: 'Incoterm' },
      { es: 'Costo puesto', en: 'Landed cost' },
      { es: 'Precio unitario', en: 'Unit price' },
      { es: 'Confianza', en: 'Confidence' },
    ],
    scenarios,
    terms: p.terms,
    legend,
    endorsement: brand !== WINGS ? { es: 'Representado por Wings Global Trade', en: 'Represented by Wings Global Trade' } : null,
    footnotes: [
      { es: 'Documento de cotización mayorista. No constituye una factura.', en: 'Wholesale quotation document. Not an invoice.' },
      { es: 'Precios sujetos a confirmación dentro de la validez indicada.', en: 'Prices subject to confirmation within the stated validity.' },
    ],
  }
}
