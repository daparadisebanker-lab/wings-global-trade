// src/lib/torre/review-logic.ts
// Pure review helpers for Torre artifacts — the approvability gate and the EXACT
// side effect the approve control must name (the constitution: "the approve action
// always names the exact side effect"). Kept pure so both the server action and the
// review UI agree, and so it is unit-tested without a DB.
import { isApprovable, type TorreArtifactPayload } from './artifacts'

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
  }
}

/** The blocked-approval reason (why the approve control is disabled), or null. */
export function blockedReason(payload: TorreArtifactPayload, locale: 'es' | 'en'): string | null {
  if (canApproveTorre(payload)) return null
  const n = (payload.blockers ?? []).length
  return locale === 'en'
    ? `${n} open blocker(s) — resolve before approving`
    : `${n} bloqueo(s) abierto(s) — resuelve antes de aprobar`
}
