// src/lib/actions/rep-invite-logic.ts
// Pure, dependency-free logic for rep ENROLLMENT (the admin invite). Split out of
// rep-invite.ts for the same reason as admin-logic.ts / rep-profile-logic.ts: a
// `'use server'` file may only export async functions, and the load-bearing rules
// here — the invite payload shape and the membership-row mapping — are exactly
// what a reviewer wants covered by tests without mocking Supabase.
//
// A rep is enrolled against ONE membership target: either a represented brand
// (tower.rb_memberships) or a lane (tower.lane_memberships). The role vocabulary
// differs per table, so the target is a discriminated union — invalid (kind, role)
// pairings can never type-check or parse.
import { z } from 'zod'
import { RB_ROLES } from './represented-brands-logic'
import { LANE_ROLES } from './admin-logic'
import type { DbLaneRole } from './catalog-logic'

const laneRoleEnum = z.enum(LANE_ROLES as unknown as [DbLaneRole, ...DbLaneRole[]])

/** The two enrollment targets. `kind` discriminates the membership table + role set. */
export const repInviteTargetSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('brand'),
    brandId: z.string().uuid(),
    role: z.enum(RB_ROLES),
  }),
  z.object({
    kind: z.literal('lane'),
    laneId: z.string().uuid(),
    role: laneRoleEnum,
  }),
])
export type RepInviteTarget = z.infer<typeof repInviteTargetSchema>

export const repInviteSchema = z.object({
  email: z.string().trim().email().max(254),
  target: repInviteTargetSchema,
})
export type RepInviteInput = z.input<typeof repInviteSchema>

/** A membership insert, resolved from a target — the exact shape the existing
 *  grant tables take. onConflict names the composite PK so the insert is
 *  idempotent (re-enrolling the same (user, brand/lane, role) is a no-op). */
export interface MembershipInsert {
  table: 'rb_memberships' | 'lane_memberships'
  row: Record<string, string>
  onConflict: string
}

/**
 * Map an authorized invite target to its membership row. Pure — the action passes
 * the resolved userId (from the auth admin API) and hands `row` straight to the
 * service-role upsert against `table`.
 */
export function buildMembershipInsert(userId: string, target: RepInviteTarget): MembershipInsert {
  if (target.kind === 'brand') {
    return {
      table: 'rb_memberships',
      row: { user_id: userId, represented_brand_id: target.brandId, role: target.role },
      onConflict: 'user_id,represented_brand_id,role',
    }
  }
  return {
    table: 'lane_memberships',
    row: { user_id: userId, lane_id: target.laneId, role: target.role },
    onConflict: 'user_id,lane_id,role',
  }
}

/** Seed a full_name from the email local part (mirrors admin.inviteUser). */
export function displayNameFromEmail(email: string): string {
  return email.split('@')[0] ?? email
}
