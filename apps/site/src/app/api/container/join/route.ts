// src/app/api/container/join/route.ts
// Explicit member onboarding behind the container_offer card CTA (spec §3.3).
// Kept OUT of the Mister streaming path on purpose: joining writes rows, so it
// must be an intentional user action, not a stream side-effect that could
// duplicate members on retry. Sending the wa.me message was the WhatsApp
// opt-in; tapping "tomar mi cupo" here commits it.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { joinContainerByShortCode } from '@/lib/container/access'

const JoinSchema = z.object({
  shortCode: z.string().min(3).max(32).regex(/^[\w-]+$/),
  displayName: z.string().min(1).max(120).optional(),
  phone: z.string().min(7).max(20).optional(),
  // Passed back by a client that already holds an identity → idempotent rejoin.
  memberRef: z.string().min(3).max(64).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const data = JoinSchema.parse(await request.json())
    const result = await joinContainerByShortCode({
      shortCode: data.shortCode,
      displayName: data.displayName ?? null,
      phone: data.phone ?? null,
      memberRef: data.memberRef ?? null,
    })

    if (!result.ok) {
      const status = result.reason === 'not_found' || result.reason === 'closed' ? 404 : 500
      return NextResponse.json({ error: 'No se pudo unir al contenedor', code: result.reason }, { status })
    }

    return NextResponse.json({
      workspaceUrl: result.workspaceUrl,
      memberToken: result.memberToken,
      alreadyMember: result.alreadyMember,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: err.issues },
        { status: 400 },
      )
    }
    console.error('[container/join]', err)
    return NextResponse.json({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
