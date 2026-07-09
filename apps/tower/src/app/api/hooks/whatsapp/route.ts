// src/app/api/hooks/whatsapp/route.ts
// POST /api/hooks/whatsapp — n8n WhatsApp inbound (API_MAP): "threads message
// onto matching account/RFQ (by number), else Triage Queue." API_MAP doesn't
// specify a body shape for this hook (unlike /api/hooks/mister); the shape
// below is this builder's resolution — see the report for the exact fields
// and reasoning.
//
// AUTH: same HMAC contract as every other TOWER hook — `X-Wings-Signature`
// (HMAC-SHA256 of the raw body, keyed by `WHATSAPP_HOOK_SECRET`), verified
// before the body is parsed. Reuses `verifyRevalidateSignature`
// (lib/revalidate.ts), documented there as reusable by other TOWER code.
//
// PII LAW: unlike the analytics ingest endpoint (`/api/ingest`, Directive 6 —
// anonymous session_hash, no PII), a WhatsApp message is identity-first by
// definition: the whole point of the hook is threading a real phone number's
// conversation. Directive 6's "no PII at ingest" governs the anonymous
// events pipeline; the carve-out in that same directive — "identity joins
// only at RFQ conversion" — is precisely what this hook performs. Rejecting
// phone-shaped payloads here would break the feature. What this hook does
// NOT do: manufacture a new account from a bare, unconfirmed number. If the
// sender doesn't match an existing `tower.contacts.whatsapp`, the message is
// stored unlinked (account_id + rfq_id both null) — a literal Triage Queue
// row, exactly the API_MAP phrase — for a human to link by hand. Same
// restraint on the RFQ side: `rfqs.lane_id` is NOT NULL, so a new RFQ is only
// ever created when the payload can supply a lane (`lane_hint`); otherwise
// the message attaches to the account with no RFQ, or nothing at all.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { verifyRevalidateSignature } from '@/lib/revalidate'
import { createServiceClient } from '@/lib/supabase/server'
import { getStages, type Archetype } from '@/lib/archetypes'

export const dynamic = 'force-dynamic'

// Loose E.164-ish check — good enough to reject garbage, not a full validator.
const PHONE_RE = /^\+?[1-9]\d{6,14}$/

const whatsappHookSchema = z.object({
  wa_message_id: z.string().trim().min(1),
  from: z.string().trim().regex(PHONE_RE, 'must be E.164-shaped'),
  to: z.string().trim().regex(PHONE_RE, 'must be E.164-shaped'),
  body: z.string().trim().min(1).max(4096),
  occurred_at: z.string().datetime().optional(),
  direction: z.enum(['INBOUND', 'OUTBOUND']).default('INBOUND'),
  // Lane slug, only consulted when no existing account/RFQ match is found and
  // a brand-new RFQ needs a lane to be created in. Optional because most
  // inbound replies land on an account that already has an open RFQ.
  lane_hint: z.string().trim().min(1).optional(),
})

type WhatsappHookInput = z.infer<typeof whatsappHookSchema>

function normalizePhone(raw: string): string {
  return raw.startsWith('+') ? raw : `+${raw}`
}

async function findWingsBrandId(service: SupabaseClient): Promise<string | null> {
  // WhatsApp is Wings-only, mirroring Mister (ecosystem CLAUDE.md §5.2:
  // endorsed brands get their own separate WhatsApp/CRM lanes).
  const { data } = await service.schema('tower').from('brands').select('id').eq('slug', 'wings').maybeSingle()
  return (data as { id: string } | null)?.id ?? null
}

async function findAccountIdByPhone(service: SupabaseClient, phone: string): Promise<string | null> {
  const { data } = await service.schema('tower').from('contacts').select('account_id').eq('whatsapp', phone).limit(1)
  return (data as { account_id: string }[] | null)?.[0]?.account_id ?? null
}

async function findLatestRfqForAccount(service: SupabaseClient, accountId: string): Promise<string | null> {
  const { data } = await service
    .schema('tower')
    .from('rfqs')
    .select('id')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(1)
  return (data as { id: string }[] | null)?.[0]?.id ?? null
}

async function createRfqForAccount(
  service: SupabaseClient,
  brandId: string,
  accountId: string,
  laneSlug: string,
): Promise<string | null> {
  const { data: lane, error: laneError } = await service
    .schema('tower')
    .from('lanes')
    .select('id, archetype')
    .eq('brand_id', brandId)
    .eq('slug', laneSlug)
    .maybeSingle()
  if (laneError || !lane) return null

  const laneRow = lane as { id: string; archetype: Archetype }
  const firstStage = getStages(laneRow.archetype)[0]?.id ?? 'inquiry'

  const { data: created, error: createError } = await service
    .schema('tower')
    .from('rfqs')
    .insert({
      brand_id: brandId,
      lane_id: laneRow.id,
      account_id: accountId,
      source: 'WHATSAPP',
      stage: firstStage,
      currency: 'USD',
    })
    .select('id')
    .single()
  if (createError || !created) return null

  return (created as { id: string }).id
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-wings-signature')

    if (!verifyRevalidateSignature(rawBody, signature, process.env.WHATSAPP_HOOK_SECRET)) {
      return apiError('UNAUTHORIZED', 'Firma ausente o inválida.')
    }

    let parsedBody: unknown
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      return apiError('VALIDATION', 'Cuerpo de solicitud inválido (JSON malformado).')
    }

    const input = whatsappHookSchema.safeParse(parsedBody)
    if (!input.success) {
      return apiError('VALIDATION', 'Datos inválidos.', input.error.flatten().fieldErrors)
    }
    const body: WhatsappHookInput = input.data

    const service = createServiceClient()
    if (!service) return apiError('INTERNAL', 'Supabase no configurado.')

    // Idempotency: webhook redelivery must not duplicate the message.
    const { data: existingMessage, error: existingError } = await service
      .schema('tower')
      .from('whatsapp_messages')
      .select('id, rfq_id, account_id')
      .eq('wa_message_id', body.wa_message_id)
      .maybeSingle()
    if (existingError) return apiError('INTERNAL', 'No se pudo verificar el mensaje.')
    if (existingMessage) {
      const existing = existingMessage as { id: string; rfq_id: string | null; account_id: string | null }
      return NextResponse.json({
        data: {
          messageId: existing.id,
          rfqId: existing.rfq_id,
          accountId: existing.account_id,
          triaged: !existing.rfq_id,
          duplicate: true,
        },
      })
    }

    const from = normalizePhone(body.from)
    const to = normalizePhone(body.to)

    const accountId = await findAccountIdByPhone(service, from)

    let rfqId: string | null = null
    if (accountId) {
      rfqId = await findLatestRfqForAccount(service, accountId)
      if (!rfqId && body.lane_hint) {
        const brandId = await findWingsBrandId(service)
        if (brandId) rfqId = await createRfqForAccount(service, brandId, accountId, body.lane_hint)
      }
    }
    // No account match: message stays fully unlinked (Triage Queue) — see
    // header note. We never fabricate an account from a bare number here.

    const { data: message, error: insertError } = await service
      .schema('tower')
      .from('whatsapp_messages')
      .insert({
        rfq_id: rfqId,
        account_id: accountId,
        direction: body.direction,
        wa_message_id: body.wa_message_id,
        from_number: from,
        to_number: to,
        body: body.body,
        occurred_at: body.occurred_at ?? new Date().toISOString(),
      })
      .select('id')
      .single()
    if (insertError || !message) return apiError('INTERNAL', 'No se pudo registrar el mensaje.')

    return NextResponse.json({
      data: {
        messageId: (message as { id: string }).id,
        rfqId,
        accountId,
        triaged: !rfqId,
      },
    })
  } catch (error) {
    console.error('[api/hooks/whatsapp]', error)
    return apiError('INTERNAL')
  }
}
