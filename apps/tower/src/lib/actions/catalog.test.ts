import { describe, expect, it } from 'vitest'
import {
  applyRollbackSnapshot,
  buildVersionSnapshot,
  canEditStatus,
  canPublish,
  canRetire,
  canRollback,
  canSubmitForReview,
  computeCapabilities,
  decodeCursor,
  encodeCursor,
  isCompleteForPublish,
  nextVersionNumber,
  buildMediaStoragePath,
  type ProductEditableFields,
} from './catalog-logic'

const baseProduct: ProductEditableFields = {
  slug: 'excavadora-cat-320',
  categoryPath: ['maquinaria', 'excavadoras'],
  name: { es: 'Excavadora CAT 320', en: 'CAT 320 Excavator' },
  specs: { weightKg: 20500 },
  specSchemaId: null,
  hsCode: '8429.52',
  moq: 1,
  cbmPerUnit: 42.5,
}

describe('catalog-logic · status transitions (DRAFT → IN_REVIEW → PUBLISHED)', () => {
  it('submit for review only from DRAFT', () => {
    expect(canSubmitForReview('DRAFT')).toBe(true)
    expect(canSubmitForReview('IN_REVIEW')).toBe(false)
    expect(canSubmitForReview('PUBLISHED')).toBe(false)
    expect(canSubmitForReview('RETIRED')).toBe(false)
  })

  it('publish allowed from DRAFT (director fast-track) or IN_REVIEW, never from PUBLISHED/RETIRED', () => {
    expect(canPublish('DRAFT')).toBe(true)
    expect(canPublish('IN_REVIEW')).toBe(true)
    expect(canPublish('PUBLISHED')).toBe(false)
    expect(canPublish('RETIRED')).toBe(false)
  })

  it('retire only from PUBLISHED — retire never deletes, and never re-retires', () => {
    expect(canRetire('PUBLISHED')).toBe(true)
    expect(canRetire('DRAFT')).toBe(false)
    expect(canRetire('IN_REVIEW')).toBe(false)
    expect(canRetire('RETIRED')).toBe(false)
  })

  it('rollback allowed from PUBLISHED (re-snapshot) or RETIRED (reinstate) only', () => {
    expect(canRollback('PUBLISHED')).toBe(true)
    expect(canRollback('RETIRED')).toBe(true)
    expect(canRollback('DRAFT')).toBe(false)
    expect(canRollback('IN_REVIEW')).toBe(false)
  })

  it('edits are blocked once a product has gone live', () => {
    expect(canEditStatus('DRAFT')).toBe(true)
    expect(canEditStatus('IN_REVIEW')).toBe(true)
    expect(canEditStatus('PUBLISHED')).toBe(false)
    expect(canEditStatus('RETIRED')).toBe(false)
  })
})

describe('catalog-logic · capabilities (presentation-only, mirrors RLS)', () => {
  it('no memberships and not a group admin → nothing', () => {
    expect(computeCapabilities([], false)).toEqual({
      canCreate: false,
      canEdit: false,
      canSubmitForReview: false,
      canPublish: false,
      canRetire: false,
      canRollback: false,
    })
  })

  it('CATALOG_EDITOR can create/edit/submit but never publish/retire/rollback', () => {
    const caps = computeCapabilities(['CATALOG_EDITOR'], false)
    expect(caps.canCreate).toBe(true)
    expect(caps.canEdit).toBe(true)
    expect(caps.canSubmitForReview).toBe(true)
    expect(caps.canPublish).toBe(false)
    expect(caps.canRetire).toBe(false)
    expect(caps.canRollback).toBe(false)
  })

  it('LANE_DIRECTOR gets every capability', () => {
    const caps = computeCapabilities(['LANE_DIRECTOR'], false)
    expect(caps.canPublish).toBe(true)
    expect(caps.canRetire).toBe(true)
    expect(caps.canRollback).toBe(true)
  })

  it('a group admin gets every capability even with zero lane_memberships rows', () => {
    const caps = computeCapabilities([], true)
    expect(caps.canPublish).toBe(true)
    expect(caps.canCreate).toBe(true)
  })

  it('TRADE_OPS/SALES/VIEWER alone grant no catalog-write capability', () => {
    for (const role of ['TRADE_OPS', 'SALES', 'VIEWER'] as const) {
      const caps = computeCapabilities([role], false)
      expect(caps.canCreate).toBe(false)
      expect(caps.canPublish).toBe(false)
    }
  })
})

describe('catalog-logic · publish snapshot + version numbering (ADR-4)', () => {
  it('builds a PUBLISHED snapshot carrying every editable field', () => {
    const snapshot = buildVersionSnapshot(baseProduct)
    expect(snapshot.status).toBe('PUBLISHED')
    expect(snapshot.name).toEqual(baseProduct.name)
    expect(snapshot.specs).toEqual(baseProduct.specs)
    expect(snapshot.cbmPerUnit).toBe(42.5)
  })

  it('version numbers start at 1 and always increment from the max seen — never reused', () => {
    expect(nextVersionNumber([])).toBe(1)
    expect(nextVersionNumber([{ version: 1 }])).toBe(2)
    expect(nextVersionNumber([{ version: 1 }, { version: 3 }, { version: 2 }])).toBe(4)
  })

  it('rollback restores editable fields from a snapshot, dropping the status tag', () => {
    const snapshot = buildVersionSnapshot(baseProduct)
    const restored = applyRollbackSnapshot(snapshot)
    expect(restored).toEqual(baseProduct)
    expect('status' in restored).toBe(false)
  })

  it('rollback is republish, not history rewrite: the caller re-snapshots the restored fields at the NEXT version number', () => {
    // Simulates: publish v1, publish v2, then roll back to v1's snapshot.
    const v1 = buildVersionSnapshot(baseProduct)
    const v2 = buildVersionSnapshot({ ...baseProduct, moq: 2 })
    const existing = [
      { version: 1, snapshot: v1 },
      { version: 2, snapshot: v2 },
    ]

    const restored = applyRollbackSnapshot(existing[0].snapshot)
    const v3 = buildVersionSnapshot(restored)
    const v3Number = nextVersionNumber(existing.map((v) => ({ version: v.version })))

    expect(v3Number).toBe(3)
    expect(v3.moq).toBe(1) // v1's value, not v2's — but written forward as v3
    expect(existing.map((v) => v.version)).toEqual([1, 2]) // history untouched
  })
})

describe('catalog-logic · publish completeness gate', () => {
  it('requires both ES and EN names plus at least one category segment', () => {
    expect(isCompleteForPublish(baseProduct)).toBe(true)
    expect(isCompleteForPublish({ ...baseProduct, name: { es: '', en: 'X' } })).toBe(false)
    expect(isCompleteForPublish({ ...baseProduct, name: { es: 'X', en: '   ' } })).toBe(false)
    expect(isCompleteForPublish({ ...baseProduct, categoryPath: [] })).toBe(false)
  })
})

describe('catalog-logic · cursor pagination', () => {
  it('round-trips a cursor through encode/decode', () => {
    const cursor = { updatedAt: '2026-07-06T12:00:00.000Z', id: 'abc-123' }
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor)
  })

  it('decodes null/undefined/garbage safely to null', () => {
    expect(decodeCursor(null)).toBeNull()
    expect(decodeCursor(undefined)).toBeNull()
    expect(decodeCursor('not-base64-json')).toBeNull()
  })
})

describe('catalog-logic · media storage path convention', () => {
  it('produces a stable, sanitized, kind-scoped path', () => {
    const path = buildMediaStoragePath({
      brandSlug: 'wings',
      laneSlug: 'machinery',
      productId: 'prod-1',
      kind: 'HERO',
      fileName: 'Excavator Photo (final) #1.jpg',
    })
    expect(path).toMatch(/^wings\/machinery\/prod-1\/hero\/\d+-excavator-photo--final---1\.jpg$/)
  })
})
