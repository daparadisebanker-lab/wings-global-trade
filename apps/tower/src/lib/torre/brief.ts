// src/lib/torre/brief.ts
// Mister Torre — Reportar (Loop L5). PURE + unit-tested. Assembles the Morning Brief (and
// the Friday / month-end variants) from the watch layer's signals + the pending draft
// queue, FILTERED to what the operator's role actually acts on, plus the productivity
// telemetry (hours returned). The Brief is where non-`inmediato` signals batch (the
// interruption budget, spec non-negotiable 8) — it is the calm daily digest, not a firehose.
import type { TorreArtifactKind } from './artifacts'
import { partitionByDelivery, type Severity, type WatchRuleId, type WatchSignal } from './watch'

export type Role = 'LANE_DIRECTOR' | 'CATALOG_EDITOR' | 'TRADE_OPS' | 'SALES' | 'VIEWER'
export type BriefCadence = 'morning' | 'friday' | 'month-end'

/** Which roles care about each watch rule (so a SALES brief isn't full of ops noise). */
const RULE_ROLES: Record<WatchRuleId, Role[]> = {
  'eta-slip': ['LANE_DIRECTOR', 'TRADE_OPS'],
  'doc-deadline': ['LANE_DIRECTOR', 'TRADE_OPS'],
  demurrage: ['LANE_DIRECTOR', 'TRADE_OPS'],
  'rate-expiry': ['LANE_DIRECTOR', 'TRADE_OPS', 'SALES'],
  'payment-milestone': ['LANE_DIRECTOR', 'TRADE_OPS'],
  'quote-quiet': ['LANE_DIRECTOR', 'SALES'],
  'margin-drift': ['LANE_DIRECTOR', 'SALES'],
  'stale-import': ['LANE_DIRECTOR', 'TRADE_OPS'],
}

/** VIEWER sees everything (read-only); others see rules mapped to their role. */
function signalMatchesRole(signal: WatchSignal, role: Role): boolean {
  if (role === 'VIEWER') return true
  return RULE_ROLES[signal.rule].includes(role)
}

export interface PendingDraft {
  id: string
  kind: TorreArtifactKind
  title: string
  approvable: boolean
}

export interface BriefTelemetry {
  /** Hours returned to the team this period (from time-saved accounting). */
  hoursReturned: number
  draftsApproved: number
  signalsResolved: number
}

export interface BriefInput {
  role: Role
  /** ISO date the brief is for. */
  date: string
  cadence?: BriefCadence
  signals: WatchSignal[]
  pendingDrafts: PendingDraft[]
  telemetry?: BriefTelemetry
}

export interface MorningBrief {
  cadence: BriefCadence
  masthead: { es: string; en: string }
  /** `inmediato` signals for this role — the "needs you now" band. */
  urgent: WatchSignal[]
  /** Everything else relevant, batched (alto/medio/bajo). */
  attention: WatchSignal[]
  /** Approvable drafts waiting for this operator. */
  drafts: PendingDraft[]
  /** True when nothing needs the operator — the Brief earns its stillness. */
  quiet: boolean
  /** Telemetry is surfaced on the weekly/monthly cadences (and morning if supplied). */
  telemetry?: BriefTelemetry
}

const MASTHEAD: Record<BriefCadence, { es: string; en: string }> = {
  morning: { es: 'Buenos días', en: 'Good morning' },
  friday: { es: 'Cierre de la semana', en: 'Week in review' },
  'month-end': { es: 'Cierre del mes', en: 'Month in review' },
}

/**
 * PURE: assemble the Brief for one operator. Signals are scoped to the role, ranked, and
 * split by the interruption budget (urgent = inmediato; attention = the rest). Only
 * approvable drafts are surfaced (a blocked draft isn't an ask yet). `quiet` is true when
 * there is genuinely nothing to act on — the tower's stillness is the point.
 */
export function buildMorningBrief(input: BriefInput): MorningBrief {
  const cadence = input.cadence ?? 'morning'
  const relevant = input.signals.filter((s) => signalMatchesRole(s, input.role))
  const { realtime, brief } = partitionByDelivery(relevant, Infinity) // brief shows ALL urgent, ranked
  const drafts = input.pendingDrafts.filter((d) => d.approvable)
  const quiet = realtime.length === 0 && brief.length === 0 && drafts.length === 0
  return {
    cadence,
    masthead: {
      es: `${MASTHEAD[cadence].es} · ${input.date}`,
      en: `${MASTHEAD[cadence].en} · ${input.date}`,
    },
    urgent: realtime,
    attention: brief,
    drafts,
    quiet,
    // weekly/monthly always show telemetry; morning only if provided
    telemetry: cadence === 'morning' ? input.telemetry : (input.telemetry ?? { hoursReturned: 0, draftsApproved: 0, signalsResolved: 0 }),
  }
}

// ── Productivity telemetry (hours returned) ──────────────────────────────────

/** One time-saving event with the minutes it saved a human. */
export interface TimeSavedEvent {
  kind: 'draft_approved' | 'quote_run' | 'signal_resolved' | 'doc_generated'
  minutesSaved: number
}

/** Default minutes-saved per event kind (a conservative, defensible baseline). */
export const MINUTES_SAVED: Record<TimeSavedEvent['kind'], number> = {
  quote_run: 25, // vs. building a landed-cost sheet by hand
  draft_approved: 8, // vs. drafting the message/document from scratch
  doc_generated: 12,
  signal_resolved: 5, // vs. spotting the exception manually
}

/** PURE: sum a period's events into hours returned + counts (a Friday/month-end rollup). */
export function productivitySummary(events: TimeSavedEvent[]): BriefTelemetry {
  let minutes = 0
  let draftsApproved = 0
  let signalsResolved = 0
  for (const e of events) {
    minutes += e.minutesSaved
    if (e.kind === 'draft_approved') draftsApproved++
    if (e.kind === 'signal_resolved') signalsResolved++
  }
  return { hoursReturned: Math.round((minutes / 60) * 10) / 10, draftsApproved, signalsResolved }
}

/** PURE: a TimeSavedEvent from an event kind using the default baseline (or an override). */
export function timeSavedEvent(kind: TimeSavedEvent['kind'], minutesSaved = MINUTES_SAVED[kind]): TimeSavedEvent {
  return { kind, minutesSaved }
}

// re-exported for callers assembling briefs
export type { Severity }
