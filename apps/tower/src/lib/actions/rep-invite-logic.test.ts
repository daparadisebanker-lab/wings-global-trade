import { describe, expect, it } from 'vitest'
import {
  buildMembershipInsert,
  displayNameFromEmail,
  repInviteSchema,
} from './rep-invite-logic'

const UUID = '11111111-1111-4111-8111-111111111111'
const USER = '22222222-2222-4222-8222-222222222222'

describe('repInviteSchema', () => {
  it('accepts a brand enrollment with a valid RB role', () => {
    const r = repInviteSchema.safeParse({
      email: 'ana@brand.com',
      target: { kind: 'brand', brandId: UUID, role: 'BRAND_OPS' },
    })
    expect(r.success).toBe(true)
  })
  it('accepts a lane enrollment with a valid lane role', () => {
    const r = repInviteSchema.safeParse({
      email: 'ana@wings.com',
      target: { kind: 'lane', laneId: UUID, role: 'SALES' },
    })
    expect(r.success).toBe(true)
  })
  it('rejects a lane role used on a brand target (discriminated union)', () => {
    const r = repInviteSchema.safeParse({
      email: 'ana@brand.com',
      target: { kind: 'brand', brandId: UUID, role: 'SALES' },
    })
    expect(r.success).toBe(false)
  })
  it('rejects a brand role used on a lane target', () => {
    const r = repInviteSchema.safeParse({
      email: 'ana@wings.com',
      target: { kind: 'lane', laneId: UUID, role: 'BRAND_MANAGER' },
    })
    expect(r.success).toBe(false)
  })
  it('rejects a malformed email', () => {
    const r = repInviteSchema.safeParse({
      email: 'not-an-email',
      target: { kind: 'lane', laneId: UUID, role: 'SALES' },
    })
    expect(r.success).toBe(false)
  })
  it('rejects a non-uuid target id', () => {
    const r = repInviteSchema.safeParse({
      email: 'ana@wings.com',
      target: { kind: 'brand', brandId: 'nope', role: 'BRAND_VIEWER' },
    })
    expect(r.success).toBe(false)
  })
})

describe('buildMembershipInsert', () => {
  it('maps a brand target to an idempotent rb_memberships row', () => {
    const insert = buildMembershipInsert(USER, { kind: 'brand', brandId: UUID, role: 'BRAND_MANAGER' })
    expect(insert).toEqual({
      table: 'rb_memberships',
      row: { user_id: USER, represented_brand_id: UUID, role: 'BRAND_MANAGER' },
      onConflict: 'user_id,represented_brand_id,role',
    })
  })
  it('maps a lane target to an idempotent lane_memberships row', () => {
    const insert = buildMembershipInsert(USER, { kind: 'lane', laneId: UUID, role: 'CATALOG_EDITOR' })
    expect(insert).toEqual({
      table: 'lane_memberships',
      row: { user_id: USER, lane_id: UUID, role: 'CATALOG_EDITOR' },
      onConflict: 'user_id,lane_id,role',
    })
  })
  it('onConflict names the full composite PK so re-enrollment is a no-op', () => {
    const brand = buildMembershipInsert(USER, { kind: 'brand', brandId: UUID, role: 'BRAND_OPS' })
    expect(brand.onConflict.split(',')).toHaveLength(3)
  })
})

describe('displayNameFromEmail', () => {
  it('takes the local part before @', () => {
    expect(displayNameFromEmail('ana.vega@brand.com')).toBe('ana.vega')
  })
})
