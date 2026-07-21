// src/lib/quotation/rb-container.ts
// The RbContainerQuoteDocument model — the shape the represented-brand CONTAINER
// quote renderer consumes — plus its PURE math. This is the ALLOCATION archetype
// (root CLAUDE.md §5-bis): a container is sold container-only / by SLOT, never by
// unit. The buyer negotiates in slots (quantity-in-container is server-converted
// to slots upstream, in the action). Money is integer minor units + a currency
// code and reuses the SHIPPED quotation money layer verbatim — subtotal/tax/total
// come from `computeQuotationTotals` (document.ts), tax is basis points, no float
// ever touches an amount (TOWER Directive 3 / ADR-7).
//
// Presentation-agnostic + DB-agnostic, exactly like document.ts / proforma.ts:
// the server action (lib/actions/rb-quotation.ts) assembles this from RLS-scoped
// RB reads + a Zod-validated pricing input, and the renderer draws it. Wholesale
// only (Prime Directive 2): never a cart, never a retail unit price — the unit is
// a slot. The tech-sheet sections are built in @wings/rb-core (buildTechSheetSections).
import { lineTotalMinor } from '@/lib/money'
import type { TechSheetSection } from '@wings/rb-core'
import type { CompanyInfo } from './company'
import {
  computeQuotationTotals,
  type BillTo,
  type CommercialTerms,
  type QuotationTotals,
} from './document'

// Re-export the shared bill-to + terms + totals shapes so the RB action/renderer
// import them from one place, exactly as the proforma document does.
export type { BillTo, CommercialTerms, QuotationTotals } from './document'
export { computeQuotationTotals } from './document'

// ── A rendered allocation line (the negotiated slots) ────────────────────────
// One line = one product's slot allocation in the container. `slots` is the unit
// the buyer negotiates; `pricePerSlotMinor` is per-slot money. Both null-price
// paths are legal: an un-priced quote is a wholesale RFQ posture ("por cotizar"),
// never a retail listing.
export interface RbSlotLine {
  /** Zero-padded item number, e.g. "01". */
  itemNo: string
  /** ES description — "Asignación de N cupos · {producto}". */
  description: string
  /** EN description — bilingual mirror. */
  descriptionEn: string
  /** The negotiated unit: slots (a.k.a. cupos). Always an integer. */
  slots: number
  /** Unit label, ES default "cupos". */
  unitLabel: string
  /** Per-slot price in integer minor units, or null when the quote is un-priced. */
  pricePerSlotMinor: number | null
  /** slots × pricePerSlotMinor (integer minor), or null when un-priced. */
  lineTotalMinor: number | null
}

// ── The packing cascade exhibited for the allocation ─────────────────────────
export interface RbPackingExhibit {
  slots: number
  packages: number
  packets: number
  units: number
  kg: number
  /** Units of capacity left unused inside the last slot (Costco honesty rule). */
  remainderUnits: number
}

export interface RbContainerQuoteDocument {
  /** COT-RB-YYYY-NNNN — a deterministic container-scoped reference (not a minted
   *  legal number; there is no RB quote table, so this is a pointer like a ficha). */
  quoteRef: string | null
  status: string
  currency: string
  /** true when every line carries a price (totals are present). */
  priced: boolean
  /** ISO date the quote was issued. */
  issuedOn: string | null
  /** City of issue (the "Lima, dd-mm-yyyy" dateline). */
  issuedCity: string | null
  /** Human validity, e.g. "15 días". */
  validityLabel: string | null
  incoterm: string | null
  // Brand + container identity
  brandName: string
  brandSlug: string
  /** Product name (ES) — the container's product, for the tech-sheet header. */
  productName: string
  containerCode: string
  /** Container class from the template, e.g. "40HC". */
  containerKind: string
  routeLabel: string | null
  phaseLabel: string | null
  slotsTotal: number
  slotsAvailable: number
  // Parties
  billTo: BillTo
  // Body
  lines: RbSlotLine[]
  packing: RbPackingExhibit
  /** null when the quote is un-priced (no money to total). */
  totals: QuotationTotals | null
  techSheet: TechSheetSection[]
  terms: CommercialTerms
  observations: string[]
  issuer: CompanyInfo
}

// ── Doc number ───────────────────────────────────────────────────────────────

/** COT-RB-YYYY-NNNN — the RB container quote reference (mirrors formatQuoteNo). */
export function formatRbQuoteNo(year: number, seq: number): string {
  return `COT-RB-${year}-${String(seq).padStart(4, '0')}`
}

/**
 * Stable 4-digit sequence from a container code — deterministic (same container →
 * same reference), so a preview needs no counter table / migration. Mirrors
 * ficha's `fichaSeqFromId`.
 */
export function rbQuoteSeqFromCode(code: string): number {
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) % 10000
  }
  return hash === 0 ? 1 : hash
}

// ── Pure line + totals math ──────────────────────────────────────────────────

/** Zero-padded item number for display ("01", "02", …). */
export function rbItemNo(index: number): string {
  return String(index + 1).padStart(2, '0')
}

/**
 * Build one allocation line. `pricePerSlotMinor` null → an un-priced line (the
 * line total is null too). Slots are integers, so the total is exact integer
 * minor units via the shared `lineTotalMinor` guard (no float touches money).
 */
export function buildRbSlotLine(input: {
  index: number
  productEs: string
  productEn: string
  slots: number
  unitLabel?: string
  pricePerSlotMinor: number | null
}): RbSlotLine {
  const unitLabel = input.unitLabel ?? 'cupos'
  const priced = input.pricePerSlotMinor != null
  return {
    itemNo: rbItemNo(input.index),
    description: `Asignación de ${input.slots} ${unitLabel} · ${input.productEs}`,
    descriptionEn: `Allocation of ${input.slots} ${unitLabel === 'cupos' ? 'slots' : unitLabel} · ${input.productEn}`,
    slots: input.slots,
    unitLabel,
    pricePerSlotMinor: input.pricePerSlotMinor,
    lineTotalMinor: priced ? lineTotalMinor(input.pricePerSlotMinor as number, input.slots) : null,
  }
}

/**
 * Subtotal / tax / total for an RB container quote — a thin alias over the shared
 * quotation math so the RB path NEVER grows its own money code (same integer
 * minor units, same single tax rounding, Directive 3). Returns null when any line
 * is un-priced (an un-priced quote has no total — it is a wholesale RFQ posture).
 */
export function computeRbContainerTotals(
  lines: RbSlotLine[],
  taxLabel: string,
  taxBps: number,
  currency: string,
): QuotationTotals | null {
  if (lines.length === 0 || lines.some((l) => l.lineTotalMinor == null)) return null
  return computeQuotationTotals(
    lines.map((l) => l.lineTotalMinor as number),
    taxLabel,
    taxBps,
    currency,
  )
}

// ── Defaults (so a document always renders in full) — ALLOCATION-flavored ─────
export const DEFAULT_RB_TERMS: CommercialTerms = {
  paymentTerms: '50% al reservar el cupo y 50% antes del embarque',
  deliveryTime: 'Según fase del contenedor (en origen / en tránsito / arribado).',
  incoterm: 'CIF - Callao (Incoterms ® 2020)',
  warranty: null,
  validityText: '15 días calendarios o hasta el cierre de carga del contenedor.',
}

export const DEFAULT_RB_OBSERVATIONS: string[] = [
  'Venta por contenedor y por asignación de cupos — no se comercializa por unidad.',
  'La disponibilidad de cupos se confirma al reservar; el cálculo de cupos es del lado del servidor.',
  'Los precios están expresados en la moneda indicada y sujetos a variación logística o de tipo de cambio.',
]

export const DEFAULT_RB_TAX_LABEL = 'IGV 18%'
export const DEFAULT_RB_TAX_BPS = 1800
