// src/lib/quotation/proforma.ts
// The ProformaDocument model — the shape the "Proforma" (proforma invoice)
// renderer consumes. A proforma is an alternate rendering of the SAME quote
// data (tower.quotes / tower_22): exporter + importer parties, the line-item
// table, the IGV split, ports, banking, and notes. NO new money math lives
// here — subtotal/tax/total come from `computeQuotationTotals` (document.ts),
// which is integer minor units + basis points (TOWER Directive 3 / ADR-7). No
// float ever touches money; es-PE grouping happens only at the display layer.
//
// Wholesale only (Prime Directive 2): a proforma is a preliminary invoice for a
// quoted order — never a cart, never a retail unit price. The vocabulary lint
// applies to every string produced here.
import type { CompanyInfo } from './company'
import {
  computeQuotationTotals,
  type IssuedByRep,
  type QuotationLine,
  type QuotationTotals,
} from './document'

// Re-exported so the proforma action/renderer import the line + totals + issuing
// rep shapes from one place, exactly as the quotation document does.
export type { IssuedByRep, QuotationLine, QuotationTotals } from './document'
export { buildIssuedByRep, computeQuotationTotals } from './document'

// ── Trade parties (VENDEDOR / EXPORTADOR · COMPRADOR / IMPORTADOR) ────────────
export interface TradeParty {
  /** Razón social. */
  name: string
  /** RUC (or foreign tax id). */
  taxId?: string | null
  address?: string | null
  city?: string | null
  phone?: string | null
  /** Contacto — the person. */
  contact?: string | null
  email?: string | null
  website?: string | null
}

// ── Bank instructions (DATOS BANCARIOS) ──────────────────────────────────────
export interface BankingDetails {
  bank?: string | null
  accountName?: string | null
  accountUsd?: string | null
  swift?: string | null
  cci?: string | null
}

// ── Commercial conditions (extends the quotation terms with the ports) ───────
export interface ProformaTerms {
  portOfOrigin?: string | null // Puerto de origen
  portOfDestination?: string | null // Puerto de destino
  paymentTerms?: string | null // Forma de pago
  deliveryTime?: string | null // Tiempo de entrega
  validityText?: string | null // Vigencia de la oferta
  warranty?: string | null // Garantía
}

export interface ProformaDocument {
  proformaId: string
  /** PF-WGT-YYYY-NNNN — null until issued. */
  proformaNo: string | null
  status: string
  currency: string
  /** ISO date the proforma was issued. */
  issuedOn: string | null
  /** City of issue (the "Lima, dd-mm-yyyy" dateline). */
  issuedCity: string | null
  /** Human validity, e.g. "15 días". */
  validityLabel: string | null
  incoterm: string | null
  exporter: TradeParty
  importer: TradeParty
  lines: QuotationLine[]
  totals: QuotationTotals
  terms: ProformaTerms
  banking: BankingDetails
  observations: string[]
  issuer: CompanyInfo
  /** Resolved issuing-entity id (see issuers.ts) — which legal entity issued this. */
  issuerId?: string
  /** Document language posture inherited from the resolved entity. */
  locale?: 'es' | 'es-en'
  /** The issuing rep ("Atendido por"), or null → fall back to the company block. */
  issuedBy: IssuedByRep | null
}

// ── Doc number ───────────────────────────────────────────────────────────────

/** PF-WGT-YYYY-NNNN — the proforma reference (mirrors formatQuoteNo). */
export function formatProformaNo(year: number, seq: number): string {
  return `PF-WGT-${year}-${String(seq).padStart(4, '0')}`
}

/**
 * Subtotal / IGV / total for the proforma. A thin alias over the shared
 * quotation math so the proforma NEVER grows its own money code — same integer
 * minor units, same single tax rounding (Directive 3). Kept as a named export
 * for symmetry with the renderer/action.
 */
export function computeProformaTotals(
  lineTotalsMinor: number[],
  taxLabel: string,
  taxBps: number,
  currency: string,
): QuotationTotals {
  return computeQuotationTotals(lineTotalsMinor, taxLabel, taxBps, currency)
}

// ── Defaults (so a proforma always renders in full) ──────────────────────────
// Document content (not tokens), mirroring company.ts + document.ts#DEFAULT_*.
// The exporter block and banking are Wings' own and stable across proformas;
// persisted `terms`/`bill_to`/`observations` override the rest per quote.

export const WINGS_EXPORTER: TradeParty = {
  name: 'WINGS GLOBAL TRADE S.A.C.',
  taxId: '20601234567',
  address: 'Ctra. Panamericana Sur Km. 1303  Mz. Q  Lt. 8-9',
  city: 'Tacna, Perú',
  phone: '+507 6025-07',
  email: 'comercial@wingsglobaltrade.com',
  website: 'wingsglobaltrade.com',
}

export const DEFAULT_BANKING: BankingDetails = {
  bank: 'Banco de Crédito del Perú',
  accountName: 'WINGS GLOBAL TRADE S.A.C.',
  accountUsd: '191-60012345-1-12',
  swift: 'BCPLPEPL',
  cci: '00219100601234511200',
}

export const DEFAULT_PROFORMA_TERMS: ProformaTerms = {
  portOfOrigin: 'Shanghai, China',
  portOfDestination: 'Callao, Perú',
  paymentTerms: '30% de adelanto y 70% antes del embarque',
  deliveryTime: '30 - 45 días calendario después de confirmada la orden.',
  validityText: '15 días calendarios.',
  warranty: '12 meses o 20 000 km (Lo que ocurra primero)',
}

export const DEFAULT_PROFORMA_OBSERVATIONS: string[] = [
  'Los precios están expresados en dólares americanos (USD).',
  'Cualquier variación en costos logísticos, fletes o tipo de cambio podría afectar el precio final.',
]

export const DEFAULT_PROFORMA_TAX_LABEL = 'IGV 18%'
export const DEFAULT_PROFORMA_TAX_BPS = 1800

/** Merge stored proforma terms over the defaults, dropping empty strings. */
export function withDefaultProformaTerms(stored: Partial<ProformaTerms> | null | undefined): ProformaTerms {
  const s = stored ?? {}
  const pick = (v: string | null | undefined, d: string | null): string | null => (v && v.trim() ? v : d)
  return {
    portOfOrigin: pick(s.portOfOrigin, DEFAULT_PROFORMA_TERMS.portOfOrigin ?? null),
    portOfDestination: pick(s.portOfDestination, DEFAULT_PROFORMA_TERMS.portOfDestination ?? null),
    paymentTerms: pick(s.paymentTerms, DEFAULT_PROFORMA_TERMS.paymentTerms ?? null),
    deliveryTime: pick(s.deliveryTime, DEFAULT_PROFORMA_TERMS.deliveryTime ?? null),
    validityText: pick(s.validityText, DEFAULT_PROFORMA_TERMS.validityText ?? null),
    warranty: pick(s.warranty, DEFAULT_PROFORMA_TERMS.warranty ?? null),
  }
}
