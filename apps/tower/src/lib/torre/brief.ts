// src/lib/torre/brief.ts
// Mister Torre — Reportar (Loop L5). PURE + unit-tested. Assembles the Morning Brief (and
// the Friday / month-end variants) from the watch layer's signals + the pending draft
// queue, FILTERED to what the operator's role actually acts on, plus the productivity
// telemetry (hours returned). The Brief is where non-`inmediato` signals batch (the
// interruption budget, spec non-negotiable 8) — it is the calm daily digest, not a firehose.
import { TORRE_ARTIFACT_KINDS, type TorreArtifactKind } from './artifacts'
import { partitionByDelivery, type Severity, type WatchRuleId, type WatchSignal } from './watch'

export type Role = 'LANE_DIRECTOR' | 'CATALOG_EDITOR' | 'TRADE_OPS' | 'SALES' | 'VIEWER'
export type BriefCadence = 'morning' | 'friday' | 'month-end'

// Which roles care about each watch rule (so a SALES brief isn't full of ops noise).
// CATALOG_EDITOR maps to no rules BY DESIGN — a catalog editor has no import-ops concern,
// so their Brief is signal-free (they still see approvable drafts + read watch_signals via
// RLS). LANE_DIRECTOR covers all 8, so every rule reaches at least one role (see the
// totality test). VIEWER is handled separately (sees all, read-only).
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
  /** Hours returned in the lanes THIS operator can see (RLS-scoped; not a team-wide total —
   *  a lane-scoped viewer and a director get honestly different numbers for the same period). */
  hoursReturned: number
  /** Every approval-derived event is one approved artifact (quote, doc, message, cost sheet). */
  draftsApproved: number
  /** Human-resolved signals. OMITTED until resolutions are tracked — never emitted as a bare
   *  "0", which would be the same vanity lie buildMorningBrief refuses for hoursReturned. */
  signalsResolved?: number
  /** The methodology, so the Brief can footnote the number instead of presenting it as fact:
   *  per-kind count + the minutes-saved baseline that produced `hoursReturned`. */
  basis?: TelemetryBasis[]
}

/** One line of the hours-returned methodology (a kind, how many, and minutes each). */
export interface TelemetryBasis {
  kind: TimeSavedEvent['kind']
  count: number
  /** Total minutes credited to this kind (count × the per-event baseline). */
  minutesSaved: number
}

export interface BriefInput {
  role: Role
  /** ISO date the brief is for. */
  date: string
  cadence?: BriefCadence
  signals: WatchSignal[]
  /** Already RLS-scoped to what THIS operator can see (the drafts query is role-scoped at
   *  fetch); buildMorningBrief only filters to approvable, it does not re-scope by role. */
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
    // telemetry is surfaced when supplied (prominently on weekly/monthly); NEVER fabricated
    // — "0 hours returned" when the data simply wasn't wired would be a vanity lie.
    telemetry: input.telemetry,
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

/**
 * PURE: sum a period's events into hours returned + counts (a Friday/month-end rollup).
 * `draftsApproved` counts EVERY approval-derived event — a quote, a document, a message and
 * a cost sheet are all approved artifacts, so it never undercounts next to the hours it feeds.
 * `signalsResolved` appears ONLY when real signal-resolution events are present (omitted at
 * zero — not-tracked must not masquerade as "0 resolved"). `basis` carries the methodology.
 */
export function productivitySummary(events: TimeSavedEvent[]): BriefTelemetry {
  let minutes = 0
  let draftsApproved = 0
  let signalsResolved = 0
  const perKind = new Map<TimeSavedEvent['kind'], { count: number; minutesSaved: number }>()
  for (const e of events) {
    minutes += e.minutesSaved
    if (e.kind === 'signal_resolved') signalsResolved++
    else draftsApproved++ // every non-signal event is an approved artifact
    const agg = perKind.get(e.kind) ?? { count: 0, minutesSaved: 0 }
    agg.count++
    agg.minutesSaved += e.minutesSaved
    perKind.set(e.kind, agg)
  }
  const summary: BriefTelemetry = { hoursReturned: Math.round((minutes / 60) * 10) / 10, draftsApproved }
  if (signalsResolved > 0) summary.signalsResolved = signalsResolved
  if (perKind.size > 0) summary.basis = [...perKind.entries()].map(([kind, a]) => ({ kind, ...a }))
  return summary
}

/** PURE: a TimeSavedEvent from an event kind using the default baseline (or an override). */
export function timeSavedEvent(kind: TimeSavedEvent['kind'], minutesSaved = MINUTES_SAVED[kind]): TimeSavedEvent {
  return { kind, minutesSaved }
}

const DOCUMENT_KINDS: ReadonlySet<TorreArtifactKind> = new Set(['REPORTE_ESTADO', 'CHECKLIST_DOCS', 'ACTA', 'SOP'])

/** The minimal shape of an approved artifact needed to count its time-saved event HONESTLY. */
export interface ApprovedArtifactRef {
  /** The ai_drafts row id (the identity a pair/lineage link points at). */
  id: string
  kind: TorreArtifactKind
  /** Revision lineage: the predecessor draft id this row supersedes (ai_drafts ref), else null. */
  supersedesId?: string | null
  /** COTIZACION only: the HOJA_COSTOS draft id it was built from (the pair link), else null. */
  hojaCostosRef?: string | null
}

/**
 * PURE: map APPROVED Torre artifacts to time-saved events — one per artifact — WITHOUT
 * double-counting. Two collapses make the headline honest:
 *   · Quote pair: a HOJA_COSTOS is the internal landed-cost sheet a COTIZACION is built from,
 *     and quote_run's 25-min baseline already stands in for "building that sheet by hand". So
 *     a HOJA referenced by an approved COTIZACION is NOT counted again — only a STANDALONE
 *     HOJA (nothing references it) earns its own draft_approved.
 *   · Revision lineage: when both a version and its approved successor land in the window, the
 *     predecessor (superseded) is dropped — one quote, counted once, even after a revise.
 * A cotización → quote_run, a document → doc_generated, a message/standalone-sheet →
 * draft_approved. Unknown kinds are skipped. Feed the result to productivitySummary.
 */
export function timeSavedEventsFromApprovals(approved: ApprovedArtifactRef[]): TimeSavedEvent[] {
  // A predecessor superseded by a later APPROVED revision in this set is counted only once.
  const superseded = new Set<string>()
  // A HOJA that is the internal half of an approved quote pair is accounted for by its quote.
  const pairedHojas = new Set<string>()
  for (const a of approved) {
    if (a.supersedesId) superseded.add(a.supersedesId)
    if (a.kind === 'COTIZACION' && a.hojaCostosRef) pairedHojas.add(a.hojaCostosRef)
  }
  const events: TimeSavedEvent[] = []
  for (const a of approved) {
    if (!TORRE_ARTIFACT_KINDS.includes(a.kind)) continue
    if (superseded.has(a.id)) continue // an older version, replaced by a newer approval
    if (a.kind === 'HOJA_COSTOS' && pairedHojas.has(a.id)) continue // counted via its cotización
    if (a.kind === 'COTIZACION') events.push(timeSavedEvent('quote_run'))
    else if (DOCUMENT_KINDS.has(a.kind)) events.push(timeSavedEvent('doc_generated'))
    else events.push(timeSavedEvent('draft_approved')) // COMUNICACION, standalone HOJA_COSTOS
  }
  return events
}

// re-exported for callers assembling briefs
export type { Severity }
