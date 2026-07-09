// src/lib/actions/signals.ts
// The Signal Deck's read layer (COMPONENT_TREE §4; TOWER CLAUDE.md "dashboards
// query rollups, NEVER raw events").
//
// THE ROLLUP LAW. `tower.metric_rollups_daily` is a MATERIALIZED VIEW — it can't
// carry RLS, so `authenticated` has NO access to it (see migration/
// wave4-signals.sql). The Signal Deck therefore reads it through the
// SERVICE-ROLE client, but only AFTER resolving the caller's lanes from their
// `lane_memberships` via the RLS-scoped client. The service query is always
// filtered `.in('lane_slug', <the caller's lanes>)` — a director sees only their
// lanes; a group admin sees every lane (the cross-lane view). The matview is
// never exposed to `authenticated`, and raw `tower.events` is never read here.
//
// SERVER-ONLY: this module imports the service-role client. Import it only from
// Server Components / server code — never from a client component.
import { createServiceClient } from '@/lib/supabase/server'
import { getLaneMemberships, getIsGroupAdmin } from '@/lib/lanes/memberships'
import type { Localized } from '@/lib/i18n'

/** The matview name — the ONLY analytics source the deck ever reads. */
export const ROLLUP_VIEW = 'metric_rollups_daily' as const

// ── Shapes ───────────────────────────────────────────────────────────────────

/** One row of `tower.metric_rollups_daily`. */
export interface RollupRow {
  day: string
  brand_slug: string
  lane_slug: string
  event: string
  product_slug: string | null
  n: number
  sessions: number
}

export interface LaneRef {
  slug: string
  name: string
  code: string | null
}

export interface PulseMetric {
  key: string
  label: Localized
  current: number
  previous: number
  /** current − previous (raw delta; the UI colours sign). */
  delta: number
}

export interface FunnelStep {
  key: string
  label: Localized
  count: number
  /** Conversion from the previous step, in basis points (0 for the first step). */
  conversionBps: number
}

export interface LeaderboardRow {
  productSlug: string
  views: number
  specOpens: number
  rfqs: number
  /** current-window views − previous-window views. */
  velocityDelta: number
}

export interface SourceSlice {
  key: string
  label: Localized
  count: number
}

export interface FillWatchRow {
  laneSlug: string
  interactions: number
  sessions: number
}

export interface SignalDeck {
  windowDays: number
  laneSlugs: string[]
  isGroupAdmin: boolean
  pulse: PulseMetric[]
  funnel: FunnelStep[]
  leaderboard: LeaderboardRow[]
  sourceSplit: SourceSlice[]
  fillWatch: FillWatchRow[]
}

// ── Metric vocabulary (wholesale, ES/EN) ──────────────────────────────────────

const PULSE_METRICS: { key: string; event: string; label: Localized }[] = [
  { key: 'views', event: 'product_view', label: { es: 'Vistas de producto', en: 'Product views' } },
  { key: 'spec_opens', event: 'spec_open', label: { es: 'Fichas técnicas', en: 'Spec opens' } },
  { key: 'mister_starts', event: 'mister_start', label: { es: 'Inicios de Mister', en: 'Mister starts' } },
  { key: 'rfqs', event: 'rfq_submit', label: { es: 'Solicitudes (RFQ)', en: 'RFQs' } },
  { key: 'handoffs', event: 'whatsapp_handoff', label: { es: 'Traspasos WhatsApp', en: 'WhatsApp handoffs' } },
]

const FUNNEL_STEPS: { key: string; event: string; label: Localized }[] = [
  { key: 'view', event: 'product_view', label: { es: 'Vista', en: 'View' } },
  { key: 'spec', event: 'spec_open', label: { es: 'Ficha técnica', en: 'Spec open' } },
  { key: 'mister', event: 'mister_start', label: { es: 'Mister', en: 'Mister' } },
  { key: 'rfq', event: 'rfq_submit', label: { es: 'RFQ', en: 'RFQ' } },
]

const SOURCE_SLICES: { key: string; event: string; label: Localized }[] = [
  { key: 'mister', event: 'mister_start', label: { es: 'Mister', en: 'Mister' } },
  { key: 'form', event: 'rfq_submit', label: { es: 'Formulario', en: 'Form' } },
  { key: 'whatsapp', event: 'whatsapp_handoff', label: { es: 'WhatsApp', en: 'WhatsApp' } },
]

// ── Pure aggregation (unit-tested) ─────────────────────────────────────────────

/** Date part 'YYYY-MM-DD' of a rollup `day` (a day-truncated timestamptz). */
function dayKey(day: string): string {
  return day.slice(0, 10)
}

/** 'YYYY-MM-DD' for `now` minus `daysAgo` days, in UTC. */
export function isoDayOffset(now: Date, daysAgo: number): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function sumN(rows: RollupRow[], event: string): number {
  return rows.reduce((t, r) => (r.event === event ? t + Number(r.n ?? 0) : t), 0)
}

/**
 * Fold rollup rows into the deck. `boundaryDay` splits current (day ≥ boundary)
 * from previous (day < boundary). Pure — deterministic given its inputs, so the
 * whole deck is testable without a DB.
 */
export function aggregateSignalDeck(
  rows: RollupRow[],
  opts: { boundaryDay: string; windowDays: number; laneSlugs: string[]; isGroupAdmin: boolean },
): SignalDeck {
  const current = rows.filter((r) => dayKey(r.day) >= opts.boundaryDay)
  const previous = rows.filter((r) => dayKey(r.day) < opts.boundaryDay)

  const pulse: PulseMetric[] = PULSE_METRICS.map((m) => {
    const cur = sumN(current, m.event)
    const prev = sumN(previous, m.event)
    return { key: m.key, label: m.label, current: cur, previous: prev, delta: cur - prev }
  })

  const funnel: FunnelStep[] = FUNNEL_STEPS.map((step, i) => {
    const count = sumN(current, step.event)
    let conversionBps = 0
    if (i > 0) {
      const prevCount = sumN(current, FUNNEL_STEPS[i - 1].event)
      conversionBps = prevCount > 0 ? Math.round((count / prevCount) * 10_000) : 0
    }
    return { key: step.key, label: step.label, count, conversionBps }
  })

  // Leaderboard: per product_slug, current views/specs/rfqs + view velocity.
  const byProduct = new Map<string, { views: number; specOpens: number; rfqs: number; prevViews: number }>()
  const bump = (slug: string) => {
    let e = byProduct.get(slug)
    if (!e) {
      e = { views: 0, specOpens: 0, rfqs: 0, prevViews: 0 }
      byProduct.set(slug, e)
    }
    return e
  }
  for (const r of current) {
    if (!r.product_slug) continue
    const e = bump(r.product_slug)
    if (r.event === 'product_view') e.views += Number(r.n ?? 0)
    else if (r.event === 'spec_open') e.specOpens += Number(r.n ?? 0)
    else if (r.event === 'rfq_submit') e.rfqs += Number(r.n ?? 0)
  }
  for (const r of previous) {
    if (!r.product_slug || r.event !== 'product_view') continue
    bump(r.product_slug).prevViews += Number(r.n ?? 0)
  }
  const leaderboard: LeaderboardRow[] = [...byProduct.entries()]
    .map(([productSlug, e]) => ({
      productSlug,
      views: e.views,
      specOpens: e.specOpens,
      rfqs: e.rfqs,
      velocityDelta: e.views - e.prevViews,
    }))
    .sort((a, b) => b.views - a.views || b.rfqs - a.rfqs)
    .slice(0, 10)

  const sourceSplit: SourceSlice[] = SOURCE_SLICES.map((s) => ({
    key: s.key,
    label: s.label,
    count: sumN(current, s.event),
  }))

  // FillWatch: fillmeter interaction volume per lane (fill % lives in Container
  // Desk data — joined at the page level where available).
  const byLane = new Map<string, { interactions: number; sessions: number }>()
  for (const r of current) {
    if (r.event !== 'fillmeter_interact') continue
    let e = byLane.get(r.lane_slug)
    if (!e) {
      e = { interactions: 0, sessions: 0 }
      byLane.set(r.lane_slug, e)
    }
    e.interactions += Number(r.n ?? 0)
    e.sessions += Number(r.sessions ?? 0)
  }
  const fillWatch: FillWatchRow[] = [...byLane.entries()]
    .map(([laneSlug, e]) => ({ laneSlug, interactions: e.interactions, sessions: e.sessions }))
    .sort((a, b) => b.interactions - a.interactions)

  return {
    windowDays: opts.windowDays,
    laneSlugs: opts.laneSlugs,
    isGroupAdmin: opts.isGroupAdmin,
    pulse,
    funnel,
    leaderboard,
    sourceSplit,
    fillWatch,
  }
}

/** Per-lane + per-brand breakdown for the group cross-lane view. */
export interface GroupBreakdown {
  perLane: { laneSlug: string; laneName: string; brandSlug: string; views: number; rfqs: number }[]
  brandSplit: { brandSlug: string; views: number; rfqs: number }[]
}

export function aggregateGroupBreakdown(
  rows: RollupRow[],
  boundaryDay: string,
  laneNames: Map<string, string>,
): GroupBreakdown {
  const current = rows.filter((r) => dayKey(r.day) >= boundaryDay)
  const lane = new Map<string, { brandSlug: string; views: number; rfqs: number }>()
  const brand = new Map<string, { views: number; rfqs: number }>()
  for (const r of current) {
    const l = lane.get(r.lane_slug) ?? { brandSlug: r.brand_slug, views: 0, rfqs: 0 }
    const b = brand.get(r.brand_slug) ?? { views: 0, rfqs: 0 }
    if (r.event === 'product_view') {
      l.views += Number(r.n ?? 0)
      b.views += Number(r.n ?? 0)
    } else if (r.event === 'rfq_submit') {
      l.rfqs += Number(r.n ?? 0)
      b.rfqs += Number(r.n ?? 0)
    }
    lane.set(r.lane_slug, l)
    brand.set(r.brand_slug, b)
  }
  return {
    perLane: [...lane.entries()]
      .map(([laneSlug, e]) => ({
        laneSlug,
        laneName: laneNames.get(laneSlug) ?? laneSlug,
        brandSlug: e.brandSlug,
        views: e.views,
        rfqs: e.rfqs,
      }))
      .sort((a, b) => b.views - a.views),
    brandSplit: [...brand.entries()]
      .map(([brandSlug, e]) => ({ brandSlug, views: e.views, rfqs: e.rfqs }))
      .sort((a, b) => b.views - a.views),
  }
}

// ── Scope + rollup fetch (service-role, always lane-filtered) ──────────────────

type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>

/** Every non-archived lane (group-admin scope). Service-role read. */
async function listAllLanes(service: ServiceClient): Promise<LaneRef[]> {
  const { data, error } = await service
    .schema('tower')
    .from('lanes')
    .select('slug, name, code')
    .neq('status', 'ARCHIVED')
  if (error || !data) return []
  return (data as { slug: string; name: string; code: string | null }[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    code: l.code,
  }))
}

export interface SignalScope {
  laneSlugs: string[]
  lanes: LaneRef[]
  isGroupAdmin: boolean
}

/**
 * Resolve the caller's analytics scope. Memberships are read through the
 * RLS-scoped client (a user sees only their own); a group admin's scope is every
 * lane. This is the ONLY thing that decides which lane_slugs the rollup query
 * may touch.
 */
export async function resolveSignalScope(): Promise<SignalScope> {
  const [memberships, isGroupAdmin] = await Promise.all([getLaneMemberships(), getIsGroupAdmin()])

  if (isGroupAdmin) {
    const service = createServiceClient()
    const lanes = service ? await listAllLanes(service) : []
    return { laneSlugs: lanes.map((l) => l.slug), lanes, isGroupAdmin: true }
  }

  const bySlug = new Map<string, LaneRef>()
  for (const m of memberships) {
    if (!bySlug.has(m.laneSlug)) bySlug.set(m.laneSlug, { slug: m.laneSlug, name: m.laneName, code: m.laneCode })
  }
  const lanes = [...bySlug.values()]
  return { laneSlugs: lanes.map((l) => l.slug), lanes, isGroupAdmin: false }
}

/**
 * The lane-scoped rollup read. ALWAYS targets the matview and ALWAYS filters
 * `.in('lane_slug', laneSlugs)` — the enforcement point behind the deck. Never
 * called with an unscoped lane set.
 */
async function fetchRollupRows(
  service: ServiceClient,
  laneSlugs: string[],
  sinceDay: string,
): Promise<RollupRow[] | null> {
  if (laneSlugs.length === 0) return []
  const { data, error } = await service
    .schema('tower')
    .from(ROLLUP_VIEW)
    .select('day, brand_slug, lane_slug, event, product_slug, n, sessions')
    .gte('day', sinceDay)
    .in('lane_slug', laneSlugs)
  if (error) return null
  return (data ?? []) as RollupRow[]
}

export type SignalDeckResult =
  | { ok: true; deck: SignalDeck; lanes: LaneRef[] }
  | { ok: false; reason: 'NO_LANES' | 'UNAVAILABLE' }

/**
 * Director view: the deck for the caller's lanes (optionally narrowed to one
 * in-scope lane). Windows are `days` (default 7) vs the prior `days`.
 */
export async function getSignalDeck(params?: { laneSlug?: string; days?: number }): Promise<SignalDeckResult> {
  const windowDays = params?.days && params.days > 0 ? Math.min(params.days, 90) : 7
  const scope = await resolveSignalScope()
  if (scope.laneSlugs.length === 0) return { ok: false, reason: 'NO_LANES' }

  // A `?lane=` param may only narrow WITHIN scope — never widen or cross lanes.
  let targetLanes = scope.laneSlugs
  let lanes = scope.lanes
  if (params?.laneSlug && scope.laneSlugs.includes(params.laneSlug)) {
    targetLanes = [params.laneSlug]
    lanes = scope.lanes.filter((l) => l.slug === params.laneSlug)
  }

  const service = createServiceClient()
  if (!service) return { ok: false, reason: 'UNAVAILABLE' }

  const now = new Date()
  const boundaryDay = isoDayOffset(now, windowDays)
  const sinceDay = isoDayOffset(now, windowDays * 2)

  const rows = await fetchRollupRows(service, targetLanes, sinceDay)
  if (rows === null) return { ok: false, reason: 'UNAVAILABLE' }

  const deck = aggregateSignalDeck(rows, {
    boundaryDay,
    windowDays,
    laneSlugs: targetLanes,
    isGroupAdmin: scope.isGroupAdmin,
  })
  return { ok: true, deck, lanes }
}

export type GroupSignalDeckResult =
  | { ok: true; deck: SignalDeck; breakdown: GroupBreakdown; lanes: LaneRef[] }
  | { ok: false; reason: 'FORBIDDEN' | 'NO_LANES' | 'UNAVAILABLE' }

/**
 * Group cross-lane view (COMPONENT_TREE `/signals/group`). Group admin only —
 * the RLS-scoped `is_group_admin` flag gates it; a non-admin gets FORBIDDEN.
 * Still lane-filtered (to every lane), so the enforcement invariant holds.
 */
export async function getGroupSignalDeck(params?: { days?: number }): Promise<GroupSignalDeckResult> {
  const windowDays = params?.days && params.days > 0 ? Math.min(params.days, 90) : 7
  const scope = await resolveSignalScope()
  if (!scope.isGroupAdmin) return { ok: false, reason: 'FORBIDDEN' }
  if (scope.laneSlugs.length === 0) return { ok: false, reason: 'NO_LANES' }

  const service = createServiceClient()
  if (!service) return { ok: false, reason: 'UNAVAILABLE' }

  const now = new Date()
  const boundaryDay = isoDayOffset(now, windowDays)
  const sinceDay = isoDayOffset(now, windowDays * 2)

  const rows = await fetchRollupRows(service, scope.laneSlugs, sinceDay)
  if (rows === null) return { ok: false, reason: 'UNAVAILABLE' }

  const deck = aggregateSignalDeck(rows, {
    boundaryDay,
    windowDays,
    laneSlugs: scope.laneSlugs,
    isGroupAdmin: true,
  })
  const laneNames = new Map(scope.lanes.map((l) => [l.slug, l.name]))
  const breakdown = aggregateGroupBreakdown(rows, boundaryDay, laneNames)
  return { ok: true, deck, breakdown, lanes: scope.lanes }
}
