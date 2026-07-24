// src/lib/torre/watch.ts
// Mister Torre — the Vigilar (Watch) engine (Loop L4). PURE + unit-tested. Given a
// snapshot of an import's state, the v1 rules detect exceptions; triage ranks them; the
// interruption budget decides what interrupts NOW vs what batches to the Morning Brief.
//
// Governance (spec-torre non-negotiable 8): only `inmediato` severity earns a real-time
// ping; everything else batches. A watch signal is a FLAG, not an action — acting on it
// (a chase message, a status report) is still a human-approved DRAFT downstream.
export type Severity = 'inmediato' | 'alto' | 'medio' | 'bajo'

export type WatchRuleId =
  | 'eta-slip'
  | 'doc-deadline'
  | 'demurrage'
  | 'rate-expiry'
  | 'payment-milestone'
  | 'quote-quiet'
  | 'margin-drift'
  | 'stale-import'

export interface WatchSignal {
  rule: WatchRuleId
  severity: Severity
  importRef: string
  title: { es: string; en: string }
  detail: { es: string; en: string }
  /** A one-tap draft this signal suggests (the human still approves it). */
  suggestedDraft?: 'COMUNICACION' | 'REPORTE_ESTADO' | 'CHECKLIST_DOCS'
}

export interface WatchInput {
  importRef: string
  /** ISO date the snapshot reflects. */
  today: string
  status?: string
  /** Planned vs current ETA (ISO dates). */
  eta?: { planned: string | null; current: string | null }
  requiredDocs?: { doc: string; status: 'presente' | 'faltante' | 'vencido'; dueDate?: string | null }[]
  /** For demurrage: when the container arrived + the free days before charges accrue. */
  arrival?: { arrivedOn: string | null; freeDays: number }
  /** A freight/insurance rate's validity end (ISO), if one is attached. */
  rateValidUntil?: string | null
  payment?: { dueDate: string | null; paid: boolean }
  /** A quote sent to the client + whether they've responded. */
  lastQuoteActivity?: { sentOn: string | null; responded: boolean }
  /** Current vs target margin (fractions). */
  margin?: { current: number; target: number }
  /** Last time anything happened on this import (ISO). */
  lastActivityOn?: string | null
}

const DAY = 86_400_000
/** Parse an ISO date OR datetime to a day-epoch; null if unparseable (a datetime's time is dropped). */
function dayEpoch(iso: string): number | null {
  const datePart = iso.slice(0, 10) // tolerate a full timestamptz ('2026-07-15T08:00:00Z')
  const ms = Date.parse(`${datePart}T00:00:00Z`)
  return Number.isNaN(ms) ? null : ms
}
/**
 * Whole days from a→b (b - a); negative if b precedes a. Returns NULL when either date is
 * malformed — so a bad DB value can never make a rule FALSE-fire (a NaN comparison is
 * silently false, which was making demurrage ping `inmediato` on garbage). Every rule
 * treats null as "not applicable".
 */
function daysBetween(a: string, b: string): number | null {
  const ea = dayEpoch(a)
  const eb = dayEpoch(b)
  if (ea === null || eb === null) return null
  return Math.floor((eb - ea) / DAY)
}

interface Rule {
  id: WatchRuleId
  run: (i: WatchInput) => WatchSignal | null
}

function sig(rule: WatchRuleId, severity: Severity, i: WatchInput, title: WatchSignal['title'], detail: WatchSignal['detail'], suggestedDraft?: WatchSignal['suggestedDraft']): WatchSignal {
  return { rule, severity, importRef: i.importRef, title, detail, suggestedDraft }
}

export const WATCH_RULES: Rule[] = [
  {
    id: 'eta-slip',
    run: (i) => {
      if (!i.eta?.planned || !i.eta.current) return null
      const slip = daysBetween(i.eta.planned, i.eta.current)
      if (slip === null || slip <= 0) return null
      return sig('eta-slip', slip > 7 ? 'alto' : 'medio', i,
        { es: 'ETA atrasada', en: 'ETA slipped' },
        { es: `La ETA se movió ${slip} día(s) (${i.eta.planned} → ${i.eta.current}).`, en: `ETA moved ${slip} day(s) (${i.eta.planned} → ${i.eta.current}).` },
        'COMUNICACION')
    },
  },
  {
    id: 'doc-deadline',
    run: (i) => {
      if (!i.requiredDocs?.length) return null
      const pending = i.requiredDocs.filter((d) => d.status !== 'presente')
      if (!pending.length) return null
      // a doc explicitly 'vencido' is overdue regardless of any dueDate math
      const explicitlyExpired = pending.find((d) => d.status === 'vencido')
      if (explicitlyExpired) {
        return sig('doc-deadline', 'alto', i,
          { es: 'Documento vencido', en: 'Document overdue' },
          { es: `${explicitlyExpired.doc}: marcado como vencido.`, en: `${explicitlyExpired.doc}: marked expired.` },
          'CHECKLIST_DOCS')
      }
      // nearest deadline among pending required docs (drop unparseable dates)
      const dated = pending
        .map((d) => ({ d, days: d.dueDate ? daysBetween(i.today, d.dueDate) : null }))
        .filter((x): x is { d: (typeof pending)[number]; days: number } => x.days !== null)
      const nearest = dated.sort((a, b) => a.days - b.days)[0]
      const overdue = nearest && nearest.days < 0
      const near = nearest && nearest.days >= 0 && nearest.days <= 3
      if (!overdue && !near) {
        // pending but no near deadline → a low nudge
        return sig('doc-deadline', 'bajo', i,
          { es: 'Documentos pendientes', en: 'Pending documents' },
          { es: `${pending.length} documento(s) pendiente(s).`, en: `${pending.length} document(s) pending.` },
          'CHECKLIST_DOCS')
      }
      return sig('doc-deadline', overdue ? 'alto' : 'medio', i,
        { es: overdue ? 'Documento vencido' : 'Documento por vencer', en: overdue ? 'Document overdue' : 'Document due soon' },
        { es: `${nearest.d.doc}: ${overdue ? `vencido hace ${-nearest.days} día(s)` : `vence en ${nearest.days} día(s)`}.`, en: `${nearest.d.doc}: ${overdue ? `overdue by ${-nearest.days} day(s)` : `due in ${nearest.days} day(s)`}.` },
        'CHECKLIST_DOCS')
    },
  },
  {
    id: 'demurrage',
    run: (i) => {
      if (!i.arrival?.arrivedOn) return null
      const elapsed = daysBetween(i.arrival.arrivedOn, i.today)
      if (elapsed === null) return null
      const over = elapsed - i.arrival.freeDays
      // pre-warning while the free window is still open (charges NOT yet accruing) so the
      // actionable day (free days expire soon) is caught, not just money already lost.
      if (over < -2) return null
      if (over <= 0) {
        return sig('demurrage', 'alto', i,
          { es: 'Días libres por agotarse', en: 'Free days running out' },
          { es: `Quedan ${-over} día(s) libre(s) de ${i.arrival.freeDays}; actúa antes del demurrage.`, en: `${-over} free day(s) left of ${i.arrival.freeDays}; act before demurrage.` },
          'COMUNICACION')
      }
      return sig('demurrage', 'inmediato', i,
        { es: 'Demurrage acumulando', en: 'Demurrage accruing' },
        { es: `El contenedor lleva ${elapsed} día(s) desde arribo; ${over} día(s) sobre los ${i.arrival.freeDays} libres.`, en: `Container is ${elapsed} day(s) since arrival; ${over} day(s) over the ${i.arrival.freeDays} free.` },
        'COMUNICACION')
    },
  },
  {
    id: 'rate-expiry',
    run: (i) => {
      if (!i.rateValidUntil) return null
      const days = daysBetween(i.today, i.rateValidUntil)
      if (days === null) return null
      if (days <= 0) return sig('rate-expiry', 'medio', i, { es: 'Tarifa vencida', en: 'Rate expired' }, { es: days < 0 ? `La tarifa venció hace ${-days} día(s); requiere recotizar.` : 'La tarifa vence hoy; requiere recotizar.', en: days < 0 ? `The rate expired ${-days} day(s) ago; needs re-quoting.` : 'The rate expires today; needs re-quoting.' })
      if (days <= 7) return sig('rate-expiry', 'bajo', i, { es: 'Tarifa por vencer', en: 'Rate expiring' }, { es: `La tarifa vence en ${days} día(s).`, en: `The rate expires in ${days} day(s).` })
      return null
    },
  },
  {
    id: 'payment-milestone',
    run: (i) => {
      if (!i.payment?.dueDate || i.payment.paid) return null
      const days = daysBetween(i.today, i.payment.dueDate)
      if (days === null) return null
      if (days < 0) return sig('payment-milestone', 'alto', i, { es: 'Pago vencido', en: 'Payment overdue' }, { es: `El pago venció hace ${-days} día(s).`, en: `Payment was due ${-days} day(s) ago.` }, 'COMUNICACION')
      if (days <= 3) return sig('payment-milestone', 'medio', i, { es: 'Pago próximo', en: 'Payment due soon' }, { es: `El pago vence en ${days} día(s).`, en: `Payment due in ${days} day(s).` }, 'COMUNICACION')
      return null
    },
  },
  {
    id: 'quote-quiet',
    run: (i) => {
      if (!i.lastQuoteActivity?.sentOn || i.lastQuoteActivity.responded) return null
      const days = daysBetween(i.lastQuoteActivity.sentOn, i.today)
      if (days === null || days < 5) return null
      return sig('quote-quiet', 'medio', i, { es: 'Cotización sin respuesta', en: 'Quote unanswered' }, { es: `La cotización lleva ${days} día(s) sin respuesta.`, en: `The quote has gone ${days} day(s) without a reply.` }, 'COMUNICACION')
    },
  },
  {
    id: 'margin-drift',
    run: (i) => {
      if (!i.margin) return null
      const { current, target } = i.margin
      // deadband: a hair under target isn't a signal (17.99% vs 18% shouldn't ping every run)
      if (current >= target * 0.95) return null
      const below = current < target * 0.9
      return sig('margin-drift', below ? 'alto' : 'medio', i, { es: 'Margen por debajo del objetivo', en: 'Margin below target' }, { es: `Margen ${(current * 100).toFixed(1)}% vs objetivo ${(target * 100).toFixed(1)}%.`, en: `Margin ${(current * 100).toFixed(1)}% vs target ${(target * 100).toFixed(1)}%.` }, 'REPORTE_ESTADO')
    },
  },
  {
    id: 'stale-import',
    run: (i) => {
      if (!i.lastActivityOn) return null
      const days = daysBetween(i.lastActivityOn, i.today)
      if (days === null || days < 14) return null
      return sig('stale-import', days >= 30 ? 'medio' : 'bajo', i, { es: 'Importación sin movimiento', en: 'Import stalled' }, { es: `Sin actividad hace ${days} día(s).`, en: `No activity for ${days} day(s).` }, 'REPORTE_ESTADO')
    },
  },
]

/** The stable identity of a signal (one open signal per import+rule). */
export function signalKey(s: { importRef: string; rule: WatchRuleId }): string {
  return `${s.importRef}:${s.rule}`
}

/** PURE: the active rule set after applying kill switches (disabled rule ids). */
export function activeRules(disabled: Iterable<WatchRuleId> = [], rules: Rule[] = WATCH_RULES): Rule[] {
  const off = new Set(disabled)
  return rules.filter((r) => !off.has(r.id))
}

/** PURE: run every (enabled) rule over one import's snapshot, dropping non-firing rules. */
export function runWatchRules(input: WatchInput, rules: Rule[] = WATCH_RULES): WatchSignal[] {
  return rules.map((r) => r.run(input)).filter((s): s is WatchSignal => s !== null)
}

/** An already-persisted signal the reconciler compares against (OPEN or MUTED). */
export interface OpenSignal {
  key: string
  severity: Severity
  status: 'OPEN' | 'MUTED'
}

export interface WatchReconciliation {
  /** Newly-detected signals with no matching open/muted signal — persist these. */
  toCreate: WatchSignal[]
  /** Signals whose OPEN row exists but whose severity has ESCALATED — update in place (an
   *  escalation to `inmediato` re-earns the real-time ping). */
  toEscalate: WatchSignal[]
  /** Keys of OPEN signals whose exception has cleared — mark these resolved (MUTED stay muted). */
  resolvedKeys: string[]
}

/**
 * PURE: reconcile freshly-detected signals against the currently-open signals. This keeps
 * the watch layer idempotent AND honest across reconciler runs:
 *  · a detected signal with no matching open/muted row → CREATE;
 *  · a detected signal matching an OPEN row whose severity it now OUTRANKS → ESCALATE
 *    (the stored severity/detail was going stale; an escalation into `inmediato` re-pings);
 *  · an OPEN row no longer detected → RESOLVE.
 * `open` MUST include MUTED rows (not just OPEN) — otherwise a muted exception is re-detected
 * and re-created every run, un-muting itself (the kill switch would leak). MUTED rows are
 * never auto-resolved. NOTE: keys omit brand — the reconciler runs strictly per-brand.
 */
export function reconcileWatch(detected: WatchSignal[], open: Iterable<OpenSignal>): WatchReconciliation {
  const openByKey = new Map<string, OpenSignal>()
  for (const o of open) openByKey.set(o.key, o)
  const detectedKeys = new Set(detected.map(signalKey))

  const toCreate: WatchSignal[] = []
  const toEscalate: WatchSignal[] = []
  for (const s of detected) {
    const prev = openByKey.get(signalKey(s))
    if (!prev) toCreate.push(s)
    else if (prev.status === 'OPEN' && SEVERITY_RANK[s.severity] < SEVERITY_RANK[prev.severity]) toEscalate.push(s)
    // matching MUTED, or OPEN at same/lower severity → leave alone (no duplicate ping)
  }
  const resolvedKeys = [...openByKey.values()]
    .filter((o) => o.status === 'OPEN' && !detectedKeys.has(o.key))
    .map((o) => o.key)

  return { toCreate, toEscalate, resolvedKeys }
}

const SEVERITY_RANK: Record<Severity, number> = { inmediato: 0, alto: 1, medio: 2, bajo: 3 }

/**
 * PURE: rank signals most-severe first; a stable tiebreak by rule id keeps it deterministic.
 * De-dups by (rule, importRef) keeping the most severe.
 */
export function triageSignals(signals: WatchSignal[]): WatchSignal[] {
  const byKey = new Map<string, WatchSignal>()
  for (const s of signals) {
    const key = `${s.importRef}:${s.rule}`
    const prev = byKey.get(key)
    if (!prev || SEVERITY_RANK[s.severity] < SEVERITY_RANK[prev.severity]) byKey.set(key, s)
  }
  return [...byKey.values()].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || a.rule.localeCompare(b.rule))
}

export interface DeliveryPartition {
  /** Interrupts NOW — only `inmediato` severity (spec non-negotiable 8). */
  realtime: WatchSignal[]
  /** Batches to the Morning Brief — everything else. */
  brief: WatchSignal[]
}

/**
 * PURE: the interruption budget. Only `inmediato` signals interrupt in real time; the rest
 * batch to the Brief. `maxRealtimePerImport` caps how many pings a single import may fire
 * at once (default 1 — ≤1 inline suggestion per module), the excess demoted to the Brief.
 */
export function partitionByDelivery(signals: WatchSignal[], maxRealtimePerImport = 1): DeliveryPartition {
  const triaged = triageSignals(signals)
  const realtime: WatchSignal[] = []
  const brief: WatchSignal[] = []
  const realtimeCount = new Map<string, number>()
  for (const s of triaged) {
    if (s.severity === 'inmediato') {
      const n = realtimeCount.get(s.importRef) ?? 0
      if (n < maxRealtimePerImport) {
        realtime.push(s)
        realtimeCount.set(s.importRef, n + 1)
        continue
      }
    }
    brief.push(s)
  }
  return { realtime, brief }
}
