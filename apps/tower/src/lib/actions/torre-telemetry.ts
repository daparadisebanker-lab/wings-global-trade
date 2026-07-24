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
import { productivitySummary, timeSavedEventsFromApprovals, type BriefTelemetry } from '@/lib/torre/brief'

const inputSchema = z.object({
  /** ISO date lower bound on reviewed_at (e.g. the week/month start). */
  since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  /** Optional lane scope. */
  laneId: z.string().uuid().optional(),
})
export type GetTorreTelemetryInput = z.infer<typeof inputSchema>

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
export async function getTorreTelemetry(input: GetTorreTelemetryInput = {}): Promise<ActionResult<BriefTelemetry>> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Entrada inválida / Invalid input')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  let q = auth.supabase
    .from('ai_drafts')
    .select('kind,lane_id,reviewed_at')
    .eq('status', 'APPROVED')
    .in('kind', TORRE_ARTIFACT_KINDS as unknown as string[])
    .limit(5000)
  if (parsed.data.since) q = q.gte('reviewed_at', parsed.data.since)
  if (parsed.data.laneId) q = q.eq('lane_id', parsed.data.laneId)

  const { data, error } = await q
  if (error) return fail('FORBIDDEN_LANE', 'No se pudo leer la telemetría / Could not read telemetry')

  const kinds = ((data ?? []) as { kind: string }[]).map((r) => r.kind as TorreArtifactKind)
  return ok(productivitySummary(timeSavedEventsFromApprovals(kinds)))
}
