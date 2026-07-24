'use server'
// src/lib/actions/torre-brief.ts
// Mister Torre — the Morning Brief action (L5 Reportar). Assembles the operator's Brief from
// three live sources, each RLS-scoped, then runs the tested pure core (buildMorningBrief):
//   · role      — resolved from the caller's lane memberships (widest role they hold);
//   · signals   — persisted tower.watch_signals (OPEN). Empty until the reconciler job runs
//                 (a flagged blocker), so the Brief is honestly quiet on signals meanwhile;
//   · drafts    — the pending Torre draft queue (listTorreDrafts), mapped to approvable asks;
//   · telemetry — the last 7 days' hours-returned rollup (getTorreTelemetry).
// Every part degrades to empty rather than failing the whole Brief (the shell never crashes on
// absent data). The scoping/ranking/stillness all live in buildMorningBrief — this only feeds it.
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { getIsGroupAdmin, getLaneMemberships } from '@/lib/lanes/memberships'
import { buildMorningBrief, type BriefCadence, type BriefTelemetry, type MorningBrief, type PendingDraft } from '@/lib/torre/brief'
import { pendingDraftFrom, resolveBriefRole, watchSignalFromRow, type RawWatchSignalRow } from '@/lib/torre/brief-view'
import type { WatchSignal } from '@/lib/torre/watch'
import { listTorreDrafts } from './torre-review'
import { getTorreTelemetry } from './torre-telemetry'

const TELEMETRY_WINDOW_DAYS = 7

export interface GetMorningBriefInput {
  cadence?: BriefCadence
}

/** Assemble today's Morning Brief for the caller (role-scoped, RLS-scoped, resilient). */
export async function getMorningBrief(input: GetMorningBriefInput = {}): Promise<ActionResult<MorningBrief>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const db = supabase.schema('tower')

  // Role: the widest role the operator holds across their lanes (group admin → director).
  const [memberships, isGroupAdmin] = await Promise.all([getLaneMemberships(), getIsGroupAdmin()])
  const role = resolveBriefRole(
    memberships.map((m) => m.role),
    isGroupAdmin,
  )

  // Signals: persisted OPEN watch signals, RLS-scoped. buildMorningBrief re-ranks + scopes by
  // role, so DB order is irrelevant; a malformed row is dropped by watchSignalFromRow.
  const { data: sigRows } = await db
    .from('watch_signals')
    .select('rule,severity,import_ref,title,detail,suggested_draft')
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false })
    .limit(200)
  const signals = ((sigRows ?? []) as RawWatchSignalRow[])
    .map(watchSignalFromRow)
    .filter((s): s is WatchSignal => s !== null)

  // Drafts + telemetry: reuse the existing RLS-scoped actions; each degrades to empty/omitted.
  const today = new Date().toISOString().slice(0, 10)
  const since = new Date(Date.now() - TELEMETRY_WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10)
  const [draftsRes, telemetryRes] = await Promise.all([listTorreDrafts(), getTorreTelemetry({ since })])
  const pendingDrafts: PendingDraft[] = draftsRes.data ? draftsRes.data.map(pendingDraftFrom) : []
  const telemetry: BriefTelemetry | undefined = telemetryRes.data ?? undefined

  return ok(buildMorningBrief({ role, date: today, cadence: input.cadence, signals, pendingDrafts, telemetry }))
}
