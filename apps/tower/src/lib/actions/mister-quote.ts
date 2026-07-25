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
import { createClient } from './clients'
import { toQuoteLineDrafts } from './mister-quote-logic'
import { issuerById } from '@/lib/quotation/issuers'
import { ok, fail, type ActionResult } from './result'

const inputSchema = z.object({
  laneId: z.string().uuid(),
  accountId: z.string().uuid().nullable().optional(),
  newClientName: z.string().trim().min(1).max(200).nullable().optional(),
  /** Freezes the issuing entity the SavePanel showed (resolved default or override). */
  issuerId: z
    .string()
    .trim()
    .max(64)
    .optional()
    .refine((v) => v === undefined || issuerById(v) !== null, 'Entidad emisora desconocida / Unknown issuing entity'),
  /** Destination signals captured by Mister; stored on the quote's terms. */
  destinationCountry: z.string().trim().max(120).nullable().optional(),
  destinationPort: z.string().trim().max(120).nullable().optional(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/)
    .transform((s) => s.toUpperCase())
    .default('USD'),
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

  // Resolve the client: an existing account, or create one under the lane's brand
  // via the shared createClient path (single account-insert source of truth).
  let accountId = parsed.data.accountId ?? null
  if (!accountId && parsed.data.newClientName) {
    const created = await createClient({ brandId: laneRow.brand_id, name: parsed.data.newClientName })
    if (created.error) return fail(created.error.code, created.error.message)
    accountId = created.data.id
  }

  // Destination text for the quote's terms (port + country), so the render
  // resolver picks the right entity when no explicit issuerId is frozen.
  const portOfDestination =
    [parsed.data.destinationPort, parsed.data.destinationCountry].filter((s): s is string => !!s && s.trim().length > 0).join(', ') ||
    undefined

  // Sanctioned mutation path: createRFQ (source MISTER) → composeQuote (DRAFT).
  // Currency and the issuing entity now flow from the proposal / SavePanel.
  const rfq = await createRFQ(laneId, { accountId, source: 'MISTER', currency: parsed.data.currency })
  if (rfq.error) return fail(rfq.error.code, rfq.error.message)

  const quote = await composeQuote(rfq.data.id, quoteLines, {
    issuerId: parsed.data.issuerId,
    portOfDestination,
  })
  if (quote.error) return fail(quote.error.code, quote.error.message)

  return ok({ quoteId: quote.data.id })
}
