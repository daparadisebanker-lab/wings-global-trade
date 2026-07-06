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
      .from('lane_memberships')
      .select('role, lanes(id, code, slug, name, brand_id, accent)')

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
          accent: lane.accent ? String(lane.accent) : null,
        },
      ]
    })
  } catch {
    return []
  }
}
