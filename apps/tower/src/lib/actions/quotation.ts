'use server'

// src/lib/actions/quotation.ts
// Official quotation document — API_MAP "Pipeline" domain, the client-facing
// "Cotización" layer on top of the internal quote engine (pipeline.ts). Every
// action follows the mutation law: auth → Zod parse → RLS-scoped query. RLS
// (tower.quotes "SALES + LANE_DIRECTOR write") is the only permission boundary;
// this file never gates with `if (role === …)`.
//
// Money is integer minor units, tax is basis points, and subtotal/tax/total are
// recomputed HERE on the server on every issue/save (Directive 3 / ADR-7) — the
// persisted split is never trusted from the client.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { addMinor } from '@/lib/money'
import { fail, ok, type ActionResult } from './result'
import type { QuoteLineComputed } from './pipeline-logic'
import { WINGS_ISSUER } from '@/lib/quotation/company'
import {
  DEFAULT_OBSERVATIONS,
  DEFAULT_TAX_BPS,
  DEFAULT_TAX_LABEL,
  itemNo,
  withDefaultTerms,
  type BillTo,
  type CommercialTerms,
  type QuotationDocument,
  type QuotationLine,
} from '@/lib/quotation/document'

const uuidSchema = z.string().uuid()

// ── Auth helper (mirrors pipeline.ts#requireUser) ────────────────────────────
async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

type TowerClient = ReturnType<SupabaseClient['schema']>

// ── Persisted shapes ─────────────────────────────────────────────────────────
interface RawQuoteDocRow {
  id: string
  rfq_id: string
  status: string
  currency: string
  lines: QuoteLineComputed[] | null
  total_minor: number | string
  subtotal_minor: number | string | null
  tax_label: string | null
  tax_bps: number | null
  tax_minor: number | string | null
  quote_no: string | null
  issued_on: string | null
  valid_until: string | null
  bill_to: Partial<BillTo> | null
  terms: Partial<CommercialTerms> | null
  observations: string[] | null
}

const QUOTE_DOC_COLS =
  'id,rfq_id,status,currency,lines,total_minor,subtotal_minor,tax_label,tax_bps,tax_minor,quote_no,issued_on,valid_until,bill_to,terms,observations'

function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0
  return typeof v === 'string' ? Number(v) : v
}

/** Sum line totals into an integer-minor subtotal (empty → 0). */
function subtotalFromLines(lines: QuoteLineComputed[], currency: string): number {
  if (lines.length === 0) return 0
  return addMinor(lines.map((l) => ({ minor: l.totalMinor, currency }))).minor
}

/** subtotal × bps / 10_000, rounded once — the only tax rounding. */
function taxFromBps(subtotalMinor: number, bps: number): number {
  return Math.round((subtotalMinor * bps) / 10_000)
}

/** Bill-to snapshot from the RFQ's account + first contact. */
async function deriveBillTo(supabase: TowerClient, accountId: string | null): Promise<BillTo> {
  if (!accountId) return { company: '' }
  const { data: account } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', accountId)
    .maybeSingle()
  const { data: contact } = await supabase
    .from('contacts')
    .select('full_name,email,whatsapp')
    .eq('account_id', accountId)
    .limit(1)
    .maybeSingle()
  const c = contact as { full_name?: string; email?: string; whatsapp?: string } | null
  return {
    company: (account as { name?: string } | null)?.name ?? '',
    taxId: null,
    attention: c?.full_name ?? null,
    contact: c?.email ?? c?.whatsapp ?? null,
  }
}

function isEmptyBillTo(b: Partial<BillTo> | null | undefined): boolean {
  if (!b) return true
  return !b.company && !b.taxId && !b.attention && !b.contact
}

function daysBetween(fromIso: string | null, toIso: string | null): number | null {
  if (!fromIso || !toIso) return null
  const from = Date.parse(fromIso)
  const to = Date.parse(toIso)
  if (Number.isNaN(from) || Number.isNaN(to)) return null
  return Math.round((to - from) / 86_400_000)
}

/** Assemble the render-ready document from a persisted quote row. */
function toDocument(row: RawQuoteDocRow, accountBillTo: BillTo | null): QuotationDocument {
  const currency = row.currency || 'USD'
  const lines: QuoteLineComputed[] = Array.isArray(row.lines) ? row.lines : []

  const subtotalMinor = subtotalFromLines(lines, currency)
  const taxLabel = row.tax_label ?? DEFAULT_TAX_LABEL
  const taxBps = row.tax_bps ?? DEFAULT_TAX_BPS
  const taxMinor = taxFromBps(subtotalMinor, taxBps)

  const storedBillTo = isEmptyBillTo(row.bill_to) ? accountBillTo : (row.bill_to as BillTo)
  const billTo: BillTo = storedBillTo ?? { company: '' }

  const observations =
    Array.isArray(row.observations) && row.observations.length > 0 ? row.observations : DEFAULT_OBSERVATIONS

  const docLines: QuotationLine[] = lines.map((l, i) => ({
    itemNo: itemNo(i),
    description: l.description,
    quantity: l.quantity,
    unitPriceMinor: l.unitPriceMinor,
    lineTotalMinor: l.totalMinor,
    imageUrl: null,
  }))

  const validDays = daysBetween(row.issued_on, row.valid_until)

  return {
    quoteId: row.id,
    quoteNo: row.quote_no,
    status: row.status,
    currency,
    issuedOn: row.issued_on,
    validUntil: row.valid_until,
    validityLabel: validDays !== null ? `${validDays} días` : null,
    billTo,
    lines: docLines,
    totals: { subtotalMinor, taxLabel, taxBps, taxMinor, totalMinor: subtotalMinor + taxMinor },
    terms: withDefaultTerms(row.terms),
    observations,
    issuer: WINGS_ISSUER,
  }
}

async function loadQuoteDoc(
  supabase: TowerClient,
  quoteId: string,
): Promise<{ row: RawQuoteDocRow; accountId: string | null } | null> {
  const { data, error } = await supabase.from('quotes').select(QUOTE_DOC_COLS).eq('id', quoteId).maybeSingle()
  if (error || !data) return null
  const row = data as unknown as RawQuoteDocRow
  const { data: rfq } = await supabase.from('rfqs').select('account_id').eq('id', row.rfq_id).maybeSingle()
  return { row, accountId: (rfq as { account_id: string | null } | null)?.account_id ?? null }
}

// ── Read ─────────────────────────────────────────────────────────────────────

/** Assemble the official document for a quote (RLS-scoped read). */
export async function getQuotationDocument(quoteId: string): Promise<ActionResult<QuotationDocument>> {
  const parsed = uuidSchema.safeParse(quoteId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const loaded = await loadQuoteDoc(auth.supabase, parsed.data)
  if (!loaded) return fail('FORBIDDEN_LANE', 'Cotización no encontrada / Quote not found')

  const accountBillTo = isEmptyBillTo(loaded.row.bill_to)
    ? await deriveBillTo(auth.supabase, loaded.accountId)
    : null
  return ok(toDocument(loaded.row, accountBillTo))
}

// ── Issue (mint number + freeze the split) ───────────────────────────────────

/**
 * Issue a quote as an official document: mint COT-WGT-YYYY-NNNN if absent, stamp
 * the issue date, snapshot the bill-to from the account when empty, and persist
 * the server-computed subtotal/tax/total. Idempotent on the number (never
 * re-mints). Append-only: a quote's number is minted once and never reused.
 */
export async function issueQuotation(quoteId: string): Promise<ActionResult<QuotationDocument>> {
  const parsed = uuidSchema.safeParse(quoteId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const loaded = await loadQuoteDoc(auth.supabase, parsed.data)
  if (!loaded) return fail('FORBIDDEN_LANE', 'Cotización no encontrada / Quote not found')
  const { row } = loaded

  const currency = row.currency || 'USD'
  const lines: QuoteLineComputed[] = Array.isArray(row.lines) ? row.lines : []
  const subtotalMinor = subtotalFromLines(lines, currency)
  const taxBps = row.tax_bps ?? DEFAULT_TAX_BPS
  const taxMinor = taxFromBps(subtotalMinor, taxBps)

  const now = new Date()
  const patch: Record<string, unknown> = {
    subtotal_minor: subtotalMinor,
    tax_minor: taxMinor,
    total_minor: subtotalMinor + taxMinor,
    issued_on: row.issued_on ?? now.toISOString().slice(0, 10),
  }

  // Mint the number once, atomically, via the SECURITY DEFINER counter fn.
  if (!row.quote_no) {
    const { data: minted, error: mintError } = await auth.supabase.rpc('mint_quote_no', {
      p_year: now.getFullYear(),
    })
    if (mintError) return fail('VALIDATION', 'No se pudo emitir el número / Could not mint number')
    patch.quote_no = minted as unknown as string
  }

  // Snapshot bill-to from the account only if not already set by an editor.
  if (isEmptyBillTo(row.bill_to)) {
    patch.bill_to = await deriveBillTo(auth.supabase, loaded.accountId)
  }

  const { error: updateError } = await auth.supabase.from('quotes').update(patch).eq('id', parsed.data)
  if (updateError) return fail('FORBIDDEN_LANE', 'No se pudo emitir / Could not issue')

  return getQuotationDocument(parsed.data)
}

// ── Edit document details ────────────────────────────────────────────────────

const billToSchema = z.object({
  company: z.string().trim().max(200),
  taxId: z.string().trim().max(40).nullish(),
  attention: z.string().trim().max(200).nullish(),
  contact: z.string().trim().max(200).nullish(),
})

const termsSchema = z.object({
  paymentTerms: z.string().trim().max(400).nullish(),
  deliveryTime: z.string().trim().max(400).nullish(),
  incoterm: z.string().trim().max(200).nullish(),
  warranty: z.string().trim().max(200).nullish(),
  validityText: z.string().trim().max(200).nullish(),
})

const saveDetailsSchema = z.object({
  billTo: billToSchema.optional(),
  taxLabel: z.string().trim().min(1).max(60).optional(),
  taxBps: z.number().int().min(0).max(10_000).optional(),
  terms: termsSchema.optional(),
  observations: z.array(z.string().trim().max(400)).max(20).optional(),
})
export type SaveQuotationDetailsInput = z.input<typeof saveDetailsSchema>

/** Override the editable document fields; recomputes the split server-side. */
export async function saveQuotationDetails(
  quoteId: string,
  input: SaveQuotationDetailsInput,
): Promise<ActionResult<QuotationDocument>> {
  const idParsed = uuidSchema.safeParse(quoteId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const parsed = saveDetailsSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const loaded = await loadQuoteDoc(auth.supabase, idParsed.data)
  if (!loaded) return fail('FORBIDDEN_LANE', 'Cotización no encontrada / Quote not found')
  const { row } = loaded

  const currency = row.currency || 'USD'
  const lines: QuoteLineComputed[] = Array.isArray(row.lines) ? row.lines : []
  const subtotalMinor = subtotalFromLines(lines, currency)
  const taxBps = parsed.data.taxBps ?? row.tax_bps ?? DEFAULT_TAX_BPS
  const taxMinor = taxFromBps(subtotalMinor, taxBps)

  const patch: Record<string, unknown> = {
    subtotal_minor: subtotalMinor,
    tax_bps: taxBps,
    tax_minor: taxMinor,
    total_minor: subtotalMinor + taxMinor,
  }
  if (parsed.data.taxLabel !== undefined) patch.tax_label = parsed.data.taxLabel
  if (parsed.data.billTo !== undefined) patch.bill_to = parsed.data.billTo
  if (parsed.data.terms !== undefined) patch.terms = parsed.data.terms
  if (parsed.data.observations !== undefined) patch.observations = parsed.data.observations

  const { error: updateError } = await auth.supabase.from('quotes').update(patch).eq('id', idParsed.data)
  if (updateError) return fail('FORBIDDEN_LANE', 'No se pudo guardar / Could not save')

  return getQuotationDocument(idParsed.data)
}
