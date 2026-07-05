// src/app/api/mister/session/route.ts
// GET /api/mister/session?id=<sessionId> — rehydrate a persisted Mister session.
// Lets a returning client (reload, navigation, or the floating widget ↔ /mister
// hand-off) restore the conversation the POST endpoint already keyed by session_id.
// Returns ONLY sanitized fields — never flags, internal ids, or in_flight.
// Authoritative: mister-intelligence-audit.md §7, CLAUDE.md "API Error Handling"

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/mister/rateLimit'
import type { MisterProjectRow } from '@/types/mister'

export const runtime = 'nodejs'

// Mirror generateSessionId()'s WGT-YYYYMM-XXXXXX shape (MisterProvider.tsx).
const SessionQuerySchema = z.object({
  id: z
    .string()
    .max(128)
    .regex(/^WGT-\d{6}-[A-Z0-9]{6}$/),
})

// Only the fields a client needs to rebuild its view — no flags, ids, or in_flight.
type SessionRehydration = Pick<
  MisterProjectRow,
  'archetype' | 'stage' | 'locale' | 'collected' | 'turn_count' | 'history'
>

export async function GET(request: NextRequest) {
  try {
    const { id: sessionId } = SessionQuerySchema.parse({
      id: request.nextUrl.searchParams.get('id'),
    })

    // Rate limit (IP) — same limiter the POST endpoint uses.
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      '127.0.0.1'

    const rlResult = await checkRateLimit(ip)
    if (!rlResult.allowed) {
      return NextResponse.json(
        {
          error: 'Demasiadas consultas en poco tiempo. Espera un momento — vuelvo enseguida.',
          code: 'RATE_LIMITED',
          retryAfterMs: rlResult.retryAfterMs,
        },
        { status: 429 },
      )
    }

    const supabase = createServiceClient()
    if (!supabase) {
      // Dev mode without Supabase — no persistence store. Report not-found so
      // the client falls back to a fresh session instead of hanging.
      return NextResponse.json(
        { error: 'Sesión no encontrada', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    const { data, error } = await supabase
      .from('mister_projects')
      .select('archetype, stage, locale, collected, turn_count, history')
      .eq('session_id', sessionId)
      .single<SessionRehydration>()

    if (error || !data) {
      // A stale id is normal (expired tab, cleared DB) — not worth logging,
      // and the Supabase error must never leak to the client.
      return NextResponse.json(
        { error: 'Sesión no encontrada', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      archetype: data.archetype,
      stage: data.stage,
      locale: data.locale,
      collected: data.collected ?? {},
      turn_count: data.turn_count,
      history: data.history ?? [],
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: err.errors },
        { status: 400 },
      )
    }
    console.error('[api/mister/session]', err)
    return NextResponse.json(
      { error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
  }
}
