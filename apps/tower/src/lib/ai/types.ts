// src/lib/ai/types.ts
// The typed vocabulary of TOWER Intelligence (the Claude API layer, Wave 4).
//
// Directive 7 (CLAUDE.md core law) is encoded in these types, not just enforced
// at runtime: EVERY model output is an `AiDraft<T>` — a payload wrapped with its
// shown confidence — and it lands as an `AiDraftRecord` with `status = 'DRAFT'`.
// Nothing here has a shape that could auto-commit to published state, a quote, or
// a knowledge pack. Approval is a separate, human server action (see
// lib/actions/intelligence.ts) that flips the status and applies the draft.
import type { Archetype } from '@/lib/archetypes'
import type { Localized } from '@/lib/i18n'

// ── Models (TOWER stack; current IDs — do not downgrade) ────────────────────
// haiku = classify / score (fast, cheap, thinking off); opus = extract / brief
// (deepest reasoning). NOTE: adaptive thinking is ON by default on the reason
// model — both model seams disable it for these one-shot / tool-loop JSON calls
// so the small max_tokens budget isn't spent thinking (which would truncate the
// answer to empty). See THINKING_ON_BY_DEFAULT below.
export const INTELLIGENCE_MODELS = {
  classify: 'claude-haiku-4-5-20251001',
  reason: 'claude-opus-5',
} as const
export type IntelligenceModel = (typeof INTELLIGENCE_MODELS)[keyof typeof INTELLIGENCE_MODELS]

/** The models TOWER's seams explicitly send `thinking: { type: 'disabled' }` to.
 *  Two independent failure modes make thinking-on wrong for these calls:
 *    (a) one-shot extraction (lib/ai/client.ts) — a tight max_tokens spent thinking
 *        truncates the JSON answer to EMPTY, so Mister silently fails;
 *    (b) multi-step tool use (lib/torre/agent/anthropic-runner.ts) — thinking blocks
 *        in a tool_use turn must be replayed verbatim on the next turn, which the
 *        transcript rebuild does not do; leaving thinking on breaks turn 2.
 *  Sending an explicit disable is a no-op on a model that is already thinking-off, so
 *  this list can safely include the whole Opus/Sonnet 5-era set rather than only the
 *  thinking-on-by-default members. Haiku is thinking-off by default, so it's absent.
 *  DRIFT WARNING: membership is a byte-exact string match. Do NOT route the always-on
 *  thinking models (e.g. claude-fable-5) through these seams as-is — an explicit
 *  disable is rejected there; the correct move for such a model is to OMIT the param
 *  (which reintroduces the tool-loop replay bug, so it needs stepsToMessages to
 *  replay thinking blocks first). Neither seam's model is one of those today. */
export const THINKING_ON_BY_DEFAULT: ReadonlySet<string> = new Set([
  'claude-opus-5',
  'claude-opus-4-8',
  'claude-opus-4-7',
  'claude-sonnet-5',
])

// ── Draft taxonomy ───────────────────────────────────────────────────────────
export const DRAFT_KINDS = ['TRIAGE', 'LEAD_SCORE', 'SPEC_EXTRACT', 'WEEKLY_BRIEF'] as const
export type DraftKind = (typeof DRAFT_KINDS)[number]

export const DRAFT_STATUSES = ['DRAFT', 'APPROVED', 'REJECTED'] as const
export type DraftStatus = (typeof DRAFT_STATUSES)[number]

// ── The confidence-scored envelope every AI action returns ───────────────────
/** A model output wrapped with the confidence that MUST be shown to the reviewer. */
export interface AiDraft<T> {
  draft: T
  /** 0–1 model confidence, always surfaced to the human reviewer (Directive 7). */
  confidence: number
  model: IntelligenceModel
}

// ── Per-kind draft payloads ──────────────────────────────────────────────────

/** (1) Triage: an inbound RFQ classified to a proposed lane + archetype + stage. */
export interface TriagePayload {
  /** Resolved from a candidate lane the caller supplied — never a hallucinated uuid. */
  proposedLaneId: string
  proposedLaneCode: string
  proposedArchetype: Archetype
  /** The archetype's first stage — where a freshly-triaged RFQ should land. */
  proposedStage: string
  /** An existing account this inbound likely belongs to, if the model matched one. */
  accountId: string | null
  /** A suggested first reply (bilingual) for the human to edit — never auto-sent. */
  draftReply: Localized
  rationale?: string
}

/** (2) Lead score: 0–100 by archetype buying behaviour, with the factors behind it. */
export interface LeadScorePayload {
  /** Integer 0–100. */
  score: number
  factors: LeadScoreFactor[]
}
export interface LeadScoreFactor {
  label: Localized
  /** Signed contribution (roughly points); shown alongside the label. */
  weight: number
  detail?: string
}

/** (3) Spec-extract: a supplier document distilled into a specs draft for one product. */
export interface SpecExtractPayload {
  archetype: Archetype
  laneId: string
  /** Bilingual product name proposed from the document. */
  name: Localized
  suggestedSlug: string
  /** The extracted spec fields — keyed to the archetype's schema, validated at approval. */
  specs: Record<string, unknown>
  /** Per-field 0–1 confidence, so the reviewer sees which fields to double-check. */
  fieldConfidences: Record<string, number>
  hsCode?: string
  /** Storage path of the source document (audit trail). */
  sourcePath: string
}

/** (4) Weekly lane brief: a lane's rollups + pipeline summarized into a draft digest. */
export interface WeeklyBriefPayload {
  laneId: string
  /** ISO week key, e.g. '2026-W28'. */
  week: string
  /** Markdown body — the human edits before it is used anywhere. */
  markdown: string
  highlights: string[]
}

export type DraftPayloadFor<K extends DraftKind> = K extends 'TRIAGE'
  ? TriagePayload
  : K extends 'LEAD_SCORE'
    ? LeadScorePayload
    : K extends 'SPEC_EXTRACT'
      ? SpecExtractPayload
      : K extends 'WEEKLY_BRIEF'
        ? WeeklyBriefPayload
        : never

// ── The persisted draft record (mirror of tower.ai_drafts) ───────────────────
/** One row of tower.ai_drafts, mapped to camelCase. W4.C's review UI consumes this. */
export interface AiDraftRecord<K extends DraftKind = DraftKind> {
  id: string
  kind: K
  /** The real table a draft applies to on approval ('rfqs' | 'accounts' | 'products' | null). */
  refTable: string | null
  refId: string | null
  brandId: string
  laneId: string | null
  payload: DraftPayloadFor<K>
  /** 0–1, always shown. */
  confidence: number
  status: DraftStatus
  model: IntelligenceModel
  createdBy: string | null
  createdAt: string
  reviewedBy: string | null
  reviewedAt: string | null
}
