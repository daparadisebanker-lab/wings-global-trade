// src/lib/journeys/phases.ts
// The canonical import-phase model (Quotation Intelligence SPEC §2.1). Pure and
// framework-agnostic: the client-facing journey is ONE ordered set of phases,
// DERIVED from TOWER's underlying states (quote/order/container) plus the
// explicit milestone hitos ops records — never a fifth hand-maintained status.
// The phase set is config-driven per archetype (TOWER Directive 2).

export const PHASE_CODES = [
  'COTIZACION_RECIBIDA',
  'ACEPTADA',
  'EN_ORIGEN',
  'ASEGURADO',
  'BL_LIBERADO',
  'EN_TRANSITO',
  'ARRIBO',
  'NACIONALIZADO',
  'ENTREGADO',
] as const
export type PhaseCode = (typeof PHASE_CODES)[number]

export const PHASE_LABELS: Record<PhaseCode, { es: string; en: string }> = {
  COTIZACION_RECIBIDA: { es: 'Cotización recibida', en: 'Quote received' },
  ACEPTADA: { es: 'Cotización aceptada', en: 'Quote accepted' },
  EN_ORIGEN: { es: 'Flete reservado en origen', en: 'Freight booked at origin' },
  ASEGURADO: { es: 'Carga asegurada', en: 'Cargo insured' },
  BL_LIBERADO: { es: 'BL liberado', en: 'BL released' },
  EN_TRANSITO: { es: 'En tránsito', en: 'In transit' },
  ARRIBO: { es: 'Arribo y manejo en puerto', en: 'Arrival & port handling' },
  NACIONALIZADO: { es: 'Nacionalizado / despacho', en: 'Nationalized / cleared' },
  ENTREGADO: { es: 'Entregado', en: 'Delivered' },
}

/** Canonical order (index = progress rank). */
export const PHASE_ORDER: PhaseCode[] = [...PHASE_CODES]

/**
 * Config-driven phase sets per archetype (SPEC §2.1: "some archetypes skip
 * phases"). STANDARD_IMPORT is the full container journey; CREDENTIAL has no
 * container; ALLOCATION shares the container phases with the whole box.
 */
export const PHASE_SETS: Record<string, PhaseCode[]> = {
  STANDARD_IMPORT: [...PHASE_CODES],
  ALLOCATION: [...PHASE_CODES],
  CREDENTIAL: ['COTIZACION_RECIBIDA', 'ACEPTADA', 'ENTREGADO'],
}

export function phaseSetFor(key: string): PhaseCode[] {
  return PHASE_SETS[key] ?? PHASE_SETS.STANDARD_IMPORT
}

export interface JourneyState {
  /** tower.quotes.status — DRAFT | SENT | ACCEPTED | REJECTED | EXPIRED */
  quoteStatus: string
  /** tower.orders.status — CONTRACTED … DELIVERED | CLOSED (null until accepted) */
  orderStatus?: string | null
  /** tower.containers.status — OPEN … IN_TRANSIT | ARRIVED | CLEARED | CLOSED */
  containerStatus?: string | null
  /** Explicit hitos ops recorded (the phases with no single status source). */
  milestonePhases?: PhaseCode[]
}

const CONTAINER_ATLEAST: Record<string, PhaseCode> = {
  IN_TRANSIT: 'EN_TRANSITO',
  ARRIVED: 'ARRIBO',
  CLEARED: 'NACIONALIZADO',
  CLOSED: 'NACIONALIZADO',
}

/** Every phase the journey has demonstrably reached, from states + milestones. */
export function reachedPhases(state: JourneyState): Set<PhaseCode> {
  const reached = new Set<PhaseCode>()
  reached.add('COTIZACION_RECIBIDA') // a journey exists ⇒ the quote was committed/sent

  if (state.quoteStatus === 'ACCEPTED' || state.orderStatus) reached.add('ACEPTADA')

  const cs = state.containerStatus ?? undefined
  if (cs) {
    // container status implies every phase up to its rank
    const hit = CONTAINER_ATLEAST[cs]
    if (hit) {
      const upto = PHASE_ORDER.indexOf(hit)
      // container statuses only assert the transit→nationalized band; add each ≤ hit
      for (const p of ['EN_TRANSITO', 'ARRIBO', 'NACIONALIZADO'] as PhaseCode[]) {
        if (PHASE_ORDER.indexOf(p) <= upto) reached.add(p)
      }
    }
  }

  if (state.orderStatus === 'DELIVERED' || state.orderStatus === 'CLOSED') reached.add('ENTREGADO')

  // Explicit hitos (EN_ORIGEN / ASEGURADO / BL_LIBERADO / ARRIBO handling …).
  for (const p of state.milestonePhases ?? []) reached.add(p)

  return reached
}

/**
 * The current client-facing phase: the furthest-along reached phase that is part
 * of this journey's configured phase set. Falls back to COTIZACION_RECIBIDA.
 */
export function derivePhase(state: JourneyState, phaseSetKey = 'STANDARD_IMPORT'): PhaseCode {
  const allowed = new Set(phaseSetFor(phaseSetKey))
  const reached = reachedPhases(state)
  for (let i = PHASE_ORDER.length - 1; i >= 0; i--) {
    const p = PHASE_ORDER[i]
    if (allowed.has(p) && reached.has(p)) return p
  }
  return 'COTIZACION_RECIBIDA'
}

export function isPhaseCode(v: string): v is PhaseCode {
  return (PHASE_CODES as readonly string[]).includes(v)
}
