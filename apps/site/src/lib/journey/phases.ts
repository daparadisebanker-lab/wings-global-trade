// src/lib/journey/phases.ts
// Client-facing presentation of the import-phase model (Quotation Intelligence
// SPEC §2.1). The authoritative model + derivation live server-side in TOWER
// (apps/tower/src/lib/journeys); this is a small ES/EN label + order copy for the
// site tracker, which apps/site cannot import across the app boundary. Codes are
// the same strings TOWER writes. (Tracked debt: a future @wings/journey-core would
// remove this duplication.)

export const PHASE_ORDER = [
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
export type PhaseCode = (typeof PHASE_ORDER)[number]

export const PHASE_LABELS: Record<PhaseCode, string> = {
  COTIZACION_RECIBIDA: 'Cotización recibida',
  ACEPTADA: 'Cotización aceptada',
  EN_ORIGEN: 'Flete reservado en origen',
  ASEGURADO: 'Carga asegurada',
  BL_LIBERADO: 'BL liberado',
  EN_TRANSITO: 'En tránsito',
  ARRIBO: 'Arribo y manejo en puerto',
  NACIONALIZADO: 'Nacionalizado / despacho',
  ENTREGADO: 'Entregado',
}

export const PHASE_SETS: Record<string, PhaseCode[]> = {
  STANDARD_IMPORT: [...PHASE_ORDER],
  ALLOCATION: [...PHASE_ORDER],
  CREDENTIAL: ['COTIZACION_RECIBIDA', 'ACEPTADA', 'ENTREGADO'],
}

export function phaseSetFor(key: string): PhaseCode[] {
  return PHASE_SETS[key] ?? PHASE_SETS.STANDARD_IMPORT
}

export function isPhaseCode(v: string): v is PhaseCode {
  return (PHASE_ORDER as readonly string[]).includes(v)
}
