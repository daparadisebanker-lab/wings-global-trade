// src/lib/torre/review-logic.ts
// Pure review helpers for Torre artifacts — the approvability gate and the EXACT
// side effect the approve control must name (the constitution: "the approve action
// always names the exact side effect"). Kept pure so both the server action and the
// review UI agree, and so it is unit-tested without a DB.
import { effectiveBlockerCount, isApprovable, type TorreArtifactPayload } from './artifacts'

export interface Localized {
  es: string
  en: string
}

/** True when the artifact has no open blockers (constitutional approvability law). */
export function canApproveTorre(payload: { blockers?: TorreArtifactPayload['blockers'] }): boolean {
  return isApprovable(payload)
}

/**
 * The precise side effect approving this artifact performs — shown ON the approve
 * control (never a generic "Approve"). For a comunicacion it is the message's own
 * declared side effect; for the others it is the system-of-record write.
 */
export function approveSideEffect(payload: TorreArtifactPayload): Localized {
  switch (payload.kind) {
    case 'HOJA_COSTOS':
      return {
        es: 'Aprobar y guardar la hoja de costos en Costeo',
        en: 'Approve and save the cost sheet to Costing',
      }
    case 'COTIZACION':
      return {
        es: 'Aprobar la cotización (queda registrada; se emite al cliente desde Cotizaciones)',
        en: 'Approve the quotation (recorded; issued to the client from Quotations)',
      }
    case 'COMUNICACION':
      // The message already declares its own precise side effect.
      return payload.sideEffect
    // These name only what actually happens on approval — an append-only status flip
    // ("queda registrado"). There is no archive/file destination yet, so the copy must
    // not claim one (parity with the COTIZACION "recorded" wording).
    case 'REPORTE_ESTADO':
      return { es: 'Aprobar el reporte de estado (queda registrado)', en: 'Approve the status report (recorded)' }
    case 'CHECKLIST_DOCS':
      return { es: 'Aprobar la lista de documentos (queda registrada)', en: 'Approve the document checklist (recorded)' }
    case 'ACTA':
      return { es: 'Aprobar el acta (queda registrada)', en: 'Approve the minutes (recorded)' }
    case 'SOP':
      return { es: 'Aprobar el procedimiento / SOP (queda registrado)', en: 'Approve the procedure / SOP (recorded)' }
  }
}

/** The blocked-approval reason (why the approve control is disabled), or null. */
export function blockedReason(payload: TorreArtifactPayload, locale: 'es' | 'en'): string | null {
  if (canApproveTorre(payload)) return null
  const n = effectiveBlockerCount(payload) // includes the derived checklist blocker
  return locale === 'en'
    ? `${n} open blocker(s) — resolve before approving`
    : `${n} bloqueo(s) abierto(s) — resuelve antes de aprobar`
}
