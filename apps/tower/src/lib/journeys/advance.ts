// src/lib/journeys/advance.ts
// The service-role side of DETERMINISTIC automated phase advancement — the code
// the scheduled n8n watcher reaches through POST /api/hooks/journey-advance.
//
// It reuses the EXACT derivation the human milestone path uses (`derivePhase` /
// `planAdvancement` in ./phases): the phase is recomputed from the live
// quote/order/container states + the append-only hito log, never chosen by the
// caller. So the automation can only move a journey to the phase its own
// underlying state already implies — the guarded transition, not a bypass — and
// only ever FORWARD (monotonic). Re-running the watcher on a settled journey is a
// no-op (idempotent), because once the cache equals the derived phase there is
// nothing to advance.
//
// On each real advance it (a) appends a dated milestone with recorded_by = null
// — the system's own attestation, distinct from a rep's — so the append-only
// timeline shows the auto-hito, and (b) emits a PII-free event (journey/phase
// codes only; TOWER Directive 6). Both the milestone insert and the journey
// update fire the audit trigger already on those tables (tower_30) — no new
// audit surface is introduced.
import type { SupabaseClient } from '@supabase/supabase-js'
import { emitServerEvent } from '@/lib/ingest/emit'
import {
  isPhaseCode,
  planAdvancement,
  type JourneyState,
  type PhaseCode,
} from './phases'

/** Terminal phase — a delivered journey is never scanned again. */
const TERMINAL_PHASE: PhaseCode = 'ENTREGADO'

/** Default cap on how many journeys one watcher tick reconciles. */
const DEFAULT_SCAN_LIMIT = 200

type TowerSchema = ReturnType<SupabaseClient['schema']>

interface JourneyRow {
  id: string
  quote_id: string
  order_id: string | null
  container_id: string | null
  brand_id: string
  lane_id: string
  phase_set: string
  current_phase: string
}

const JOURNEY_COLS = 'id,quote_id,order_id,container_id,brand_id,lane_id,phase_set,current_phase'

export interface AdvanceOutcome {
  journeyId: string
  advanced: boolean
  fromPhase: PhaseCode
  toPhase: PhaseCode
}

export interface AdvanceRunResult {
  scanned: number
  advanced: number
  results: AdvanceOutcome[]
}

/** The service-role tower client, or null when Supabase isn't configured. */
export type ServiceClientFactory = () => SupabaseClient | null

// ── Gather the live underlying state for one journey (mirrors the action's
// recomputePhase — same reads, so both paths derive from an identical picture).
async function gatherState(tower: TowerSchema, row: JourneyRow): Promise<JourneyState> {
  const { data: quote } = await tower.from('quotes').select('status').eq('id', row.quote_id).maybeSingle()

  let orderStatus: string | null = null
  if (row.order_id) {
    const { data: order } = await tower.from('orders').select('status').eq('id', row.order_id).maybeSingle()
    orderStatus = (order as { status?: string } | null)?.status ?? null
  }

  let containerStatus: string | null = null
  if (row.container_id) {
    const { data: c } = await tower.from('containers').select('status').eq('id', row.container_id).maybeSingle()
    containerStatus = (c as { status?: string } | null)?.status ?? null
  }

  const { data: ms } = await tower.from('journey_milestones').select('phase').eq('journey_id', row.id)
  const milestonePhases = ((ms ?? []) as { phase: string }[]).map((m) => m.phase).filter(isPhaseCode)

  return {
    quoteStatus: (quote as { status?: string } | null)?.status ?? 'SENT',
    orderStatus,
    containerStatus,
    milestonePhases,
  }
}

// ── Resolve the non-PII analytics dimensions (brand + lane slugs) for the event.
async function resolveSlugs(
  tower: TowerSchema,
  row: JourneyRow,
): Promise<{ brand: string; lane: string }> {
  const { data: brand } = await tower.from('brands').select('slug').eq('id', row.brand_id).maybeSingle()
  const { data: lane } = await tower.from('lanes').select('slug').eq('id', row.lane_id).maybeSingle()
  return {
    brand: (brand as { slug?: string } | null)?.slug ?? 'unknown',
    lane: (lane as { slug?: string } | null)?.slug ?? 'unknown',
  }
}

/**
 * Reconcile ONE journey: recompute its derived phase and, only if it moved
 * strictly forward, persist the new cache + append the auto-hito + emit the
 * event. Returns whether it advanced (and from/to) — never throws for a
 * per-journey data issue at the caller's boundary; the route wraps the run.
 */
export async function advanceJourney(tower: TowerSchema, row: JourneyRow): Promise<AdvanceOutcome> {
  const currentPhase = (isPhaseCode(row.current_phase) ? row.current_phase : 'COTIZACION_RECIBIDA') as PhaseCode
  const state = await gatherState(tower, row)
  const plan = planAdvancement(currentPhase, state, row.phase_set)

  if (!plan.advance) {
    return { journeyId: row.id, advanced: false, fromPhase: currentPhase, toPhase: currentPhase }
  }

  // (a) Append the dated auto-hito. recorded_by stays null → the system's own
  // attestation, visibly distinct from a rep-stamped milestone in the timeline.
  await tower.from('journey_milestones').insert({
    journey_id: row.id,
    phase: plan.toPhase,
    recorded_by: null,
    note_es: 'Avance automático según el estado del embarque',
    note_en: 'Automatic advance from shipment state',
  })

  // (b) Persist the recomputed cache.
  await tower.from('import_journeys').update({ current_phase: plan.toPhase }).eq('id', row.id)

  // (c) Emit the PII-free event (fire-and-forget inside emitServerEvent).
  const { brand, lane } = await resolveSlugs(tower, row)
  await emitServerEvent({
    brand,
    lane,
    event: 'journey.phase.advanced',
    meta: {
      journey_id: row.id,
      from_phase: plan.fromPhase,
      to_phase: plan.toPhase,
      trigger: 'auto',
    },
  })

  return { journeyId: row.id, advanced: true, fromPhase: plan.fromPhase, toPhase: plan.toPhase }
}

export interface RunAdvanceOptions {
  createService: ServiceClientFactory
  /** Reconcile a single journey instead of scanning all open ones. */
  journeyId?: string
  /** Cap on journeys scanned in a batch tick. */
  limit?: number
}

/**
 * Scan the open journeys (or one, when `journeyId` is given) and reconcile each.
 * "Open" = current_phase is not yet the terminal ENTREGADO. Service-role only —
 * this is an n8n → app path, authenticated by the hook's shared-secret gate, so
 * RLS is intentionally bypassed here exactly as the other TOWER hooks do.
 */
export async function runJourneyAdvance(opts: RunAdvanceOptions): Promise<AdvanceRunResult | null> {
  const service = opts.createService()
  if (!service) return null
  const tower = service.schema('tower')

  let query = tower.from('import_journeys').select(JOURNEY_COLS)
  if (opts.journeyId) {
    query = query.eq('id', opts.journeyId)
  } else {
    query = query.neq('current_phase', TERMINAL_PHASE).limit(opts.limit ?? DEFAULT_SCAN_LIMIT)
  }

  const { data, error } = await query
  if (error) throw error
  const rows = (data ?? []) as JourneyRow[]

  const results: AdvanceOutcome[] = []
  for (const row of rows) {
    results.push(await advanceJourney(tower, row))
  }

  return {
    scanned: rows.length,
    advanced: results.filter((r) => r.advanced).length,
    results,
  }
}
