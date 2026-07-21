'use server'

// src/lib/actions/proforma.ts
// Proforma invoice — an alternate document over the SAME quote data the official
// "Cotización" reads (tower.quotes / tower_22). No new migration: it reuses the
// company / RUC / tax / terms layer and recomputes the IGV split HERE on the
// server (Directive 3 / ADR-7) via the shared quotation math — the persisted
// split is never trusted from the client, and no float touches money.
// Mutation law even for a read: auth → Zod parse → RLS-scoped query; RLS on
// tower.quotes is the only permission boundary.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import type { QuoteLineComputed } from './pipeline-logic'
import { WINGS_ISSUER } from '@/lib/quotation/company'
import { itemNo } from '@/lib/quotation/document'
import {
  computeProformaTotals,
  DEFAULT_PROFORMA_OBSERVATIONS,
  DEFAULT_PROFORMA_TAX_BPS,
  DEFAULT_PROFORMA_TAX_LABEL,
  DEFAULT_BANKING,
  WINGS_EXPORTER,
  withDefaultProformaTerms,
  type BankingDetails,
  type ProformaDocument,
  type ProformaTerms,
  type QuotationLine,
  type TradeParty,
} from '@/lib/quotation/proforma'

const uuidSchema = z.string().uuid()

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

// ── Persisted shape (subset of tower.quotes; same row the Cotización reads) ──
interface RawQuoteRow {
  id: string
  rfq_id: string
  status: string
  currency: string
  lines: QuoteLineComputed[] | null
  tax_label: string | null
  tax_bps: number | null
  quote_no: string | null
  issued_on: string | null
  valid_until: string | null
  bill_to: RawBillTo | null
  terms: RawTerms | null
  observations: string[] | null
}

interface RawBillTo {
  company?: string
  taxId?: string | null
  attention?: string | null
  contact?: string | null
  address?: string | null
  city?: string | null
  phone?: string | null
  email?: string | null
}

interface RawTerms extends Partial<ProformaTerms> {
  incoterm?: string | null
  issuedCity?: string | null
}

const QUOTE_COLS =
  'id,rfq_id,status,currency,lines,tax_label,tax_bps,quote_no,issued_on,valid_until,bill_to,terms,observations'

function isEmptyBillTo(b: RawBillTo | null | undefined): boolean {
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

/** Importer party from the account + first contact (mirrors quotation deriveBillTo). */
async function deriveImporter(supabase: TowerClient, accountId: string | null): Promise<RawBillTo> {
  if (!accountId) return {}
  const { data: account } = await supabase.from('accounts').select('name').eq('id', accountId).maybeSingle()
  const { data: contact } = await supabase
    .from('contacts')
    .select('full_name,email,whatsapp')
    .eq('account_id', accountId)
    .limit(1)
    .maybeSingle()
  const c = contact as { full_name?: string; email?: string; whatsapp?: string } | null
  return {
    company: (account as { name?: string } | null)?.name ?? '',
    attention: c?.full_name ?? null,
    email: c?.email ?? null,
    phone: c?.whatsapp ?? null,
  }
}

function toImporter(b: RawBillTo): TradeParty {
  return {
    name: b.company ?? '',
    taxId: b.taxId ?? null,
    address: b.address ?? null,
    city: b.city ?? null,
    phone: b.phone ?? null,
    contact: b.attention ?? null,
    // bill_to.contact historically holds an email-or-phone; prefer an explicit email.
    email: b.email ?? b.contact ?? null,
  }
}

function toDocument(row: RawQuoteRow, importerRaw: RawBillTo): ProformaDocument {
  const currency = row.currency || 'USD'
  const lines: QuoteLineComputed[] = Array.isArray(row.lines) ? row.lines : []

  const taxLabel = row.tax_label ?? DEFAULT_PROFORMA_TAX_LABEL
  const taxBps = row.tax_bps ?? DEFAULT_PROFORMA_TAX_BPS
  const totals = computeProformaTotals(
    lines.map((l) => l.totalMinor),
    taxLabel,
    taxBps,
    currency,
  )

  const docLines: QuotationLine[] = lines.map((l, i) => ({
    itemNo: itemNo(i),
    description: l.description,
    quantity: l.quantity,
    unitPriceMinor: l.unitPriceMinor,
    lineTotalMinor: l.totalMinor,
    imageUrl: null,
  }))

  const observations =
    Array.isArray(row.observations) && row.observations.length > 0 ? row.observations : DEFAULT_PROFORMA_OBSERVATIONS

  const validDays = daysBetween(row.issued_on, row.valid_until)

  return {
    proformaId: row.id,
    proformaNo: row.quote_no ? row.quote_no.replace(/^COT-/, 'PF-') : null,
    status: row.status,
    currency,
    issuedOn: row.issued_on,
    issuedCity: row.terms?.issuedCity ?? 'Lima',
    validityLabel: validDays !== null ? `${validDays} días` : null,
    incoterm: row.terms?.incoterm ?? 'CIF - Callao (Incoterms ® 2020)',
    exporter: WINGS_EXPORTER,
    importer: toImporter(importerRaw),
    lines: docLines,
    totals,
    terms: withDefaultProformaTerms(row.terms),
    banking: DEFAULT_BANKING as BankingDetails,
    observations,
    issuer: WINGS_ISSUER,
  }
}

/** Assemble the proforma invoice for a quote (RLS-scoped read). */
export async function getProformaDocument(quoteId: string): Promise<ActionResult<ProformaDocument>> {
  const parsed = uuidSchema.safeParse(quoteId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase.from('quotes').select(QUOTE_COLS).eq('id', parsed.data).maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'Cotización no encontrada / Quote not found')
  const row = data as unknown as RawQuoteRow

  let importerRaw: RawBillTo = row.bill_to ?? {}
  if (isEmptyBillTo(row.bill_to)) {
    const { data: rfq } = await auth.supabase.from('rfqs').select('account_id').eq('id', row.rfq_id).maybeSingle()
    const accountId = (rfq as { account_id: string | null } | null)?.account_id ?? null
    importerRaw = await deriveImporter(auth.supabase, accountId)
  }

  return ok(toDocument(row, importerRaw))
}
