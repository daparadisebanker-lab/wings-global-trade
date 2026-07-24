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
/** Whole days from a→b (b - a); negative if b precedes a. Both ISO dates. */
function daysBetween(a: string, b: string): number {
  return Math.floor((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY)
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
      if (slip <= 0) return null
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
      // nearest deadline among pending required docs
      const dated = pending.filter((d) => d.dueDate).map((d) => ({ d, days: daysBetween(i.today, d.dueDate as string) }))
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
      const over = elapsed - i.arrival.freeDays
      if (over <= 0) return null
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
      if (days < 0) return sig('rate-expiry', 'medio', i, { es: 'Tarifa vencida', en: 'Rate expired' }, { es: `La tarifa venció hace ${-days} día(s); requiere recotizar.`, en: `The rate expired ${-days} day(s) ago; needs re-quoting.` })
      if (days <= 7) return sig('rate-expiry', 'bajo', i, { es: 'Tarifa por vencer', en: 'Rate expiring' }, { es: `La tarifa vence en ${days} día(s).`, en: `The rate expires in ${days} day(s).` })
      return null
    },
  },
  {
    id: 'payment-milestone',
    run: (i) => {
      if (!i.payment?.dueDate || i.payment.paid) return null
      const days = daysBetween(i.today, i.payment.dueDate)
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
      if (days < 5) return null
      return sig('quote-quiet', 'medio', i, { es: 'Cotización sin respuesta', en: 'Quote unanswered' }, { es: `La cotización lleva ${days} día(s) sin respuesta.`, en: `The quote has gone ${days} day(s) without a reply.` }, 'COMUNICACION')
    },
  },
  {
    id: 'margin-drift',
    run: (i) => {
      if (!i.margin) return null
      const { current, target } = i.margin
      if (current >= target) return null
      const below = current < target * 0.9
      return sig('margin-drift', below ? 'alto' : 'medio', i, { es: 'Margen por debajo del objetivo', en: 'Margin below target' }, { es: `Margen ${(current * 100).toFixed(1)}% vs objetivo ${(target * 100).toFixed(1)}%.`, en: `Margin ${(current * 100).toFixed(1)}% vs target ${(target * 100).toFixed(1)}%.` }, 'REPORTE_ESTADO')
    },
  },
  {
    id: 'stale-import',
    run: (i) => {
      if (!i.lastActivityOn) return null
      const days = daysBetween(i.lastActivityOn, i.today)
      if (days < 14) return null
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

export interface WatchReconciliation {
  /** Newly-detected signals with no matching open signal — persist these. */
  toCreate: WatchSignal[]
  /** Keys of open signals whose exception has cleared — mark these resolved. */
  resolvedKeys: string[]
}

/**
 * PURE: reconcile freshly-detected signals against the currently-OPEN signal keys. A signal
 * already open is left alone (no duplicate ping); a detected signal with no open match is
 * created; an open signal no longer detected has resolved. This is what keeps the watch
 * layer idempotent across reconciler runs — it never re-pings the same standing exception.
 */
export function reconcileWatch(detected: WatchSignal[], openKeys: Iterable<string>): WatchReconciliation {
  const openSet = new Set(openKeys)
  const detectedKeys = new Set(detected.map(signalKey))
  return {
    toCreate: detected.filter((s) => !openSet.has(signalKey(s))),
    resolvedKeys: [...openSet].filter((k) => !detectedKeys.has(k)),
  }
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
