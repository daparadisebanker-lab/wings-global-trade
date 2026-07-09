// src/app/api/hooks/revalidate/route.ts
// Authenticated revalidation webhook (API_MAP "Route handlers (external /
// streaming)" — publishing revalidates the affected public catalog paths).
// Callers: the Catalog Studio publish action normally calls `triggerRevalidate`
// in-process (no HTTP hop needed — it's the same Next.js deployment). This HTTP
// route exists for out-of-process callers (n8n, an ops recovery script, a manual
// re-trigger) that need the same effect without importing server code directly.
//
// Every request must carry a valid `X-Revalidate-Signature` (HMAC-SHA256 of the
// raw body, keyed by `REVALIDATE_SECRET` — see lib/revalidate.ts). Unsigned,
// mismatched, or malformed requests are rejected before the body is even parsed.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiError } from '@/lib/api-errors'
import { triggerRevalidate, verifyRevalidateSignature } from '@/lib/revalidate'

export const dynamic = 'force-dynamic'

const revalidateRequestSchema = z.object({
  laneSlug: z.string().min(1),
  productSlug: z.string().min(1).optional(),
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

    const input = revalidateRequestSchema.safeParse(parsedBody)
    if (!input.success) {
      return apiError('VALIDATION', 'Datos inválidos.', input.error.flatten().fieldErrors)
    }

    const outcome = await triggerRevalidate(input.data)
    if (!outcome.ok) {
      // triggerRevalidate never throws — a failure here is a real backend issue
      // (e.g. Supabase unreachable), not a client error.
      return apiError('INTERNAL', 'No se pudo completar la revalidación.')
    }

    return NextResponse.json({ data: outcome })
  } catch (error) {
    console.error('[api/hooks/revalidate]', error)
    return apiError('INTERNAL')
  }
}
