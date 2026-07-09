// POST /api/intelligence/score  (API_MAP: POST /api/ai/score — nightly batch)
// Lead-score an account 0–100 by the lane's archetype behaviour (haiku). Auth'd;
// the score lands as a DRAFT — approveLeadScore writes accounts.score, not this.
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { getIntelligenceClient, runLeadScore } from '@/lib/ai'
import type { Archetype } from '@/lib/archetypes'
import { jsonError, jsonOk, requireApiUser, insertDraft } from '../_lib/drafts'

export const runtime = 'nodejs'
export const maxDuration = 30

const bodySchema = z.object({
  accountId: z.string().uuid(),
  /** The lane whose archetype frames the scoring (accounts span lanes). */
  laneId: z.string().uuid(),
})

interface AccountRow {
  id: string
  name: string
  country: string | null
  region: string | null
  brand_id: string
}
interface LaneRow {
  archetype: string
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

  const [{ data: account, error: accErr }, { data: lane, error: laneErr }] = await Promise.all([
    supabase.from('accounts').select('id,name,country,region,brand_id').eq('id', body.accountId).maybeSingle(),
    supabase.from('lanes').select('archetype').eq('id', body.laneId).maybeSingle(),
  ])
  if (accErr || !account) return jsonError('FORBIDDEN_LANE', 'Cuenta no encontrada o sin acceso / Account not found or no access')
  if (laneErr || !lane) return jsonError('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access')

  const acc = account as AccountRow
  const archetype = (lane as LaneRow).archetype as Archetype

  // Signals: recent RFQ stages for this account (rollups/pipeline, not raw events).
  const { data: rfqs } = await supabase
    .from('rfqs')
    .select('stage,source,created_at')
    .eq('account_id', acc.id)
    .order('created_at', { ascending: false })
    .limit(50)
  const signals =
    (rfqs ?? []).length > 0
      ? (rfqs as { stage: string; source: string; created_at: string }[])
          .map((r) => `- RFQ ${r.source} · stage=${r.stage} · ${r.created_at}`)
          .join('\n')
      : '(no RFQ history yet)'

  let envelope
  try {
    envelope = await runLeadScore(client, {
      archetype,
      account: { name: acc.name, country: acc.country, region: acc.region },
      signals,
    })
  } catch (err) {
    console.error('[intelligence/score]', err)
    return jsonError('AI_ERROR', 'No se pudo generar el puntaje / Could not generate the score')
  }

  const record = await insertDraft(supabase, {
    kind: 'LEAD_SCORE',
    refTable: 'accounts',
    refId: acc.id,
    brandId: acc.brand_id,
    laneId: body.laneId,
    envelope,
    createdBy: user.id,
  })
  if (!record) return jsonError('FORBIDDEN_LANE', 'No se pudo guardar el borrador / Could not save the draft')

  return jsonOk(record, 201)
}
