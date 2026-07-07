// src/lib/ingest/events.ts
// The event names accepted at ingest (API_MAP "POST /api/ingest").
// Kept in its own module so both the Zod schema (schema.ts) and non-Zod
// consumers (analytics rollups, tests) share ONE source of truth for the set.

/** The event names accepted at ingest, in funnel order where meaningful. */
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
