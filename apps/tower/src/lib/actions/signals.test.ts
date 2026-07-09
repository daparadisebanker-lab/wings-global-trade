import { describe, expect, it, vi, beforeEach } from 'vitest'

const { getLaneMemberships, getIsGroupAdmin } = vi.hoisted(() => ({
  getLaneMemberships: vi.fn(),
  getIsGroupAdmin: vi.fn(),
}))
vi.mock('@/lib/lanes/memberships', () => ({ getLaneMemberships, getIsGroupAdmin }))

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import {
  getSignalDeck,
  getGroupSignalDeck,
  aggregateSignalDeck,
  isoDayOffset,
  type RollupRow,
} from './signals'

// Records every from()/in() call so the test can prove WHAT was queried.
function makeService(byTable: Record<string, { data: unknown; error: unknown }>) {
  const calls = { tables: [] as string[], schemas: [] as string[], inArgs: [] as [string, unknown][] }
  const schema = (name: string) => {
    calls.schemas.push(name)
    return { from }
  }
  const from = (table: string) => {
    calls.tables.push(table)
    const response = byTable[table] ?? { data: [], error: null }
    const builder: Record<string, unknown> = {}
    for (const m of ['select', 'gte', 'neq', 'eq']) builder[m] = vi.fn(() => builder)
    builder.in = vi.fn((col: string, vals: unknown) => {
      calls.inArgs.push([col, vals])
      return builder
    })
    ;(builder as { then: unknown }).then = (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
      Promise.resolve(response).then(res, rej)
    return builder
  }
  return { client: { schema, from }, calls }
}

// Current-window + previous-window rows for lane 'machinery'.
function rows(): RollupRow[] {
  const now = new Date()
  const cur = `${isoDayOffset(now, 1)}T00:00:00+00:00`
  const prev = `${isoDayOffset(now, 10)}T00:00:00+00:00`
  return [
    { day: cur, brand_slug: 'wings', lane_slug: 'machinery', event: 'product_view', product_slug: 'lathe', n: 100, sessions: 80 },
    { day: cur, brand_slug: 'wings', lane_slug: 'machinery', event: 'spec_open', product_slug: 'lathe', n: 40, sessions: 30 },
    { day: cur, brand_slug: 'wings', lane_slug: 'machinery', event: 'mister_start', product_slug: null, n: 10, sessions: 9 },
    { day: cur, brand_slug: 'wings', lane_slug: 'machinery', event: 'rfq_submit', product_slug: 'lathe', n: 5, sessions: 5 },
    { day: cur, brand_slug: 'wings', lane_slug: 'machinery', event: 'whatsapp_handoff', product_slug: null, n: 3, sessions: 3 },
    { day: cur, brand_slug: 'wings', lane_slug: 'machinery', event: 'fillmeter_interact', product_slug: null, n: 7, sessions: 6 },
    { day: prev, brand_slug: 'wings', lane_slug: 'machinery', event: 'product_view', product_slug: 'lathe', n: 50, sessions: 40 },
  ]
}

describe('getSignalDeck · rollup law', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getIsGroupAdmin.mockResolvedValue(false)
    getLaneMemberships.mockResolvedValue([
      { laneSlug: 'machinery', laneName: 'Machinery', laneCode: 'WGT/01' },
      { laneSlug: 'interiors', laneName: 'Interiors', laneCode: 'WGT/02' },
    ])
  })

  it('queries the rollup matview — never raw events — filtered to the caller lanes', async () => {
    const { client, calls } = makeService({ metric_rollups_daily: { data: rows(), error: null } })
    createServiceClient.mockReturnValue(client)

    const res = await getSignalDeck()

    expect(res.ok).toBe(true)
    // The ONLY table touched is the matview; `events` is never read.
    expect(calls.tables).toContain('metric_rollups_daily')
    expect(calls.tables).not.toContain('events')
    expect(calls.schemas).toContain('tower')
    // Filtered to exactly the caller's membership lanes.
    expect(calls.inArgs).toContainEqual(['lane_slug', ['machinery', 'interiors']])
  })

  it('narrows to a single in-scope lane via ?lane, and never widens out of scope', async () => {
    const inScope = makeService({ metric_rollups_daily: { data: rows(), error: null } })
    createServiceClient.mockReturnValue(inScope.client)
    await getSignalDeck({ laneSlug: 'machinery' })
    expect(inScope.calls.inArgs).toContainEqual(['lane_slug', ['machinery']])

    // An out-of-scope lane is ignored — the query stays scoped to memberships.
    vi.clearAllMocks()
    getIsGroupAdmin.mockResolvedValue(false)
    getLaneMemberships.mockResolvedValue([{ laneSlug: 'machinery', laneName: 'Machinery', laneCode: 'WGT/01' }])
    const attempt = makeService({ metric_rollups_daily: { data: [], error: null } })
    createServiceClient.mockReturnValue(attempt.client)
    await getSignalDeck({ laneSlug: 'provisions' }) // not a member lane
    expect(attempt.calls.inArgs).toContainEqual(['lane_slug', ['machinery']])
    expect(attempt.calls.inArgs).not.toContainEqual(['lane_slug', ['provisions']])
  })

  it('returns NO_LANES when the caller has no memberships (and never queries)', async () => {
    getLaneMemberships.mockResolvedValue([])
    const { client, calls } = makeService({})
    createServiceClient.mockReturnValue(client)

    const res = await getSignalDeck()
    expect(res).toEqual({ ok: false, reason: 'NO_LANES' })
    expect(calls.tables).not.toContain('metric_rollups_daily')
  })
})

describe('getGroupSignalDeck · admin only, still lane-filtered', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forbids non group-admins', async () => {
    getIsGroupAdmin.mockResolvedValue(false)
    getLaneMemberships.mockResolvedValue([{ laneSlug: 'machinery', laneName: 'Machinery', laneCode: 'WGT/01' }])
    const res = await getGroupSignalDeck()
    expect(res).toEqual({ ok: false, reason: 'FORBIDDEN' })
  })

  it('for a group admin, scopes to every lane and reads the matview', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    getLaneMemberships.mockResolvedValue([])
    const { client, calls } = makeService({
      lanes: { data: [{ slug: 'machinery', name: 'Machinery', code: 'WGT/01' }, { slug: 'provisions', name: 'Provisions', code: 'WGT/03' }], error: null },
      metric_rollups_daily: { data: rows(), error: null },
    })
    createServiceClient.mockReturnValue(client)

    const res = await getGroupSignalDeck()
    expect(res.ok).toBe(true)
    expect(calls.tables).toContain('metric_rollups_daily')
    expect(calls.tables).not.toContain('events')
    expect(calls.inArgs).toContainEqual(['lane_slug', ['machinery', 'provisions']])
  })
})

describe('aggregateSignalDeck · pure folding', () => {
  it('computes pulse deltas, funnel conversions, leaderboard velocity and source split', () => {
    const now = new Date()
    const boundaryDay = isoDayOffset(now, 7)
    const deck = aggregateSignalDeck(rows(), { boundaryDay, windowDays: 7, laneSlugs: ['machinery'], isGroupAdmin: false })

    const views = deck.pulse.find((p) => p.key === 'views')!
    expect(views).toMatchObject({ current: 100, previous: 50, delta: 50 })

    // view 100 → spec 40 = 40% = 4000 bps; spec 40 → mister 10 = 2500 bps.
    expect(deck.funnel.find((f) => f.key === 'spec')!.conversionBps).toBe(4000)
    expect(deck.funnel.find((f) => f.key === 'mister')!.conversionBps).toBe(2500)

    expect(deck.leaderboard[0]).toMatchObject({ productSlug: 'lathe', views: 100, specOpens: 40, rfqs: 5, velocityDelta: 50 })
    expect(deck.sourceSplit.find((s) => s.key === 'mister')!.count).toBe(10)
    expect(deck.fillWatch[0]).toMatchObject({ laneSlug: 'machinery', interactions: 7, sessions: 6 })
  })
})
