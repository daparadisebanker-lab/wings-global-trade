'use server'
// src/lib/actions/torre-quote.ts
// Mister Torre — the quote-run server action (the flagship's natural-language path).
//
//     auth → validate → RLS-scoped lane lookup → MODEL parses spec →
//     runQuoteFromSpec (shared core) → linked ai_drafts DRAFT trio
//
// Governance: the model ONLY parses the operator's sentence; every number comes
// from the SUNAT engine (Directive 3). Nothing is sent/committed — the run ends at
// "a reviewable linked pair exists" (Directive 7). Rates come from costing_config,
// never the model (Directive 4). The pricing+persist pipeline lives in quote-core.ts,
// shared with the agentic propose_quote tool so there is ONE money path.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { getIntelligenceClient } from '@/lib/ai/client'
import { extractQuoteSpec, type QuoteSpec } from '@/lib/torre/parse-spec'
import { runQuoteFromSpec, type QuoteCoreResult, type QuoteLaneRow } from '@/lib/torre/quote-core'

const uuid = z.string().uuid()

const runSchema = z.object({
  laneId: uuid,
  text: z.string().trim().min(3).max(2000),
  /** Persist the pair as reviewable drafts (default true). false = compute-only preview. */
  persist: z.boolean().optional(),
  /** Test/replay hook: pin 'today' (server uses the real date otherwise). */
  today: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})
export type RunTorreQuoteInput = z.infer<typeof runSchema>

/** The action result — the shared core result plus the model-extracted spec it used. */
export interface TorreQuoteResult extends QuoteCoreResult {
  spec: QuoteSpec
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower'), user }
}

function serverToday(pinned?: string): string {
  return pinned ?? new Date().toISOString().slice(0, 10)
}

export async function runTorreQuote(input: RunTorreQuoteInput): Promise<ActionResult<TorreQuoteResult>> {
  const parsed = runSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Entrada inválida / Invalid input')
  const { laneId, text } = parsed.data
  const persist = parsed.data.persist !== false

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase

  // Lane → brand + code (RLS-scoped: a lane the operator can't see returns nothing).
  const { data: lane } = await db.from('lanes').select('id,brand_id,code,archetype').eq('id', laneId).maybeSingle()
  const laneRow = lane as QuoteLaneRow | null
  if (!laneRow?.brand_id) return fail('FORBIDDEN_LANE', 'Lane no encontrado / Lane not found')

  // The MODEL step (only the sentence → structured spec).
  const client = getIntelligenceClient()
  if (!client) {
    return fail('VALIDATION', 'Intelligence no configurado (falta ANTHROPIC_API_KEY) / Intelligence not configured')
  }
  let spec: QuoteSpec
  try {
    spec = await extractQuoteSpec(client, text)
  } catch {
    return fail('VALIDATION', 'No se pudo interpretar la solicitud / Could not parse the request')
  }
  if (!spec.understood) {
    return fail(
      'VALIDATION',
      spec.note ||
        'Dime el equipo y su valor FOB (o CIF) para armar la cotización / Give me the equipment and its FOB (or CIF) value',
    )
  }

  const today = serverToday(parsed.data.today)
  const core = await runQuoteFromSpec(db, laneRow, spec, { today, persist, createdBy: auth.user.id })
  return ok({ ...core, spec })
}
