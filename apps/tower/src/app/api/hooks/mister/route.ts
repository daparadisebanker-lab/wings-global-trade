// src/app/api/hooks/mister/route.ts
// POST /api/hooks/mister — the existing n8n Mister pipeline posts session
// lifecycle events (API_MAP "Route handlers (external / streaming)"):
//   { session_id, lane, phase: started|completed|handoff, transcript_ref, contact? }
//   → creates/updates an RFQ (source=MISTER) linked to the Mister session.
//
// AUTH: every call must carry a valid `X-Wings-Signature` (HMAC-SHA256 of the
// raw body, keyed by `MISTER_HOOK_SECRET`) — unsigned/malformed requests are
// rejected before the body is even parsed (same shape as the ingest/
// revalidate signatures; `verifyRevalidateSignature` in lib/revalidate.ts is
// documented there as a stable helper other TOWER code may reuse, which is
// exactly what this route does with its own secret).
//
// PII LAW (root CLAUDE.md Directive 6 / TOWER CLAUDE.md #6: "Events carry no
// PII... identity joins only at RFQ conversion"). A `started` session is
// anonymous by construction — the buyer hasn't converted yet. A `contact`
// object at that phase would be premature PII and is rejected as VALIDATION.
// `contact` is only accepted on `completed`/`handoff`, the actual conversion
// moment — that's where the account/contact upsert (the identity join) runs.
//
// STAGE LAW: this hook only ever sets a stage when it CREATES the RFQ (the
// archetype's first stage). It never advances stage on later calls — stage
// transitions belong to the `updateStage` server action (Pipeline UI), not an
// ingest hook. Keeps "intelligence proposes, humans dispose" (Directive 7):
// the hook creates the pipeline object; only a human moves it forward.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { verifyRevalidateSignature } from '@/lib/revalidate'
import { createServiceClient } from '@/lib/supabase/server'
import { getStages, type Archetype } from '@/lib/archetypes'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  whatsapp: z.string().trim().min(6).max(20).optional(),
  role: z.string().trim().min(1).optional(),
  company: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
})

const misterHookSchema = z
  .object({
    session_id: z.string().trim().min(1),
    lane: z.string().trim().min(1),
    phase: z.enum(['started', 'completed', 'handoff']),
    // Accepted but not persisted — no column exists for it on `tower.rfqs`
    // (see report). Kept in the contract so n8n's payload validates as-is.
    transcript_ref: z.string().trim().min(1).optional(),
    contact: contactSchema.optional(),
  })
  .superRefine((body, ctx) => {
    if (body.phase === 'started' && body.contact) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contact'],
        message: 'contact is not accepted on phase=started — no identity before conversion (Directive 6)',
      })
    }
  })

type MisterHookInput = z.infer<typeof misterHookSchema>

/** Strips characters that would break a PostgREST `.or()` filter string. */
function sanitizeFilterValue(value: string): string {
  return value.replace(/[,()]/g, '')
}

async function findAccountIdByContact(
  service: SupabaseClient,
  brandId: string,
  contact: z.infer<typeof contactSchema>,
): Promise<string | null> {
  const orParts: string[] = []
  if (contact.email) orParts.push(`email.eq.${sanitizeFilterValue(contact.email)}`)
  if (contact.whatsapp) orParts.push(`whatsapp.eq.${sanitizeFilterValue(contact.whatsapp)}`)
  if (orParts.length === 0) return null

  const { data: contacts } = await service.schema('tower').from('contacts').select('account_id').or(orParts.join(','))
  const accountIds = [...new Set(((contacts ?? []) as { account_id: string }[]).map((c) => c.account_id))]
  if (accountIds.length === 0) return null

  const { data: accounts } = await service
    .schema('tower')
    .from('accounts')
    .select('id')
    .in('id', accountIds)
    .eq('brand_id', brandId)

  return (accounts as { id: string }[] | null)?.[0]?.id ?? null
}

/** Identity join at conversion (Directive 6) — only ever called with a `contact`. */
async function upsertAccountFromContact(
  service: SupabaseClient,
  brandId: string,
  contact: z.infer<typeof contactSchema>,
): Promise<string | null> {
  const existing = await findAccountIdByContact(service, brandId, contact)
  if (existing) return existing

  const { data: account, error: accountError } = await service
    .schema('tower')
    .from('accounts')
    .insert({ brand_id: brandId, name: contact.company || contact.full_name, country: contact.country ?? null })
    .select('id')
    .single()
  if (accountError || !account) return null

  const accountId = (account as { id: string }).id

  await service.schema('tower').from('contacts').insert({
    account_id: accountId,
    full_name: contact.full_name,
    email: contact.email ?? null,
    whatsapp: contact.whatsapp ?? null,
    role: contact.role ?? null,
  })

  return accountId
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-wings-signature')

    if (!verifyRevalidateSignature(rawBody, signature, process.env.MISTER_HOOK_SECRET)) {
      return apiError('UNAUTHORIZED', 'Firma ausente o inválida.')
    }

    let parsedBody: unknown
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      return apiError('VALIDATION', 'Cuerpo de solicitud inválido (JSON malformado).')
    }

    const input = misterHookSchema.safeParse(parsedBody)
    if (!input.success) {
      return apiError('VALIDATION', 'Datos inválidos.', input.error.flatten().fieldErrors)
    }
    const body: MisterHookInput = input.data

    const service = createServiceClient()
    if (!service) return apiError('INTERNAL', 'Supabase no configurado.')

    // Resolve lane → brand + archetype. Mister is Wings-only (ecosystem
    // CLAUDE.md §5.2 "Endorsed brands do not use Mister"), so the slug lookup
    // is unambiguous without a brand filter.
    const { data: lane, error: laneError } = await service
      .schema('tower')
      .from('lanes')
      .select('id, brand_id, archetype')
      .eq('slug', body.lane)
      .maybeSingle()
    if (laneError) return apiError('INTERNAL', 'No se pudo resolver la lane.')
    if (!lane) return apiError('NOT_FOUND', 'Lane no encontrada.')
    const laneRow = lane as { id: string; brand_id: string; archetype: Archetype }

    // Resolve the Mister session → its uuid PK. `tower.rfqs.mister_session_id`
    // FKs to `mister_projects.id` (uuid), NOT to the text `session_id` the
    // hook payload carries — those are two different columns on that table.
    const { data: session, error: sessionError } = await service
      .from('mister_projects')
      .select('id')
      .eq('session_id', body.session_id)
      .maybeSingle()
    if (sessionError) return apiError('INTERNAL', 'No se pudo resolver la sesión de Mister.')
    if (!session) return apiError('NOT_FOUND', 'Sesión de Mister no encontrada.')
    const sessionRow = session as { id: string }

    let accountId: string | null = null
    if (body.contact) {
      accountId = await upsertAccountFromContact(service, laneRow.brand_id, body.contact)
    }

    const { data: existingRfq, error: existingError } = await service
      .schema('tower')
      .from('rfqs')
      .select('id, account_id')
      .eq('mister_session_id', sessionRow.id)
      .maybeSingle()
    if (existingError) return apiError('INTERNAL', 'No se pudo leer el RFQ existente.')

    if (existingRfq) {
      const existing = existingRfq as { id: string; account_id: string | null }
      // Only ever fill a missing account — never overwrite a human-set one.
      // `finalAccountId` tracks what's actually persisted, so the response
      // never claims an account this call resolved-but-didn't-write (e.g. a
      // repeat call whose contact happens to match a *different* existing
      // account than the one already on this RFQ).
      let finalAccountId = existing.account_id
      if (accountId && !existing.account_id) {
        const { error: updateError } = await service
          .schema('tower')
          .from('rfqs')
          .update({ account_id: accountId })
          .eq('id', existing.id)
        if (updateError) return apiError('INTERNAL', 'No se pudo actualizar el RFQ.')
        finalAccountId = accountId
      }
      return NextResponse.json({
        data: { rfqId: existing.id, accountId: finalAccountId, created: false },
      })
    }

    const firstStage = getStages(laneRow.archetype)[0]?.id ?? 'inquiry'

    const { data: created, error: createError } = await service
      .schema('tower')
      .from('rfqs')
      .insert({
        brand_id: laneRow.brand_id,
        lane_id: laneRow.id,
        account_id: accountId,
        source: 'MISTER',
        stage: firstStage,
        mister_session_id: sessionRow.id,
        currency: 'USD',
      })
      .select('id')
      .single()
    if (createError || !created) return apiError('INTERNAL', 'No se pudo crear el RFQ.')

    return NextResponse.json({ data: { rfqId: (created as { id: string }).id, accountId, created: true } })
  } catch (error) {
    console.error('[api/hooks/mister]', error)
    return apiError('INTERNAL')
  }
}
