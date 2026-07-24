'use server'
// src/lib/actions/torre-telemetry.ts
// Mister Torre — productivity telemetry (Loop L5). Reads APPROVED Torre artifacts in a
// window (RLS-scoped) and returns the "hours returned" rollup for the Friday/month-end
// Brief. Approvals are the honest signal — a human approved real work Mister drafted.
// Watch-signal resolutions are intentionally NOT counted here (they'd credit the machine's
// own auto-resolve; only human-resolved work should count, and that isn't tracked yet).
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { TORRE_ARTIFACT_KINDS, type TorreArtifactKind } from '@/lib/torre/artifacts'
import {
  productivitySummary,
  timeSavedEventsFromApprovals,
  type ApprovedArtifactRef,
  type BriefTelemetry,
} from '@/lib/torre/brief'

// A calendar date (YYYY-MM-DD, month 01-12 / day 01-31) OR a full ISO timestamp — so a caller
// can bound by brand-local midnight OR an exact instant. The month/day ranges are validated
// HERE so a nonsense date (2026-99-99) fails as VALIDATION and never reaches Postgres.
const dateOrTimestamp = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/)

// A "hours returned" rollup is always for a PERIOD. `since` is required so a forgotten bound
// can't silently turn a Friday digest into an all-time (inflated) number.
const inputSchema = z.object({
  /** Inclusive lower bound on reviewed_at — the week/month start (date or ISO timestamp). */
  since: dateOrTimestamp,
  /** Optional inclusive upper bound, so a late month-end run doesn't absorb the next period. */
  until: dateOrTimestamp.optional(),
  /** Optional lane scope. */
  laneId: z.string().uuid().optional(),
})
export type GetTorreTelemetryInput = z.infer<typeof inputSchema>

/** The row shape the rollup needs — id + lineage/pair links drive the double-count collapse. */
const CAP = 5000

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase: supabase.schema('tower') }
}

/** Productivity rollup: hours returned + counts from APPROVED Torre artifacts in the window. */
export async function getTorreTelemetry(input: GetTorreTelemetryInput): Promise<ActionResult<BriefTelemetry>> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Entrada inválida / Invalid input')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  // Select id + the lineage (ref) + pair (payload.hojaCostosRef) links so the collapse can run.
  // Newest-first + a hard cap; if the cap is hit we WARN (silent truncation would read as
  // "counted everything" when it didn't) — a busy brand should move to server-side aggregation.
  let q = auth.supabase
    .from('ai_drafts')
    .select('id,kind,ref_table,ref_id,payload,reviewed_at')
    .eq('status', 'APPROVED')
    .in('kind', TORRE_ARTIFACT_KINDS as unknown as string[])
    .gte('reviewed_at', parsed.data.since)
    .order('reviewed_at', { ascending: false })
    .limit(CAP)
  if (parsed.data.until) q = q.lte('reviewed_at', parsed.data.until)
  if (parsed.data.laneId) q = q.eq('lane_id', parsed.data.laneId)

  const { data, error } = await q
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo leer la telemetría / Could not read telemetry')

  const rows = (data ?? []) as TelemetryRow[]
  if (rows.length === CAP) {
    console.warn(`[torre/telemetry] approval window hit the ${CAP}-row cap — result undercounts; aggregate server-side`)
  }
  const approved: ApprovedArtifactRef[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind as TorreArtifactKind,
    // a revision links to its predecessor via ref_table='ai_drafts' (else the ref is an entity)
    supersedesId: r.ref_table === 'ai_drafts' ? r.ref_id : null,
    hojaCostosRef: hojaRefOf(r.payload),
  }))
  return ok(productivitySummary(timeSavedEventsFromApprovals(approved)))
}

interface TelemetryRow {
  id: string
  kind: string
  ref_table: string | null
  ref_id: string | null
  payload: unknown
  reviewed_at: string | null
}

/** The COTIZACION→HOJA pair link, read defensively from an untyped JSONB payload. */
function hojaRefOf(payload: unknown): string | null {
  if (payload && typeof payload === 'object' && 'hojaCostosRef' in payload) {
    const v = (payload as { hojaCostosRef?: unknown }).hojaCostosRef
    return typeof v === 'string' ? v : null
  }
  return null
}
