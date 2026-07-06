// src/lib/ingest — first-party event ingest surface.
//
// STUB — filled in Wave 4 (Signal loop). Per ARCHITECTURE ADR-5 / API_MAP
// POST /api/ingest: the endpoint is public but HMAC-signed per brand
// (INGEST_HMAC_KEY_WINGS / INGEST_HMAC_KEY_ALADIN), rate-limited per session_hash,
// and carries NO PII (Directive 6) — email/phone-shaped payloads are rejected.
// Events append-only into tower.events (monthly partitions) → materialized rollups.

/** The event names accepted at ingest (API_MAP POST /api/ingest). */
export const INGEST_EVENTS = [
  'page_view',
  'product_view',
  'spec_open',
  'fillmeter_interact',
  'mister_start',
  'mister_complete',
  'rfq_submit',
  'whatsapp_handoff',
] as const
export type IngestEvent = (typeof INGEST_EVENTS)[number]

export {}
