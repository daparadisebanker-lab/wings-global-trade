// src/app/api/ingest/route.ts
// POST /api/ingest — the public, first-party event endpoint every Wings/Áladín
// site posts to (API_MAP "POST /api/ingest"; ARCHITECTURE ADR-5). This is the
// ONLY writer of tower.events, and it enforces the four Wave-4 invariants in
// order, cheapest-and-most-hostile first:
//
//   1. HMAC (per-brand) — rejected BEFORE the body is parsed. An unsigned or
//      forged request never reaches JSON.parse, never touches the DB.
//   2. Shape validation — Zod against the ingest contract.
//   3. NO PII (Directive 6 / TOWER #6) — the raw body is swept for email/phone
//      shapes (incl. inside `meta`); a hit is rejected before any write.
//   4. Rate limit (per session_hash) — RATE_LIMITED once the window is spent.
//
// Only after all four pass is the event inserted via the SERVICE-ROLE client
// (events are service-role-only; RLS never grants authenticated/anon a write).
// Success is 202 Accepted — ingest is fire-and-forget for the caller.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiError } from '@/lib/api-errors'
import { createServiceClient } from '@/lib/supabase/server'
import {
  ingestEventSchema,
  verifyIngestSignature,
  bodyHasPiiShape,
  checkRateLimit,
  type IngestEventInput,
} from '@/lib/ingest'

export const dynamic = 'force-dynamic'
// Node runtime: the HMAC helper uses node:crypto, and the rate-limit bucket map
// wants a warm, long-lived instance (not the edge's tighter isolation).
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Read the raw body ONCE — HMAC must verify the exact bytes that were
    // signed, so we never re-serialize a parsed object.
    const rawBody = await request.text()
    const signature = request.headers.get('x-wings-signature')

    // 1 · HMAC gate — before any parsing. Tries every configured brand key and
    // tells us which brand's key matched (the body's brand claim isn't trusted
    // yet). No match → 401, and the DB is never touched.
    const auth = verifyIngestSignature(rawBody, signature)
    if (!auth.ok) return apiError('UNAUTHORIZED', 'Firma ausente o inválida.')

    // 2 · Parse + shape-validate.
    let parsed: unknown
    try {
      parsed = rawBody ? JSON.parse(rawBody) : {}
    } catch {
      return apiError('VALIDATION', 'Cuerpo de solicitud inválido (JSON malformado).')
    }

    const result = ingestEventSchema.safeParse(parsed)
    if (!result.success) {
      return apiError('VALIDATION', 'Datos inválidos.', result.error.flatten().fieldErrors)
    }
    const body: IngestEventInput = result.data

    // The signing key that verified must own the brand the body claims — a
    // valid Wings signature can never post an Áladín-branded event.
    if (body.brand !== auth.brand) {
      return apiError('UNAUTHORIZED', 'La firma no corresponde a la marca declarada.')
    }

    // 3 · NO PII (Directive 6). Sweep the raw body (minus the opaque
    // session_hash) for email/phone shapes anywhere, including `meta`.
    const pii = bodyHasPiiShape(rawBody, body.session_hash)
    if (pii) {
      // Never echo the offending value back — just the kind.
      return apiError('VALIDATION', `El evento contiene datos personales (${pii}). Los eventos no llevan PII.`)
    }

    // 4 · Rate limit per (brand, session_hash).
    const limit = checkRateLimit(`${body.brand}:${body.session_hash}`)
    if (!limit.allowed) {
      const res = apiError('RATE_LIMITED')
      res.headers.set('Retry-After', String(limit.retryAfterSeconds))
      return res
    }

    // Insert — service-role client, tower schema, the sole writer of events.
    const service = createServiceClient()
    if (!service) return apiError('INTERNAL', 'Almacenamiento de eventos no configurado.')

    const { error } = await service
      .schema('tower')
      .from('events')
      .insert({
        brand_slug: body.brand,
        lane_slug: body.lane,
        session_hash: body.session_hash,
        event: body.event,
        product_slug: body.product_slug ?? null,
        path: body.path ?? null,
        meta: body.meta ?? {},
      })
    if (error) {
      console.error('[api/ingest] insert failed', error)
      return apiError('INTERNAL', 'No se pudo registrar el evento.')
    }

    return NextResponse.json({ data: { accepted: true } }, { status: 202 })
  } catch (error) {
    console.error('[api/ingest]', error)
    return apiError('INTERNAL')
  }
}
