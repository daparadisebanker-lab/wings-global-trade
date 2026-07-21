// Pure logic for Mister's save-draft seam — maps a proposed quote (from the
// quote-build capability) onto real QuoteLineDraft rows for composeQuote. Split
// from mister-quote.ts because a 'use server' file may only export async
// functions (mirrors pipeline.ts / pipeline-logic.ts). Unit-tested.

import { getDefaultUnit, type Archetype } from '@/lib/archetypes'
import type { QuoteLineDraft } from './pipeline'

/** One proposed line as it arrives from the dock (a serialized QuoteProposalLine). */
export interface ProposalLineInput {
  description: string
  quantity: number
  /** Integer minor units; null = a gap (no price yet) → dropped from the quote. */
  unitPriceMinor: number | null
}

/**
 * Map priced proposal lines onto QuoteLineDraft rows for `composeQuote`, anchored
 * to the archetype's DEFAULT negotiating unit. Gap lines (null price) are dropped
 * — a draft is composed only from lines that actually carry a price. The line
 * total is still recomputed server-side by composeQuote via the archetype engine;
 * this only supplies the shape (unitId, quantity, unitPriceMinor).
 */
export function toQuoteLineDrafts(archetype: Archetype, lines: ProposalLineInput[]): QuoteLineDraft[] {
  const unitId = getDefaultUnit(archetype).id
  return lines
    .filter((l) => l.unitPriceMinor !== null && l.unitPriceMinor >= 0 && l.quantity > 0)
    .map((l) => ({
      description: l.description.trim().slice(0, 500) || '—',
      unitId,
      quantity: l.quantity,
      unitPriceMinor: l.unitPriceMinor as number,
    }))
}
