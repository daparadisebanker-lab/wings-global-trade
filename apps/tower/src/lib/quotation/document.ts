// src/lib/quotation/document.ts
// The QuotationDocument model — the shape the official "Cotización" renderer
// consumes — plus the PURE money math behind it. Totals are integer minor units
// and tax is basis points (TOWER Directive 3 / ADR-7): subtotal = Σ line totals,
// tax = subtotal × bps, total = subtotal + tax. No float ever touches a stored
// or displayed amount; the only rounding is inside `applyBps` (lib/money).
//
// This module is presentation-agnostic and DB-agnostic: the server action
// (lib/actions/quotation.ts) assembles a QuotationDocument from persisted rows,
// and the renderer (components/pipeline/quotation-document) draws it.
import { addMinor, applyBps } from '@/lib/money'
import type { CompanyInfo } from './company'

// ── Bill-to (the "Señores" block) ────────────────────────────────────────────
export interface BillTo {
  /** Company / consignee — the "Señores" line. */
  company: string
  /** Tax id (Peru: RUC). Optional — not every buyer is registered. */
  taxId?: string | null
  /** ATENCIÓN — the person the quote is addressed to. */
  attention?: string | null
  /** CONTACTO — email or phone. */
  contact?: string | null
}

// ── Commercial conditions (CONDICIONES COMERCIALES) ──────────────────────────
export interface CommercialTerms {
  paymentTerms?: string | null // Formas de pago
  deliveryTime?: string | null // Tiempos de entrega
  incoterm?: string | null // Incoterm
  warranty?: string | null // Garantía
  validityText?: string | null // Validez de la cotización (prose form)
}

// ── A rendered line ──────────────────────────────────────────────────────────
export interface QuotationLine {
  /** Zero-padded item number, e.g. "01". */
  itemNo: string
  description: string
  quantity: number
  unitPriceMinor: number
  lineTotalMinor: number
  /** Optional product image (hero). Renderer shows a placeholder when absent. */
  imageUrl?: string | null
}

export interface QuotationTotals {
  subtotalMinor: number
  taxLabel: string
  taxBps: number
  taxMinor: number
  totalMinor: number
}

export interface QuotationDocument {
  quoteId: string
  /** null until the quote is issued (a number is minted). */
  quoteNo: string | null
  status: string
  currency: string
  /** ISO date (yyyy-mm-dd) the quote was issued. */
  issuedOn: string | null
  /** ISO date the quote is valid until, if set. */
  validUntil: string | null
  /** Human validity, e.g. "15 días" — derived from validUntil when absent. */
  validityLabel: string | null
  billTo: BillTo
  lines: QuotationLine[]
  totals: QuotationTotals
  terms: CommercialTerms
  observations: string[]
  issuer: CompanyInfo
}

// ── Pure math ────────────────────────────────────────────────────────────────

/**
 * Subtotal / tax / total from line totals + a tax rate in basis points.
 * All integer minor units; tax rounds once inside `applyBps`. An empty line
 * list totals zero (a valid "quote in progress" state), mirroring
 * pipeline-logic#computeQuoteTotal.
 */
export function computeQuotationTotals(
  lineTotalsMinor: number[],
  taxLabel: string,
  taxBps: number,
  currency: string,
): QuotationTotals {
  const subtotalMinor =
    lineTotalsMinor.length === 0
      ? 0
      : addMinor(lineTotalsMinor.map((minor) => ({ minor, currency }))).minor
  const taxMinor = applyBps(subtotalMinor, taxBps)
  const totalMinor = subtotalMinor + taxMinor
  return { subtotalMinor, taxLabel, taxBps, taxMinor, totalMinor }
}

/** COT-WGT-YYYY-NNNN, mirroring tower.mint_quote_no. Used for previews/tests. */
export function formatQuoteNo(year: number, seq: number): string {
  return `COT-WGT-${year}-${String(seq).padStart(4, '0')}`
}

/** Zero-padded item number for display ("01", "02", … "12"). */
export function itemNo(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/**
 * Plain grouped amount for the document — no currency symbol (the column header
 * already reads "(USD)"). Two decimals, comma thousands. Never used for math.
 */
export function formatAmount(minor: number): string {
  return (minor / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ── Sensible defaults (so a document always renders in full) ─────────────────
// These mirror the approved reference doc. Persisted `terms`/`observations`
// override them per quote; empty fields fall back here.

export const DEFAULT_TERMS: CommercialTerms = {
  paymentTerms: '30% de adelanto y 70% antes del embarque',
  deliveryTime: '30 - 45 días calendario después de confirmada la orden.',
  incoterm: 'CIF - Callao (Incoterms ® 2020)',
  warranty: '12 meses o 20 000 km (Lo que ocurre primero)',
  validityText: '15 días calendarios.',
}

export const DEFAULT_OBSERVATIONS: string[] = [
  'Precios sujetos a variación sin previo aviso.',
  'No incluye flete internacional ni seguros.',
]

export const DEFAULT_TAX_LABEL = 'IGV 18%'
export const DEFAULT_TAX_BPS = 1800

/** Merge stored terms over the defaults, dropping empty strings. */
export function withDefaultTerms(stored: Partial<CommercialTerms> | null | undefined): CommercialTerms {
  const s = stored ?? {}
  const pick = (v: string | null | undefined, d: string | null): string | null =>
    v && v.trim() ? v : d
  return {
    paymentTerms: pick(s.paymentTerms, DEFAULT_TERMS.paymentTerms ?? null),
    deliveryTime: pick(s.deliveryTime, DEFAULT_TERMS.deliveryTime ?? null),
    incoterm: pick(s.incoterm, DEFAULT_TERMS.incoterm ?? null),
    warranty: pick(s.warranty, DEFAULT_TERMS.warranty ?? null),
    validityText: pick(s.validityText, DEFAULT_TERMS.validityText ?? null),
  }
}
