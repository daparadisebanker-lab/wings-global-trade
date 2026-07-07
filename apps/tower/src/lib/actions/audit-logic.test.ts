import { describe, expect, it } from 'vitest'
import {
  AUDIT_ACTIONS,
  AUDITED_TABLES,
  changedFields,
  diffAuditRow,
  valuesEqual,
} from './audit-logic'
import { auditKeysetClause, decodeAuditCursor, encodeAuditCursor } from './audit-cursor'

describe('audit-cursor · keyset round-trip', () => {
  it('encodes and decodes a cursor losslessly', () => {
    const cursor = { at: '2026-07-06T12:00:00.000Z', id: 4321 }
    const round = decodeAuditCursor(encodeAuditCursor(cursor))
    expect(round).toEqual(cursor)
  })

  it('returns null for empty, malformed, or wrong-shaped input', () => {
    expect(decodeAuditCursor(null)).toBeNull()
    expect(decodeAuditCursor(undefined)).toBeNull()
    expect(decodeAuditCursor('not-base64-json')).toBeNull()
    // id must be a number, not a string.
    expect(decodeAuditCursor(Buffer.from(JSON.stringify({ at: 'x', id: '5' })).toString('base64url'))).toBeNull()
  })

  it('builds a strictly-older keyset .or() clause', () => {
    expect(auditKeysetClause({ at: '2026-07-06T00:00:00.000Z', id: 10 })).toBe(
      'at.lt.2026-07-06T00:00:00.000Z,and(at.eq.2026-07-06T00:00:00.000Z,id.lt.10)',
    )
  })
})

describe('audit-logic · filter vocabulary', () => {
  it('exposes the three audit actions and a non-empty curated table set', () => {
    expect(AUDIT_ACTIONS).toEqual(['INSERT', 'UPDATE', 'DELETE'])
    expect(AUDITED_TABLES).toContain('products')
    expect(AUDITED_TABLES).toContain('rfqs')
    expect(AUDITED_TABLES.length).toBeGreaterThan(5)
  })
})

describe('audit-logic · JSON diff', () => {
  it('marks every field added on an INSERT (before null)', () => {
    const fields = diffAuditRow(null, { name: 'Lathe', moq: 10 })
    expect(fields.map((f) => f.change)).toEqual(['added', 'added'])
    // Sorted by key.
    expect(fields.map((f) => f.key)).toEqual(['moq', 'name'])
  })

  it('marks every field removed on a DELETE (after null)', () => {
    const fields = diffAuditRow({ name: 'Lathe' }, null)
    expect(fields).toEqual([{ key: 'name', change: 'removed', before: 'Lathe', after: undefined }])
  })

  it('distinguishes changed from unchanged on an UPDATE', () => {
    const before = { status: 'DRAFT', moq: 10, name: 'Lathe' }
    const after = { status: 'PUBLISHED', moq: 10, name: 'Lathe' }
    const all = diffAuditRow(before, after)
    expect(all.find((f) => f.key === 'status')!.change).toBe('changed')
    expect(all.find((f) => f.key === 'moq')!.change).toBe('unchanged')

    // changedFields drops the unchanged ones.
    const changed = changedFields(before, after)
    expect(changed).toHaveLength(1)
    expect(changed[0]).toMatchObject({ key: 'status', before: 'DRAFT', after: 'PUBLISHED' })
  })

  it('detects added and removed keys within an UPDATE', () => {
    const changed = changedFields({ a: 1, b: 2 }, { a: 1, c: 3 })
    const byKey = Object.fromEntries(changed.map((f) => [f.key, f.change]))
    expect(byKey).toEqual({ b: 'removed', c: 'added' })
  })

  it('compares nested values key-order-independently', () => {
    expect(valuesEqual({ x: 1, y: 2 }, { y: 2, x: 1 })).toBe(true)
    expect(valuesEqual({ x: 1 }, { x: 2 })).toBe(false)
    // A nested object that only reorders keys is unchanged.
    const changed = changedFields({ route: { origin: 'CN', destination: 'PE' } }, { route: { destination: 'PE', origin: 'CN' } })
    expect(changed).toHaveLength(0)
  })
})
