// src/lib/actions/pipeline-logic.ts
// Pure, dependency-free logic for the Pipeline (CRM) flow — RFQ capabilities,
// the archetype-driven default stage, quote line/total math, and quote/order
// state transitions. Deliberately split out of pipeline.ts: a `'use server'`
// file may only export async functions (Next.js constraint — see
// catalog.ts/catalog-logic.ts, session.ts/result.ts in Waves 1-2), and keeping
// the state-machine + money math here makes it testable without mocking
// Supabase (see pipeline.test.ts).
import { computeLineExtension, getStages, type Archetype } from '@/lib/archetypes'
import { addMinor, type Money } from '@/lib/money'
import type { DbLaneRole } from './catalog-logic'

export type { DbLaneRole } from './catalog-logic'

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export type OrderStatus =
  | 'CONTRACTED'
  | 'IN_PRODUCTION'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CLOSED'
  | 'CANCELLED'

export interface PipelineCapabilities {
  canCreateRfq: boolean
  canEditLines: boolean
  canAdvanceStage: boolean
  canComposeQuote: boolean
  canSendQuote: boolean
  canMarkQuoteStatus: boolean
  canConvertToOrder: boolean
}

const NO_CAPABILITIES: PipelineCapabilities = {
  canCreateRfq: false,
  canEditLines: false,
  canAdvanceStage: false,
  canComposeQuote: false,
  canSendQuote: false,
  canMarkQuoteStatus: false,
  canConvertToOrder: false,
}

/**
 * Derive UI capabilities from the user's real lane role(s) + group-admin flag.
 * PRESENTATION ONLY (mirrors catalog-logic.ts's computeCapabilities and its own
 * disclaimer): RLS re-checks every mutation server-side regardless of what
 * this returns. `rfqs`/`quotes`/`orders` are a single SALES + LANE_DIRECTOR
 * write boundary in DATABASE_SCHEMA.sql ("Same pattern: rfqs/quotes/orders →
 * SALES + LANE_DIRECTOR write") — there is no finer-grained RLS distinction
 * between creating an RFQ, advancing its stage, composing a quote, or
 * converting one to an order, so this deliberately does not invent one.
 */
export function computePipelineCapabilities(
  roles: DbLaneRole[],
  isGroupAdmin: boolean,
): PipelineCapabilities {
  const hasWrite = isGroupAdmin || roles.includes('SALES') || roles.includes('LANE_DIRECTOR')
  if (!hasWrite) return NO_CAPABILITIES
  return {
    canCreateRfq: true,
    canEditLines: true,
    canAdvanceStage: true,
    canComposeQuote: true,
    canSendQuote: true,
    canMarkQuoteStatus: true,
    canConvertToOrder: true,
  }
}

/**
 * The stage a freshly created RFQ opens on — always the archetype's first
 * stage (PipelineBoard's leftmost column). Reads `getStages` (lib/archetypes)
 * so it is correct for all six archetypes with zero branching here.
 */
export function defaultStageFor(archetype: Archetype): string {
  return getStages(archetype)[0].id
}

// ── Quote status transitions ────────────────────────────────────────────────

/** A quote may be sent only while it is still a draft. */
export function canSendQuote(status: QuoteStatus): boolean {
  return status === 'DRAFT'
}

/** A sent quote is the only one a human can mark ACCEPTED/REJECTED/EXPIRED —
 * a draft has nothing to accept, and a quote already resolved never re-opens
 * (append-only law: a new version is composed instead of mutating history). */
export function canMarkQuoteStatus(status: QuoteStatus): boolean {
  return status === 'SENT'
}

/** convertToOrder requires the quote to have actually been accepted — never
 * from DRAFT/SENT/REJECTED/EXPIRED. */
export function canConvertToOrder(status: QuoteStatus): boolean {
  return status === 'ACCEPTED'
}

// ── Quote line + total math (ADR-7: money is integer minor units) ──────────

export interface QuoteLineInput {
  rfqLineId?: string | null
  description: string
  unitId: string
  /** May be fractional for area/mass units (m², MT) — mirrors LineInput. */
  quantity: number
  /** Integer minor units. Never a float. */
  unitPriceMinor: number
  /** Per-unit CBM, required only for `cbmBearing` units. */
  cbmPerUnit?: number
}

export interface QuoteLineComputed extends QuoteLineInput {
  /** Line total, integer minor units. */
  totalMinor: number
  /** Derived container volume, present only for cbm-bearing units. */
  cbm?: number
}

/**
 * Server-computed line extensions — the lane's archetype unit math
 * (`computeLineExtension`, lib/archetypes) is the ONLY source of per-line
 * totals/CBM (CLAUDE.md Directive 2 + 3). Throws if a line's unit isn't valid
 * for the archetype or the price/quantity are dirty — the caller
 * (pipeline.ts) turns that into a VALIDATION `ActionResult`, never a
 * silently-accepted line.
 */
export function computeQuoteLines(
  archetype: Archetype,
  lines: QuoteLineInput[],
): QuoteLineComputed[] {
  return lines.map((line) => {
    const ext = computeLineExtension(archetype, {
      unitId: line.unitId,
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      cbmPerUnit: line.cbmPerUnit,
    })
    return { ...line, totalMinor: ext.totalMinor, cbm: ext.cbm }
  })
}

/**
 * Sums computed line totals into the quote total — integer minor units via
 * `lib/money#addMinor`, never a float (ADR-7). An empty line list totals zero
 * rather than throwing (`addMinor` rejects empty input, which is a valid
 * "quote in progress, no lines yet" state here).
 */
export function computeQuoteTotal(lines: QuoteLineComputed[], currency: string): number {
  if (lines.length === 0) return 0
  const items: Money[] = lines.map((l) => ({ minor: l.totalMinor, currency }))
  return addMinor(items).minor
}

/** Next `quotes.version` for an RFQ — same append-only law as
 * `product_versions` (max seen + 1, starting at 1, never reused or
 * reordered): a rejected/expired quote's history is never overwritten, a new
 * negotiation round is always a new version. */
export function nextQuoteVersion(existing: { version: number }[]): number {
  return existing.reduce((max, v) => Math.max(max, v.version), 0) + 1
}
