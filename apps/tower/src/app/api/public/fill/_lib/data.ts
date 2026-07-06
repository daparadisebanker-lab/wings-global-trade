// _lib/data.ts
// Server-only reads backing `GET /api/public/fill/{containerCode}` (API_MAP;
// CLAUDE.md Directive 5 "the public site is a read model"). Feeds the public
// "Trae tu grupo" FillMeter — `public_fill_visible = true` is the ONE line
// standing between this endpoint and leaking a private container's fill
// state, so it's asserted with its own regression test in data.test.ts.
//
// Uses the service-role client deliberately: the caller is an anonymous
// public site visitor with no `lane_memberships` row, so the proposed RLS
// policies (migration/wave3-container.sql — scoped to internal staff) would
// return nothing. The service key is only ever used server-side, inside this
// route tree, and never serialized back to the client.
import { createServiceClient } from '@/lib/supabase/server'
import { computeFillPercent } from '@/lib/actions/containers-logic'

export interface ContainerFillState {
  code: string
  capacityCbm: number
  committedCbm: number
  fillPercent: number
  status: string
  mode: string
}

/** Distinguishes "nothing there / not public" (→ 404) from "backend problem"
 * (→ 500). Deliberately the SAME error for "doesn't exist" and "exists but
 * private" — a public caller must never be able to tell the two apart. */
export type FillLookupError = 'NOT_FOUND' | 'UNAVAILABLE'

export type FillLookupOutcome = { ok: true; data: ContainerFillState } | { ok: false; error: FillLookupError }

interface ContainerRow {
  id: string
  code: string
  capacity_cbm: number | string
  status: string
  mode: string
  public_fill_visible: boolean
}

function toNumber(v: number | string): number {
  return typeof v === 'string' ? Number(v) : v
}

export async function getContainerFillState(containerCode: string): Promise<FillLookupOutcome> {
  const supabase = createServiceClient()
  if (!supabase) return { ok: false, error: 'UNAVAILABLE' }

  const container = await supabase
    .from('containers')
    .select('id, code, capacity_cbm, status, mode, public_fill_visible')
    .eq('code', containerCode)
    .maybeSingle()
  if (container.error) return { ok: false, error: 'UNAVAILABLE' }

  const row = container.data as ContainerRow | null
  // Same outcome whether the code doesn't exist at all or exists but is
  // private — never confirm the existence of a private container.
  if (!row || !row.public_fill_visible) return { ok: false, error: 'NOT_FOUND' }

  const commitments = await supabase
    .from('container_commitments')
    .select('cbm, status')
    .eq('container_id', row.id)
    .in('status', ['RESERVED', 'CONFIRMED', 'LOADED'])
  if (commitments.error) return { ok: false, error: 'UNAVAILABLE' }

  const committedCbm = ((commitments.data ?? []) as { cbm: number | string; status: string }[]).reduce(
    (total, c) => total + toNumber(c.cbm),
    0,
  )
  const capacityCbm = toNumber(row.capacity_cbm)

  return {
    ok: true,
    data: {
      code: row.code,
      capacityCbm,
      committedCbm,
      fillPercent: computeFillPercent(committedCbm, capacityCbm),
      status: row.status,
      mode: row.mode,
    },
  }
}
