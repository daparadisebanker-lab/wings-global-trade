// POST /api/intelligence/triage  (API_MAP: POST /api/ai/triage)
// Classify an inbound RFQ enquiry → proposed lane + archetype + stage DRAFT
// (haiku). Auth'd; the draft lands in tower.ai_drafts — never applied here.
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { getIntelligenceClient, runTriage, type TriageLane } from '@/lib/ai'
import { getArchetypeConfig, type Archetype } from '@/lib/archetypes'
import { jsonError, jsonOk, requireApiUser, insertDraft } from '../_lib/drafts'

export const runtime = 'nodejs'
export const maxDuration = 30

const bodySchema = z.object({
  text: z.string().min(1).max(8000),
  /** The inbound RFQ this triage annotates, if it already exists. */
  rfqId: z.string().uuid().optional(),
})

const ARCHETYPES = ['EQUIPMENT', 'PROJECT', 'COMMODITY', 'PROGRAM', 'CREDENTIAL', 'ORIGIN'] as const

interface LaneRow {
  id: string
  code: string
  name: string
  archetype: string
  brand_id: string
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

  // Candidate lanes: those the caller can read (RLS-scoped), non-archived.
  const { data: laneData, error: laneError } = await supabase
    .from('lanes')
    .select('id,code,name,archetype,brand_id')
    .neq('status', 'ARCHIVED')
  if (laneError) return jsonError('FORBIDDEN_LANE', 'No se pudieron leer las lanes / Could not read lanes')

  const laneRows = ((laneData ?? []) as LaneRow[]).filter((l) =>
    (ARCHETYPES as readonly string[]).includes(l.archetype),
  )
  if (laneRows.length === 0) return jsonError('VALIDATION', 'No hay lanes disponibles para triage / No lanes available for triage')

  const lanes: TriageLane[] = laneRows.map((l) => ({
    laneId: l.id,
    laneCode: l.code,
    laneName: l.name,
    archetype: l.archetype as Archetype,
    defaultStage: getArchetypeConfig(l.archetype as Archetype).stages[0].id,
  }))
  const brandByLaneId = new Map(laneRows.map((l) => [l.id, l.brand_id]))

  let envelope
  try {
    envelope = await runTriage(client, { inboundText: body.text, lanes })
  } catch (err) {
    console.error('[intelligence/triage]', err)
    return jsonError('AI_ERROR', 'No se pudo generar el triage / Could not generate triage')
  }

  const brandId = brandByLaneId.get(envelope.draft.proposedLaneId)
  if (!brandId) return jsonError('AI_ERROR', 'Lane propuesta inválida / Proposed lane invalid')

  const record = await insertDraft(supabase, {
    kind: 'TRIAGE',
    refTable: 'rfqs',
    refId: body.rfqId ?? null,
    brandId,
    laneId: envelope.draft.proposedLaneId,
    envelope,
    createdBy: user.id,
  })
  if (!record) return jsonError('FORBIDDEN_LANE', 'No se pudo guardar el borrador / Could not save the draft')

  return jsonOk(record, 201)
}
