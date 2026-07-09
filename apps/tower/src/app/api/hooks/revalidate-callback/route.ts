// src/app/api/hooks/revalidate-callback/route.ts
// POST /api/hooks/revalidate-callback (API_MAP "Route handlers"): records the
// Vercel revalidation confirmation → <WebhookHealth>. Also the shared secured
// sink for n8n pipeline delivery status (pass an explicit `source`), so n8n
// jobs report health here rather than TOWER instrumenting each n8n route.
//
// AUTH — verify-before-parse, identical shape to /api/hooks/{mister,whatsapp}
// and /api/hooks/revalidate: every request carries a valid
// `X-Revalidate-Signature` (HMAC-SHA256 of the raw body, keyed by
// REVALIDATE_SECRET). This is the same revalidation trust domain as the
// outbound webhook, so it REUSES REVALIDATE_SECRET (no new env var — D-13/D-20
// already provision it). Unsigned/malformed requests are rejected before the
// body is parsed.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { verifyRevalidateSignature } from '@/lib/revalidate'
import { recordWebhookDelivery, SOURCE_KEY_PATTERN } from '@/lib/webhook-deliveries'

export const dynamic = 'force-dynamic'

const callbackSchema = z.object({
  // Default to the Vercel revalidation callback; n8n jobs override with e.g.
  // N8N_BRIEF. Constrained to the shared source-key shape.
  source: z.string().regex(SOURCE_KEY_PATTERN).default('REVALIDATE_CALLBACK'),
  status: z.enum(['OK', 'FAILED']).default('OK'),
  // What the delivery concerned (lane slug, deployment id, job ref). Non-PII.
  reference: z.string().trim().min(1).max(200).optional(),
  // Safe, non-PII metadata only — never a raw error string.
  detail: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-revalidate-signature')

    if (!verifyRevalidateSignature(rawBody, signature)) {
      return apiError('UNAUTHORIZED', 'Firma de revalidación ausente o inválida.')
    }

    let parsedBody: unknown
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      return apiError('VALIDATION', 'Cuerpo de solicitud inválido (JSON malformado).')
    }

    const input = callbackSchema.safeParse(parsedBody)
    if (!input.success) {
      return apiError('VALIDATION', 'Datos inválidos.', input.error.flatten().fieldErrors)
    }

    // INBOUND: someone (Vercel / n8n) is confirming a delivery to us.
    await recordWebhookDelivery({
      source: input.data.source,
      direction: 'INBOUND',
      status: input.data.status,
      reference: input.data.reference ?? null,
      detail: input.data.detail ?? {},
    })

    return NextResponse.json({ data: { recorded: true } })
  } catch (error) {
    console.error('[api/hooks/revalidate-callback]', error)
    return apiError('INTERNAL')
  }
}
