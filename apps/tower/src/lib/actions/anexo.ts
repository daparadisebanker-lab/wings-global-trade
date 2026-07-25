'use server'

// src/lib/actions/anexo.ts
// Anexo (landed-cost annex) — a SEPARATE document over the SAME quote the proforma
// annexes. Auth → Zod → RLS-scoped read. The proforma sale is the quote's
// total_minor (never copied); freight resolves from tower.rate_tables via the pure
// resolveFreightRate (Directive 4 — rates never from memory); local handling lines
// come from stored inputs where present, else "No incluido". No money math beyond
// the model's addition (Directive 3). The issuing entity follows the Stage-1
// precedence (issuerById(row.issuer_id) ?? resolveIssuer(destination)).
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import {
  buildAnexoDocument,
  deriveRouteCode,
  freightLineFrom,
  type AnexoDocument,
  type AnexoLine,
} from '@/lib/quotation/anexo'
import { DEFAULT_ISSUER, issuerById, resolveIssuer } from '@/lib/quotation/issuers'
import { resolveFreightRate, type RateRow } from '@/lib/torre/rates'

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

/** Optional stored logistics amounts (minor units) on the quote's terms jsonb. */
interface RawLogistics {
  cargaOrigenMinor?: number | null
  gastosPuertoDestinoMinor?: number | null
  cargaDescargaAlmacenajeMinor?: number | null
}

interface RawTerms {
  portOfOrigin?: string | null
  portOfDestination?: string | null
  issuedCity?: string | null
  cbmLabel?: string | null
  logistics?: RawLogistics | null
}

interface RawQuoteRow {
  id: string
  rfq_id: string
  currency: string
  total_minor: number | string
  quote_no: string | null
  issued_on: string | null
  terms: RawTerms | null
  issuer_id: string | null
}

const QUOTE_COLS = 'id,rfq_id,currency,total_minor,quote_no,issued_on,terms,issuer_id'

function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0
  return typeof v === 'string' ? Number(v) : v
}

/** Fetch the brand/lane-scoped FREIGHT rate rows for the quote and map to RateRow[]. */
async function loadRateRows(supabase: TowerClient, rfqId: string): Promise<RateRow[]> {
  const { data: rfq } = await supabase.from('rfqs').select('brand_id,lane_id').eq('id', rfqId).maybeSingle()
  const r = rfq as { brand_id: string; lane_id: string | null } | null
  if (!r) return []
  const { data } = await supabase
    .from('rate_tables')
    .select('kind,route,mode,container_type,rate_minor,currency,valid_from,valid_to,source')
    .eq('brand_id', r.brand_id)
    .eq('kind', 'FREIGHT')
  const rows = (data as Array<Record<string, unknown>> | null) ?? []
  return rows.map((row) => ({
    kind: 'FREIGHT',
    route: String(row.route),
    mode: (row.mode as RateRow['mode']) ?? 'SEA',
    containerType: (row.container_type as string | null) ?? null,
    rateMinor: Number(row.rate_minor),
    currency: String(row.currency),
    validFrom: String(row.valid_from),
    validTo: (row.valid_to as string | null) ?? null,
    source: (row.source as string | null) ?? null,
  }))
}

/** Assemble the landed-cost annex for a quote (RLS-scoped read). */
export async function getAnexoDocument(quoteId: string): Promise<ActionResult<AnexoDocument>> {
  const parsed = uuidSchema.safeParse(quoteId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase.from('quotes').select(QUOTE_COLS).eq('id', parsed.data).maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'Cotización no encontrada / Quote not found')
  const row = data as unknown as RawQuoteRow
  const terms = row.terms ?? {}
  const currency = row.currency || 'USD'

  // Issuing entity — Stage-1 precedence.
  const entity =
    issuerById(row.issuer_id) ??
    resolveIssuer({ port: terms.portOfDestination ?? null, country: null }) ??
    DEFAULT_ISSUER

  // Freight from rate_tables (never invented). Route derived from the stated ports.
  const today = new Date().toISOString().slice(0, 10)
  const routeCode = deriveRouteCode(terms.portOfOrigin, terms.portOfDestination)
  const rateRows = await loadRateRows(auth.supabase, row.rfq_id)
  const resolvedFreight = routeCode ? resolveFreightRate(rateRows, { route: routeCode, mode: 'SEA' }, today) : null

  // Local handling lines — from stored inputs where present, else "No incluido".
  const lg = terms.logistics ?? {}
  const lines: AnexoLine[] = [
    freightLineFrom(resolvedFreight, today, 'Flete marítimo'),
    { label: 'Carga en puerto de origen', amountMinor: lg.cargaOrigenMinor ?? null },
    { label: `Gastos del puerto de destino${terms.portOfDestination ? ` (${terms.portOfDestination})` : ''}`, amountMinor: lg.gastosPuertoDestinoMinor ?? null },
    { label: 'Costo de carga, descarga y almacenaje', amountMinor: lg.cargaDescargaAlmacenajeMinor ?? null },
  ]

  const doc = buildAnexoDocument({
    anexoOf: row.quote_no ? row.quote_no.replace(/^COT-/, 'PF-') : null,
    issuer: entity.issuer,
    issuerId: entity.id,
    locale: entity.locale,
    issuedCity: terms.issuedCity ?? entity.defaultIssueCity,
    issuedOn: row.issued_on,
    route: { origin: terms.portOfOrigin ?? null, destination: terms.portOfDestination ?? null },
    cbmLabel: terms.cbmLabel ?? null,
    currency,
    lines,
    proformaSaleMinor: num(row.total_minor),
  })

  return ok(doc)
}
