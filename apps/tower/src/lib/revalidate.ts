// src/lib/revalidate.ts
// Publishing = state flip + snapshot + revalidation webhook (CLAUDE.md Directive
// 5 / ARCHITECTURE ADR-4). This module is the single place that turns "a product
// or lane's public catalog snapshot changed" into actual cache invalidation.
//
// PUBLIC CONTRACT: `triggerRevalidate`'s signature is locked — the Catalog Studio
// publish action calls it after writing a `product_versions` row, and
// `/api/hooks/revalidate` calls it too. Do not add required params; do not
// rename. `catalogTags`, `verifyRevalidateSignature` and `signRevalidatePayload`
// are stable helpers other TOWER code may use, but are not the frozen contract.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { recordWebhookDelivery } from '@/lib/webhook-deliveries'

export interface TriggerRevalidateInput {
  laneSlug: string
  /** Present when a single product (not just the lane listing) changed. */
  productSlug?: string
}

export interface RevalidateOutcome {
  ok: boolean
  paths: string[]
  tags: string[]
  error?: string
}

/**
 * Cache tags the public catalog reads are (or will be) tagged with. Exported so
 * a future tagged-fetch/`unstable_cache` layer over `_lib/data.ts` subscribes to
 * exactly the tags this module invalidates — one name, one place.
 */
export function catalogTags(laneSlug: string, productSlug?: string): string[] {
  const tags = [`catalog:lane:${laneSlug}`]
  if (productSlug) tags.push(`catalog:product:${laneSlug}:${productSlug}`)
  return tags
}

function catalogPaths(brandSlug: string, laneSlug: string, productSlug?: string): string[] {
  const paths = [`/api/public/catalog/${brandSlug}/${laneSlug}`]
  if (productSlug) paths.push(`/api/public/catalog/${brandSlug}/${laneSlug}/${productSlug}`)
  return paths
}

/**
 * Revalidate every public catalog path/tag affected by a publish.
 *
 * `laneSlug`/`productSlug` don't carry a brand (the contract is intentionally
 * minimal — see the header note). Brand is resolved dynamically from the tiny
 * `brands` table and fanned out across all of them: cheap (a handful of rows,
 * `revalidatePath` is O(1) per call) and correct even as endorsed brands are
 * added, with no hardcoded brand list to keep in sync.
 *
 * Never throws — a revalidation failure must not roll back or block a publish.
 * Errors are logged and surfaced on the returned outcome for the caller to
 * report (mirrors the "fire-and-forget, errors logged not thrown" notification
 * pattern used elsewhere in this codebase).
 */
export async function triggerRevalidate(input: TriggerRevalidateInput): Promise<RevalidateOutcome> {
  const tags = catalogTags(input.laneSlug, input.productSlug)
  const paths: string[] = []

  try {
    const supabase = createServiceClient()
    if (!supabase) {
      console.warn('[lib/revalidate] Supabase service client unavailable — tag-only revalidation')
    } else {
      const { data, error } = await supabase.from('brands').select('slug')
      if (error) throw error
      for (const row of (data ?? []) as Array<{ slug: string }>) {
        paths.push(...catalogPaths(row.slug, input.laneSlug, input.productSlug))
      }
    }

    for (const path of paths) revalidatePath(path)
    for (const tag of tags) revalidateTag(tag)

    // Record the outbound attempt for <WebhookHealth> (W5.B). Fire-and-forget:
    // recordWebhookDelivery never throws, so this cannot break or slow a publish
    // beyond one bounded insert. `reference` is the affected lane/product; the
    // detail carries only counts + tags, never PII.
    await recordWebhookDelivery({
      source: 'REVALIDATE_OUT',
      direction: 'OUTBOUND',
      status: 'OK',
      reference: input.productSlug ? `${input.laneSlug}/${input.productSlug}` : input.laneSlug,
      detail: { paths: paths.length, tags },
    })

    return { ok: true, paths, tags }
  } catch (error) {
    console.error('[lib/revalidate] triggerRevalidate failed', error)
    await recordWebhookDelivery({
      source: 'REVALIDATE_OUT',
      direction: 'OUTBOUND',
      status: 'FAILED',
      reference: input.productSlug ? `${input.laneSlug}/${input.productSlug}` : input.laneSlug,
      detail: { reason: 'revalidate_failed' },
    })
    return {
      ok: false,
      paths,
      tags,
      error: error instanceof Error ? error.message : 'Unknown revalidate failure',
    }
  }
}

// ── HTTP hook authentication (used by /api/hooks/revalidate) ────────────────
//
// The hook accepts a signed request rather than a bare shared-secret header so
// a captured/logged request can't be replayed against a different body. Same
// HMAC-over-raw-body shape as the ingest endpoint's per-brand signatures
// (API_MAP `POST /api/ingest`), just single-secret (`REVALIDATE_SECRET`).

const SIGNATURE_HEADER_PATTERN = /^sha256=([a-f0-9]{64})$/

/** `X-Revalidate-Signature: sha256=<hex hmac-sha256 of the raw request body>`. */
export function signRevalidatePayload(rawBody: string, secret = process.env.REVALIDATE_SECRET): string {
  if (!secret) throw new Error('REVALIDATE_SECRET is not configured')
  return `sha256=${createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`
}

/**
 * Constant-time verification of the `X-Revalidate-Signature` header against the
 * raw request body. Returns false (never throws) for any malformed input,
 * missing secret, or mismatch — the route always fails closed to UNAUTHORIZED.
 */
export function verifyRevalidateSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret = process.env.REVALIDATE_SECRET,
): boolean {
  if (!secret || !signatureHeader) return false
  const match = SIGNATURE_HEADER_PATTERN.exec(signatureHeader)
  if (!match) return false

  try {
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
    const presented = Buffer.from(match[1], 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    if (presented.length !== expectedBuf.length) return false
    return timingSafeEqual(presented, expectedBuf)
  } catch {
    return false
  }
}
