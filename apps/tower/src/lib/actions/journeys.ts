'use server'

// src/lib/actions/journeys.ts
// Import-journey milestone + phase layer (Quotation Intelligence SPEC §2.1/§2.4).
// Mutation law: auth → Zod → RLS (has_lane_role). The current phase is always
// DERIVED server-side from the underlying quote/order/container states + the
// append-only milestone log — never trusted from the client. G1: opening a
// journey captures the committing rep's digital signature over the CIF figure.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { derivePhase, isPhaseCode, PHASE_CODES, PHASE_LABELS, type PhaseCode } from '@/lib/journeys/phases'
import { signCommitment, verifyCommitment, type Commitment } from '@/lib/journeys/signature'

const uuidSchema = z.string().uuid()

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

type TowerClient = ReturnType<SupabaseClient['schema']>

function signingSecret(): string {
  // Prod sets JOURNEY_SIGNING_SECRET; dev falls back so the flow still functions.
  return process.env.JOURNEY_SIGNING_SECRET || 'dev-insecure-journey-secret'
}

export interface JourneyMilestone {
  id: string
  phase: PhaseCode
  phaseLabel: { es: string; en: string }
  occurredAt: string
  noteEs: string | null
  noteEn: string | null
  recordedBy: string | null
}

export interface ImportJourney {
  id: string
  quoteId: string
  orderId: string | null
  containerId: string | null
  laneId: string
  phaseSet: string
  currentPhase: PhaseCode
  currentPhaseLabel: { es: string; en: string }
  incoterm: string | null
  committedBy: string | null
  signature: Commitment | Record<string, never>
  signatureValid: boolean
  milestones: JourneyMilestone[]
}

interface RawJourney {
  id: string
  quote_id: string
  order_id: string | null
  container_id: string | null
  lane_id: string
  phase_set: string
  current_phase: string
  incoterm: string | null
  committed_by: string | null
  signature: Commitment | Record<string, never>
}
const JOURNEY_COLS =
  'id,quote_id,order_id,container_id,lane_id,phase_set,current_phase,incoterm,committed_by,signature'

// ── Derive the current phase from live underlying state + milestones ─────────
async function recomputePhase(supabase: TowerClient, journey: RawJourney): Promise<PhaseCode> {
  const { data: quote } = await supabase.from('quotes').select('status').eq('id', journey.quote_id).maybeSingle()
  let orderStatus: string | null = null
  if (journey.order_id) {
    const { data: order } = await supabase.from('orders').select('status').eq('id', journey.order_id).maybeSingle()
    orderStatus = (order as { status?: string } | null)?.status ?? null
  }
  let containerStatus: string | null = null
  if (journey.container_id) {
    const { data: c } = await supabase.from('containers').select('status').eq('id', journey.container_id).maybeSingle()
    containerStatus = (c as { status?: string } | null)?.status ?? null
  }
  const { data: ms } = await supabase.from('journey_milestones').select('phase').eq('journey_id', journey.id)
  const milestonePhases = ((ms ?? []) as { phase: string }[]).map((m) => m.phase).filter(isPhaseCode)
  return derivePhase(
    {
      quoteStatus: (quote as { status?: string } | null)?.status ?? 'SENT',
      orderStatus,
      containerStatus,
      milestonePhases,
    },
    journey.phase_set,
  )
}

async function assembleJourney(supabase: TowerClient, row: RawJourney): Promise<ImportJourney> {
  const { data: ms } = await supabase
    .from('journey_milestones')
    .select('id,phase,occurred_at,note_es,note_en,recorded_by')
    .eq('journey_id', row.id)
    .order('occurred_at', { ascending: true })
  const milestones: JourneyMilestone[] = ((ms ?? []) as Array<{
    id: string
    phase: string
    occurred_at: string
    note_es: string | null
    note_en: string | null
    recorded_by: string | null
  }>)
    .filter((m) => isPhaseCode(m.phase))
    .map((m) => ({
      id: m.id,
      phase: m.phase as PhaseCode,
      phaseLabel: PHASE_LABELS[m.phase as PhaseCode],
      occurredAt: m.occurred_at,
      noteEs: m.note_es,
      noteEn: m.note_en,
      recordedBy: m.recorded_by,
    }))

  const sig = row.signature as Commitment | Record<string, never>
  const signatureValid = 'sig' in sig && typeof sig.sig === 'string' ? verifyCommitment(sig as Commitment, signingSecret()) : false
  const currentPhase = row.current_phase as PhaseCode

  return {
    id: row.id,
    quoteId: row.quote_id,
    orderId: row.order_id,
    containerId: row.container_id,
    laneId: row.lane_id,
    phaseSet: row.phase_set,
    currentPhase,
    currentPhaseLabel: PHASE_LABELS[currentPhase] ?? PHASE_LABELS.COTIZACION_RECIBIDA,
    incoterm: row.incoterm,
    committedBy: row.committed_by,
    signature: sig,
    signatureValid,
    milestones,
  }
}

// ── Open a journey — the rep commits + signs the CIF figure ──────────────────
export async function openImportJourney(quoteId: string): Promise<ActionResult<ImportJourney>> {
  const parsed = uuidSchema.safeParse(quoteId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data: quote } = await auth.supabase
    .from('quotes')
    .select('id,rfq_id,total_minor,currency,terms')
    .eq('id', parsed.data)
    .maybeSingle()
  const q = quote as { rfq_id: string; total_minor: number | string; currency: string; terms: { incoterm?: string } | null } | null
  if (!q) return fail('FORBIDDEN_LANE', 'Cotización no encontrada / Quote not found')

  const { data: rfq } = await auth.supabase.from('rfqs').select('lane_id,brand_id').eq('id', q.rfq_id).maybeSingle()
  const r = rfq as { lane_id: string; brand_id: string } | null
  if (!r) return fail('FORBIDDEN_LANE', 'RFQ no encontrado / RFQ not found')

  const cifMinor = typeof q.total_minor === 'string' ? Number(q.total_minor) : q.total_minor
  const signature = signCommitment(
    { signedBy: auth.user.id, cifMinor, currency: q.currency || 'USD', signedAt: new Date().toISOString() },
    signingSecret(),
  )

  const { data, error } = await auth.supabase
    .from('import_journeys')
    .insert({
      brand_id: r.brand_id,
      lane_id: r.lane_id,
      quote_id: parsed.data,
      incoterm: q.terms?.incoterm ?? null,
      current_phase: 'COTIZACION_RECIBIDA',
      signature,
    })
    .select(JOURNEY_COLS)
    .single()
  if (error || !data) {
    return fail('FORBIDDEN_LANE', 'No se pudo abrir el seguimiento (¿ya existe?) / Could not open journey (already exists?)')
  }
  // Seed the first dated milestone.
  await auth.supabase.from('journey_milestones').insert({ journey_id: (data as RawJourney).id, phase: 'COTIZACION_RECIBIDA' })

  return assembleJourney(auth.supabase, data as unknown as RawJourney).then(ok)
}

// ── Record a milestone (a rep advances a hito) → recompute + persist phase ───
const milestoneSchema = z.object({
  journeyId: uuidSchema,
  phase: z.enum(PHASE_CODES),
  noteEs: z.string().trim().max(400).nullish(),
  noteEn: z.string().trim().max(400).nullish(),
  docId: uuidSchema.nullish(),
  orderId: uuidSchema.nullish(),
  containerId: uuidSchema.nullish(),
})
export type RecordMilestoneInput = z.input<typeof milestoneSchema>

export async function recordJourneyMilestone(input: RecordMilestoneInput): Promise<ActionResult<ImportJourney>> {
  const parsed = milestoneSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data: journeyRow, error: jErr } = await auth.supabase
    .from('import_journeys')
    .select(JOURNEY_COLS)
    .eq('id', parsed.data.journeyId)
    .maybeSingle()
  if (jErr || !journeyRow) return fail('FORBIDDEN_LANE', 'Seguimiento no encontrado / Journey not found')

  // Attach order/container refs as they materialize (before recompute).
  const refPatch: Record<string, unknown> = {}
  if (parsed.data.orderId) refPatch.order_id = parsed.data.orderId
  if (parsed.data.containerId) refPatch.container_id = parsed.data.containerId
  if (Object.keys(refPatch).length > 0) {
    await auth.supabase.from('import_journeys').update(refPatch).eq('id', parsed.data.journeyId)
  }

  const { error: mErr } = await auth.supabase.from('journey_milestones').insert({
    journey_id: parsed.data.journeyId,
    phase: parsed.data.phase,
    note_es: parsed.data.noteEs ?? null,
    note_en: parsed.data.noteEn ?? null,
    doc_id: parsed.data.docId ?? null,
  })
  if (mErr) return fail('FORBIDDEN_LANE', 'No se pudo registrar el hito / Could not record milestone')

  // Recompute the derived phase from live state + all milestones, then persist.
  const merged = { ...(journeyRow as RawJourney), ...refPatch } as RawJourney
  const currentPhase = await recomputePhase(auth.supabase, merged)
  const { data: updated, error: uErr } = await auth.supabase
    .from('import_journeys')
    .update({ current_phase: currentPhase })
    .eq('id', parsed.data.journeyId)
    .select(JOURNEY_COLS)
    .single()
  if (uErr || !updated) return fail('FORBIDDEN_LANE', 'No se pudo actualizar la fase / Could not update phase')

  return assembleJourney(auth.supabase, updated as unknown as RawJourney).then(ok)
}

// ── Read model (internal; the tokenized client surface is a later wave) ──────
export async function getImportJourney(journeyId: string): Promise<ActionResult<ImportJourney>> {
  const parsed = uuidSchema.safeParse(journeyId)
  if (!parsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase.from('import_journeys').select(JOURNEY_COLS).eq('id', parsed.data).maybeSingle()
  if (error || !data) return fail('FORBIDDEN_LANE', 'Seguimiento no encontrado / Journey not found')
  return assembleJourney(auth.supabase, data as unknown as RawJourney).then(ok)
}
