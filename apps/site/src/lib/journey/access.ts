// src/lib/journey/access.ts
// Tokenized, no-login resolver for the client import-tracker (Quotation
// Intelligence SPEC §2.1/§2.3). Server-only: reads the private tower.import_journeys
// row by its unguessable access_token via the service-role client (the same
// trusted private-read path as resolveInvite for container invites). Returns a
// curated, client-safe read model — the phase rail with dated milestones and the
// rep-signed CIF attestation (G1). Never exposes internal ids or the raw signature.
import { createServiceClient } from '@/lib/supabase/server'
import { PHASE_LABELS, phaseSetFor, isPhaseCode, type PhaseCode } from './phases'

export interface TrackerPhase {
  code: PhaseCode
  label: string
  reached: boolean
  current: boolean
  date: string | null // ISO of the milestone that recorded it, if any
}

export interface TrackerModel {
  phases: TrackerPhase[]
  currentLabel: string
  incoterm: string | null
  cif: { amount: number; currency: string } | null
  signedAt: string | null // rep's digital-signature timestamp (G1)
  updatedAt: string | null
}

export type JourneyResolution =
  | { ok: true; tracker: TrackerModel }
  | { ok: false; reason: 'not_found' | 'unconfigured' }

interface RawJourney {
  id: string
  phase_set: string
  current_phase: string
  incoterm: string | null
  signature: { cif_minor?: number; currency?: string; signed_at?: string } | null
}

export async function resolveJourney(token: string): Promise<JourneyResolution> {
  const supabase = createServiceClient()
  if (!supabase) return { ok: false, reason: 'unconfigured' }

  const { data: journey } = await supabase
    .schema('tower')
    .from('import_journeys')
    .select('id,phase_set,current_phase,incoterm,signature')
    .eq('access_token', token)
    .maybeSingle()
  if (!journey) return { ok: false, reason: 'not_found' }
  const j = journey as unknown as RawJourney

  const { data: ms } = await supabase
    .schema('tower')
    .from('journey_milestones')
    .select('phase,occurred_at')
    .eq('journey_id', j.id)
    .order('occurred_at', { ascending: true })

  // Earliest recorded date per phase (the dated timeline).
  const dateByPhase = new Map<string, string>()
  for (const m of (ms ?? []) as { phase: string; occurred_at: string }[]) {
    if (!dateByPhase.has(m.phase)) dateByPhase.set(m.phase, m.occurred_at)
  }
  const lastUpdate = (ms ?? []).length ? (ms as { occurred_at: string }[])[(ms as unknown[]).length - 1].occurred_at : null

  const set = phaseSetFor(j.phase_set)
  const currentIdx = isPhaseCode(j.current_phase) ? set.indexOf(j.current_phase as PhaseCode) : 0

  const phases: TrackerPhase[] = set.map((code, i) => ({
    code,
    label: PHASE_LABELS[code],
    reached: i <= currentIdx,
    current: i === currentIdx,
    date: dateByPhase.get(code) ?? null,
  }))

  const sig = j.signature ?? {}
  const cif =
    typeof sig.cif_minor === 'number'
      ? { amount: sig.cif_minor / 100, currency: sig.currency ?? 'USD' }
      : null

  return {
    ok: true,
    tracker: {
      phases,
      currentLabel: PHASE_LABELS[(isPhaseCode(j.current_phase) ? j.current_phase : 'COTIZACION_RECIBIDA') as PhaseCode],
      incoterm: j.incoterm,
      cif,
      signedAt: sig.signed_at ?? null,
      updatedAt: lastUpdate,
    },
  }
}
