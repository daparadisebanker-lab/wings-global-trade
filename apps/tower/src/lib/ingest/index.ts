// src/lib/ingest — first-party event ingest surface (Wave 4, Signal loop).
//
// POST /api/ingest is public but HMAC-signed per brand
// (INGEST_HMAC_KEY_WINGS / INGEST_HMAC_KEY_ALADIN), rate-limited per
// session_hash, and carries NO PII (Directive 6) — email/phone-shaped payloads
// are rejected. Accepted events append into tower.events (service role only) →
// materialized rollups read by the Signal Deck.
//
// This barrel re-exports the ingest helpers; the route handler composes them.
export { INGEST_EVENTS, type IngestEvent } from './events'
export {
  INGEST_BRANDS,
  ingestEventSchema,
  type IngestBrand,
  type IngestEventInput,
} from './schema'
export { detectPiiShape, bodyHasPiiShape, type PiiKind } from './pii'
export { verifyIngestSignature, type IngestAuthOutcome } from './hmac'
export {
  checkRateLimit,
  DEFAULT_INGEST_RATE_LIMIT,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limit'
export { emitServerEvent, SERVER_SESSION, type ServerEventInput } from './emit'
