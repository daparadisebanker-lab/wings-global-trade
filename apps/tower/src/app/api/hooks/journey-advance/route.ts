// src/app/api/hooks/journey-advance/route.ts
// POST /api/hooks/journey-advance — the DETERMINISTIC automated milestone/phase
// advancer for import journeys. An n8n schedule (see
// automation/tower/journey-advance.workflow.json) hits this on an interval; the
// route reconciles each open journey's cached phase against its live underlying
// state via the SHARED derivation (lib/journeys/advance → planAdvancement). No
// AI, no arbitrary status writes: a journey can only move to the phase its own
// quote/order/container state + recorded hitos already imply, and only forward.
//
// AUTH: the standard TOWER hook contract — `X-Wings-Signature`
// (HMAC-SHA256 of the raw body, keyed by `JOURNEY_ADVANCE_SECRET`), verified with
// `verifyRevalidateSignature` BEFORE the body is parsed. Same shape as
// /api/hooks/whatsapp and /api/hooks/revalidate; a per-hook secret keeps blast
// radius small. Fails closed to UNAUTHORIZED.
//
// PII: the response and every emitted event carry journey ids + phase codes
// only — no account, contact, or figure (TOWER Directive 6).
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { verifyRevalidateSignature } from '@/lib/revalidate'
import { createServiceClient } from '@/lib/supabase/server'
import { runJourneyAdvance } from '@/lib/journeys/advance'

export const dynamic = 'force-dynamic'

// Optional body: target a single journey, or bound a batch scan. An empty body
// is valid — the default is "scan all open journeys, capped".
const bodySchema = z
  .object({
    journeyId: z.string().uuid().optional(),
    limit: z.number().int().positive().max(1000).optional(),
  })
  .strict()

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-wings-signature')

    if (!verifyRevalidateSignature(rawBody, signature, process.env.JOURNEY_ADVANCE_SECRET)) {
      return apiError('UNAUTHORIZED', 'Firma ausente o inválida.')
    }

    let parsedBody: unknown
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      return apiError('VALIDATION', 'Cuerpo de solicitud inválido (JSON malformado).')
    }

    const input = bodySchema.safeParse(parsedBody)
    if (!input.success) {
      return apiError('VALIDATION', 'Datos inválidos.', input.error.flatten().fieldErrors)
    }

    const result = await runJourneyAdvance({
      createService: createServiceClient,
      journeyId: input.data.journeyId,
      limit: input.data.limit,
    })
    if (!result) return apiError('INTERNAL', 'Supabase no configurado.')

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('[api/hooks/journey-advance]', error)
    return apiError('INTERNAL')
  }
}
