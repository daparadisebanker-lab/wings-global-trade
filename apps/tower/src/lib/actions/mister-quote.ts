'use server'

// Mister's save-draft seam — the ONE write that turns a Mister quote proposal
// into a real DRAFT quotation. It reuses the sanctioned mutation path
// (createRFQ → composeQuote), so line totals are recomputed server-side by the
// archetype engine and RLS gates every write. Optionally creates the client
// (an account) first. It NEVER issues — minting the binding number stays a
// separate, human act in the Quotations window (issueQuotation).

import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { listArchetypes, type Archetype } from '@/lib/archetypes'
import { createRFQ, composeQuote } from './pipeline'
import { toQuoteLineDrafts } from './mister-quote-logic'
import { ok, fail, type ActionResult } from './result'

const inputSchema = z.object({
  laneId: z.string().uuid(),
  accountId: z.string().uuid().nullable().optional(),
  newClientName: z.string().trim().min(1).max(200).nullable().optional(),
  lines: z
    .array(
      z.object({
        description: z.string().trim().max(500),
        quantity: z.number().positive(),
        unitPriceMinor: z.number().int().nonnegative().nullable(),
      }),
    )
    .min(1)
    .max(200),
})
export type SaveMisterQuoteInput = z.input<typeof inputSchema>

export interface SaveMisterQuoteResult {
  quoteId: string
}

/**
 * Persist a Mister quote proposal as a DRAFT quotation under a lane (optionally
 * for a new or existing client). Returns the quote id so the dock can deep-link
 * to the Quotations window / printable proforma.
 */
export async function saveMisterQuoteDraft(
  input: SaveMisterQuoteInput,
): Promise<ActionResult<SaveMisterQuoteResult>> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const { laneId, lines } = parsed.data

  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const db = supabase.schema('tower')

  // Resolve the lane (RLS-scoped) → brand + archetype.
  const { data: lane, error: laneError } = await db
    .from('lanes')
    .select('id,brand_id,archetype')
    .eq('id', laneId)
    .maybeSingle()
  if (laneError) return fail('VALIDATION', 'No se pudo leer la lane / Could not read lane')
  if (!lane) return fail('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access')
  const laneRow = lane as { id: string; brand_id: string; archetype: string }

  const archetype = laneRow.archetype as Archetype
  if (!listArchetypes().includes(archetype)) {
    return fail('VALIDATION', 'Arquetipo de lane inválido / Invalid lane archetype')
  }

  // At least one priced line, mapped onto the archetype's default unit.
  const quoteLines = toQuoteLineDrafts(archetype, lines)
  if (quoteLines.length === 0) {
    return fail('VALIDATION', 'Todas las líneas están por cotizar / Every line is still to-quote')
  }

  // Resolve the client: an existing account, or create one under the lane's brand.
  let accountId = parsed.data.accountId ?? null
  if (!accountId && parsed.data.newClientName) {
    const { data: account, error: accountError } = await db
      .from('accounts')
      .insert({ brand_id: laneRow.brand_id, name: parsed.data.newClientName })
      .select('id')
      .single()
    if (accountError || !account) {
      return fail('FORBIDDEN_LANE', 'No se pudo crear el cliente / Could not create the client')
    }
    accountId = (account as { id: string }).id
  }

  // Sanctioned mutation path: createRFQ (source MISTER) → composeQuote (DRAFT).
  const rfq = await createRFQ(laneId, { accountId, source: 'MISTER', currency: 'USD' })
  if (rfq.error) return fail(rfq.error.code, rfq.error.message)

  const quote = await composeQuote(rfq.data.id, quoteLines)
  if (quote.error) return fail(quote.error.code, quote.error.message)

  return ok({ quoteId: quote.data.id })
}
