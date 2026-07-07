// src/lib/actions/intelligence-logic.ts
// PURE approval logic for AI drafts — no Supabase, no auth. The server actions
// (intelligence.ts, 'use server') wire these to the RLS-scoped client; keeping the
// draft → applied-record transition here (like catalog-logic.ts) is what makes it
// unit-testable while the DB is mocked.
//
// The core law lives in these builders: a spec-extract draft becomes a product
// with status 'DRAFT' — NEVER 'PUBLISHED'; nothing here can auto-commit.
import type {
  AiDraftRecord,
  DraftKind,
  DraftStatus,
  IntelligenceModel,
  LeadScorePayload,
  SpecExtractPayload,
  TriagePayload,
} from '@/lib/ai'

// ── Status guards ────────────────────────────────────────────────────────────

/** Only a pending draft may be approved. An already-reviewed draft is immutable. */
export function canApproveDraft(status: DraftStatus): boolean {
  return status === 'DRAFT'
}
/** Only a pending draft may be rejected. */
export function canRejectDraft(status: DraftStatus): boolean {
  return status === 'DRAFT'
}

// ── Apply builders (draft payload → the real record's mutation) ──────────────

/** Triage approval: set the RFQ's lane + stage (+ account if the model matched one). */
export function buildTriageApplyPatch(payload: TriagePayload): {
  lane_id: string
  stage: string
  account_id?: string
} {
  return {
    lane_id: payload.proposedLaneId,
    stage: payload.proposedStage,
    ...(payload.accountId ? { account_id: payload.accountId } : {}),
  }
}

/** Lead-score approval: write the account's score. Factors stay on the draft (audit). */
export function buildLeadScoreApplyPatch(payload: LeadScorePayload): { score: number } {
  return { score: payload.score }
}

export interface SpecExtractInsertContext {
  brandId: string
  createdBy: string | null
}

/**
 * Spec-extract approval: the draft becomes a NEW product with status 'DRAFT'. A
 * catalog editor completes and publishes it through the normal Catalog Studio
 * flow — Intelligence never publishes (Directive 7 + core law).
 */
export function buildSpecExtractProductInsert(
  payload: SpecExtractPayload,
  ctx: SpecExtractInsertContext,
): {
  brand_id: string
  lane_id: string
  slug: string
  status: 'DRAFT'
  category_path: string[]
  name: { es: string; en: string }
  specs: Record<string, unknown>
  hs_code: string | null
  created_by: string | null
} {
  return {
    brand_id: ctx.brandId,
    lane_id: payload.laneId,
    slug: payload.suggestedSlug,
    status: 'DRAFT',
    category_path: [],
    name: payload.name,
    specs: payload.specs,
    hs_code: payload.hsCode ?? null,
    created_by: ctx.createdBy,
  }
}

// ── Row mapping (tower.ai_drafts row → AiDraftRecord) ────────────────────────

export interface RawAiDraftRow {
  id: string
  kind: string
  ref_table: string | null
  ref_id: string | null
  brand_id: string
  lane_id: string | null
  payload: unknown
  confidence: number | string | null
  status: string
  model: string
  created_by: string | null
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

function toNumber(v: number | string | null | undefined): number {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export function mapDraftRow<K extends DraftKind = DraftKind>(row: RawAiDraftRow): AiDraftRecord<K> {
  return {
    id: row.id,
    kind: row.kind as K,
    refTable: row.ref_table,
    refId: row.ref_id,
    brandId: row.brand_id,
    laneId: row.lane_id,
    payload: (row.payload ?? {}) as AiDraftRecord<K>['payload'],
    confidence: Math.min(1, Math.max(0, toNumber(row.confidence))),
    status: row.status as DraftStatus,
    model: row.model as IntelligenceModel,
    createdBy: row.created_by,
    createdAt: row.created_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  }
}
