// src/lib/lanes/memberships.ts
// Server-side read of the current user's lane memberships — the data that drives
// the LaneSwitcher rail and (presentation-only) NavRail visibility. Fetched
// through the RLS-scoped server client: a user sees only their own memberships.
//
// Wave-1 resilience: the `tower` schema tables may not exist yet (a separate
// track owns the DB). Any failure — no env, no session, missing table — degrades
// to an EMPTY lane list. The shell must never crash on absent data.
import type { Role } from '@/lib/rbac'
import { createServerSupabase } from '@/lib/supabase/server'

export interface LaneMembership {
  laneId: string
  laneCode: string
  laneSlug: string
  laneName: string
  role: Role
  brandId: string
  /** Lane accent hex (livery-derived), used to tint stamps/chips. */
  accent: string | null
}

export async function getLaneMemberships(): Promise<LaneMembership[]> {
  const supabase = await createServerSupabase()
  if (!supabase) return []

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    // Shape aligns with the tower schema (lane_memberships → lanes). Finalized by
    // the DB track; until then this query errors and we degrade to [].
    const { data, error } = await supabase
      .schema('tower')
      .from('lane_memberships')
      .select('role, lanes(id, code, slug, name, brand_id)')

    if (error || !data) return []

    return data.flatMap((row: Record<string, unknown>): LaneMembership[] => {
      const lane = row.lanes as Record<string, unknown> | null
      if (!lane) return []
      return [
        {
          laneId: String(lane.id),
          laneCode: String(lane.code),
          laneSlug: String(lane.slug),
          laneName: String(lane.name),
          role: row.role as Role,
          brandId: String(lane.brand_id),
          // livery-derived accent; NOT a tower.lanes column. Wired from livery
          // config in a later wave — null keeps the shell on its default token.
          accent: null,
        },
      ]
    })
  } catch {
    return []
  }
}

/**
 * Group-admin status is `profiles.is_group_admin` — NOT a lane_memberships role.
 * Read separately (RLS-scoped: a user reads only their own profile row).
 * Degrades to false on any failure, so the shell never crashes.
 */
export async function getIsGroupAdmin(): Promise<boolean> {
  const supabase = await createServerSupabase()
  if (!supabase) return false
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase.schema('tower').from('profiles').select('is_group_admin').eq('id', user.id).maybeSingle()
    return Boolean((data as { is_group_admin?: boolean } | null)?.is_group_admin)
  } catch {
    return false
  }
}

/**
 * Whether the user holds ANY represented-brand membership (rb_memberships). A
 * "pure rep" has no lane role, so without this signal `visibleModules` would hide
 * every module and they'd sign in to an empty shell. Drives the `marcas` +
 * `catalog` (browse) + `signals` visibility for reps. RLS-scoped; degrades to
 * false. (Reads bare `rb_memberships`, matching this file's lane query.)
 */
export async function getHasRbMembership(): Promise<boolean> {
  const supabase = await createServerSupabase()
  if (!supabase) return false
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase.schema('tower').from('rb_memberships').select('role').limit(1)
    return Boolean(data && data.length > 0)
  } catch {
    return false
  }
}
