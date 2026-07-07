import { describe, expect, it } from 'vitest'
import {
  canApproveDraft,
  canRejectDraft,
  buildTriageApplyPatch,
  buildLeadScoreApplyPatch,
  buildSpecExtractProductInsert,
  mapDraftRow,
  type RawAiDraftRow,
} from './intelligence-logic'
import type { LeadScorePayload, SpecExtractPayload, TriagePayload } from '@/lib/ai'

describe('draft status guards', () => {
  it('only a DRAFT may be approved or rejected', () => {
    expect(canApproveDraft('DRAFT')).toBe(true)
    expect(canApproveDraft('APPROVED')).toBe(false)
    expect(canApproveDraft('REJECTED')).toBe(false)
    expect(canRejectDraft('DRAFT')).toBe(true)
    expect(canRejectDraft('APPROVED')).toBe(false)
  })
})

describe('buildTriageApplyPatch', () => {
  const base: TriagePayload = {
    proposedLaneId: 'lane-1',
    proposedLaneCode: 'WGT/01',
    proposedArchetype: 'EQUIPMENT',
    proposedStage: 'inquiry',
    accountId: null,
    draftReply: { es: 'a', en: 'b' },
  }
  it('maps lane + stage, omitting account_id when unmatched', () => {
    expect(buildTriageApplyPatch(base)).toEqual({ lane_id: 'lane-1', stage: 'inquiry' })
  })
  it('includes account_id when the model matched one', () => {
    expect(buildTriageApplyPatch({ ...base, accountId: 'acc-9' })).toEqual({
      lane_id: 'lane-1',
      stage: 'inquiry',
      account_id: 'acc-9',
    })
  })
})

describe('buildLeadScoreApplyPatch', () => {
  it('writes only the score (factors stay on the draft)', () => {
    const payload: LeadScorePayload = { score: 64, factors: [{ label: { es: 'x', en: 'x' }, weight: 10 }] }
    expect(buildLeadScoreApplyPatch(payload)).toEqual({ score: 64 })
  })
})

describe('buildSpecExtractProductInsert', () => {
  const payload: SpecExtractPayload = {
    archetype: 'EQUIPMENT',
    laneId: 'lane-7',
    name: { es: 'Tractor', en: 'Tractor' },
    suggestedSlug: 'yto-x904',
    specs: { model: 'X904' },
    fieldConfidences: { model: 0.9 },
    hsCode: '8701.92',
    sourcePath: 'brand/lane/doc.pdf',
  }
  it('creates a DRAFT product — NEVER PUBLISHED (core law)', () => {
    const row = buildSpecExtractProductInsert(payload, { brandId: 'brand-1', createdBy: 'user-1' })
    expect(row.status).toBe('DRAFT')
    expect(row.brand_id).toBe('brand-1')
    expect(row.lane_id).toBe('lane-7')
    expect(row.slug).toBe('yto-x904')
    expect(row.name).toEqual({ es: 'Tractor', en: 'Tractor' })
    expect(row.specs).toEqual({ model: 'X904' })
    expect(row.hs_code).toBe('8701.92')
    expect(row.created_by).toBe('user-1')
    expect(row.category_path).toEqual([])
  })
})

describe('mapDraftRow', () => {
  it('maps a snake_case row to camelCase and clamps confidence', () => {
    const raw: RawAiDraftRow = {
      id: 'd1',
      kind: 'TRIAGE',
      ref_table: 'rfqs',
      ref_id: 'rfq-1',
      brand_id: 'brand-1',
      lane_id: 'lane-1',
      payload: { proposedLaneCode: 'WGT/01' },
      confidence: '1.4', // out-of-range string from PostgREST → clamped to 1
      status: 'DRAFT',
      model: 'claude-haiku-4-5-20251001',
      created_by: 'user-1',
      created_at: '2026-07-06T00:00:00Z',
      reviewed_by: null,
      reviewed_at: null,
    }
    const rec = mapDraftRow(raw)
    expect(rec.refTable).toBe('rfqs')
    expect(rec.laneId).toBe('lane-1')
    expect(rec.confidence).toBe(1)
    expect(rec.status).toBe('DRAFT')
    expect(rec.reviewedBy).toBeNull()
  })
})
