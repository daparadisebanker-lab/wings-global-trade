// src/lib/ingest/schema.ts
// The wire contract for POST /api/ingest (API_MAP "POST /api/ingest").
// Events carry NO PII (root CLAUDE.md Directive 6 / TOWER #6): `session_hash`
// is an opaque anonymous token — never an email, phone, or name. Identity joins
// happen only at RFQ conversion, never here. The PII-shape guard in `pii.ts`
// runs in addition to this schema (a well-formed event can still smuggle PII
// into `meta`, so the raw body is scanned separately).
import { z } from 'zod'
import { INGEST_EVENTS } from './events'

/** Brands that own a per-brand HMAC signing key (see `hmac.ts`). */
export const INGEST_BRANDS = ['wings', 'aladin'] as const
export type IngestBrand = (typeof INGEST_BRANDS)[number]

// A slug segment: lowercase-ish alnum + dashes/slashes (lane slugs, product
// slugs). Deliberately narrow so nothing resembling contact data slips through.
const slugish = z.string().trim().min(1).max(160)

/**
 * The accepted ingest body. `session_hash` is required and constrained to a
 * hash-shaped token (hex/base64url alphabet, no `@`, no phone punctuation) so
 * the schema itself rejects the most obvious PII in the identity slot. `meta`
 * is a shallow bag of scalars — the PII scanner (pii.ts) still sweeps its
 * stringified form before anything is written.
 */
export const ingestEventSchema = z.object({
  brand: z.enum(INGEST_BRANDS),
  lane: slugish,
  event: z.enum(INGEST_EVENTS),
  // 16–128 chars of the hash alphabet only. An email or phone cannot match.
  session_hash: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{16,128}$/, 'session_hash must be an opaque hash token'),
  product_slug: slugish.optional(),
  path: z
    .string()
    .trim()
    .max(512)
    .regex(/^\/[^\s]*$/, 'path must be a root-relative URL path')
    .optional(),
  meta: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
})

export type IngestEventInput = z.infer<typeof ingestEventSchema>
