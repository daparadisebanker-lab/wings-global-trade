// POST /api/intelligence/brief  (API_MAP: POST /api/ai/brief; also weekly via n8n)
// A lane's rollups + pipeline snapshot → a Markdown brief DRAFT (sonnet). Auth'd;
// the brief lands as a DRAFT the lane director edits/accepts (approveBrief). It is
// never auto-published anywhere.
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { getIntelligenceClient, runWeeklyBrief } from '@/lib/ai'
import type { Archetype } from '@/lib/archetypes'
import { jsonError, jsonOk, requireApiUser, insertDraft } from '../_lib/drafts'

export const runtime = 'nodejs'
export const maxDuration = 60

const bodySchema = z.object({
  laneId: z.string().uuid(),
  /** ISO week key, e.g. '2026-W28'. Defaults to the current ISO week. */
  week: z
    .string()
    .regex(/^\d{4}-W\d{2}$/)
    .optional(),
})

interface LaneRow {
  id: string
  name: string
  slug: string
  archetype: string
  brand_id: string
}

function currentIsoWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function POST(request: NextRequest) {
  const gate = await requireApiUser()
  if (!gate.ok) return gate.response
  const { supabase, user } = gate

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    if (err instanceof ZodError) return jsonError('VALIDATION', 'Datos inválidos / Invalid data')
    return jsonError('INTERNAL', 'Error interno / Internal error')
  }

  const client = getIntelligenceClient()
  if (!client) return jsonError('AI_UNAVAILABLE', 'Intelligence no configurada / Intelligence not configured')

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('id,name,slug,archetype,brand_id')
    .eq('id', body.laneId)
    .maybeSingle()
  if (laneError || !lane) return jsonError('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access')
  const laneRow = lane as LaneRow

  const week = body.week ?? currentIsoWeek()

  // Pipeline snapshot: open RFQ counts by stage (from RFQs, not raw events).
  const { data: rfqs } = await supabase.from('rfqs').select('stage').eq('lane_id', laneRow.id)
  const stageCounts = new Map<string, number>()
  for (const r of (rfqs ?? []) as { stage: string }[]) stageCounts.set(r.stage, (stageCounts.get(r.stage) ?? 0) + 1)
  const pipelineSummary =
    stageCounts.size > 0
      ? [...stageCounts.entries()].map(([s, n]) => `- ${s}: ${n}`).join('\n')
      : '(no open RFQs this period)'

  // Metric rollups for the lane (dashboards query rollups, never raw events).
  const { data: rollups } = await supabase
    .from('metric_rollups_daily')
    .select('event,n,sessions')
    .eq('lane_slug', laneRow.slug)
    .limit(200)
  const eventTotals = new Map<string, number>()
  for (const r of (rollups ?? []) as { event: string; n: number | string }[]) {
    const n = typeof r.n === 'string' ? Number(r.n) : r.n
    eventTotals.set(r.event, (eventTotals.get(r.event) ?? 0) + (Number.isFinite(n) ? n : 0))
  }
  const rollupsSummary =
    eventTotals.size > 0
      ? [...eventTotals.entries()].map(([e, n]) => `- ${e}: ${n}`).join('\n')
      : '(no metric rollups for this lane yet)'

  let envelope
  try {
    envelope = await runWeeklyBrief(client, {
      laneId: laneRow.id,
      laneName: laneRow.name,
      archetype: laneRow.archetype as Archetype,
      week,
      rollupsSummary,
      pipelineSummary,
    })
  } catch (err) {
    console.error('[intelligence/brief]', err)
    return jsonError('AI_ERROR', 'No se pudo generar el resumen / Could not generate the brief')
  }

  const record = await insertDraft(supabase, {
    kind: 'WEEKLY_BRIEF',
    refTable: 'lanes',
    refId: laneRow.id,
    brandId: laneRow.brand_id,
    laneId: laneRow.id,
    envelope,
    createdBy: user.id,
  })
  if (!record) return jsonError('FORBIDDEN_LANE', 'No se pudo guardar el borrador / Could not save the draft')

  return jsonOk(record, 201)
}
