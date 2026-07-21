// src/lib/ingest/emit.ts
// Server-side event emit — the internal counterpart to POST /api/ingest.
//
// Some events originate from a server action, not a browser (e.g. a rep
// ACTIVATING a container for promotion). They still land in tower.events, still
// carry NO PII (root CLAUDE.md Directive 6 / TOWER #6), and are still written
// ONLY through the SERVICE-ROLE client (events are service-role-only; RLS never
// grants a non-service write). No HMAC / rate-limit gate here — unlike the public
// route, the caller is already inside an authenticated, RLS-checked action.
//
// `session_hash` is NOT NULL and must never be PII. A server event has no browser
// session, so it carries an opaque, constant, non-PII marker (SERVER_SESSION):
// hash-alphabet only, so it also satisfies the public ingest schema's shape rule.
import { createServiceClient } from '@/lib/supabase/server'

/** Non-PII session marker for server-originated events (no browser session). */
export const SERVER_SESSION = 'srv_tower_action' as const

export interface ServerEventInput {
  /** Brand slug dimension (tower.brands.slug) — e.g. 'aladin'. NOT PII. */
  brand: string
  /** Lane dimension (tower.lanes.slug) — the analytics lane. */
  lane: string
  /** Event name. Free-text in tower.events; keep it stable + wholesale. */
  event: string
  /** Optional product slug dimension. */
  productSlug?: string | null
  /** Optional root-relative path context. */
  path?: string | null
  /** Shallow bag of scalars. NO PII — never an email / phone / name. */
  meta?: Record<string, string | number | boolean>
  /** Override the session marker (still must be non-PII). */
  sessionHash?: string
}

/**
 * Append one server-originated event into tower.events (service role only).
 * Fire-and-forget: on a missing service client or an insert error it returns
 * `{ ok: false }` and logs — it NEVER throws, so an analytics failure can never
 * break the mutation that emitted it (same discipline as the site's
 * fire-and-forget notification flow).
 */
export async function emitServerEvent(input: ServerEventInput): Promise<{ ok: boolean }> {
  try {
    const service = createServiceClient()
    if (!service) return { ok: false }
    const { error } = await service
      .schema('tower')
      .from('events')
      .insert({
        brand_slug: input.brand,
        lane_slug: input.lane,
        session_hash: input.sessionHash ?? SERVER_SESSION,
        event: input.event,
        product_slug: input.productSlug ?? null,
        path: input.path ?? null,
        meta: input.meta ?? {},
      })
    if (error) {
      console.error('[emitServerEvent] insert failed', error)
      return { ok: false }
    }
    return { ok: true }
  } catch (error) {
    console.error('[emitServerEvent]', error)
    return { ok: false }
  }
}
