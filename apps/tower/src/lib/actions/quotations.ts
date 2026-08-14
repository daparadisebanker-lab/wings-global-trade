'use server'

// The Quotations window's data layer — a cross-RFQ list of every quote the
// caller can see (RLS-scoped on tower.quotes), joined to its client (account)
// and lane for display. Distinct from pipeline.ts#listQuotes, which is per-RFQ:
// this is the standalone "quotations window" surface (draft + issued together).
//
// Read-only. Issuing (the binding mint) and composing stay in their existing
// actions (quotation.ts#issueQuotation, pipeline.ts#composeQuote). Pure mapping
// + types live in quotations-logic.ts (a 'use server' file exports only async).

import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  mapQuotationRow,
  QUOTATION_SELECT,
  type QuotationListItem,
  type RawQuotationRow,
} from './quotations-logic'

/**
 * List quotations the caller can see, newest first. RLS on tower.quotes is the
 * scope boundary — this never widens it. `rfqs!inner` drops any quote whose RFQ
 * is not readable, so a row always resolves a lane.
 */
export async function listQuotations(): Promise<ActionResult<QuotationListItem[]>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const { data, error } = await supabase
    .schema('tower')
    .from('quotes')
    .select(QUOTATION_SELECT)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return fail('VALIDATION', 'No se pudieron listar las cotizaciones / Could not list quotations')

  return ok(((data ?? []) as unknown as RawQuotationRow[]).map(mapQuotationRow))
}

/**
 * Quotations for one client's RFQs — the client window's quote history.
 * `rfqs!inner` + the embedded filter drop any quote whose RFQ isn't this
 * account (or isn't readable), same RLS boundary as listQuotations.
 */
export async function listQuotationsForAccount(accountId: string): Promise<ActionResult<QuotationListItem[]>> {
  const parsed = z.string().uuid().safeParse(accountId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')

  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const { data, error } = await supabase
    .schema('tower')
    .from('quotes')
    .select(QUOTATION_SELECT)
    .eq('rfqs.account_id', parsed.data)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return fail('VALIDATION', 'No se pudieron listar las cotizaciones / Could not list quotations')

  return ok(((data ?? []) as unknown as RawQuotationRow[]).map(mapQuotationRow))
}
