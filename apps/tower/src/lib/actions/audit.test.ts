import { describe, expect, it, vi, beforeEach } from 'vitest'

const { getIsGroupAdmin } = vi.hoisted(() => ({ getIsGroupAdmin: vi.fn() }))
vi.mock('@/lib/lanes/memberships', () => ({ getIsGroupAdmin }))

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import { listAuditLog, getAuditFacets } from './audit'

// Records schema/from/filter calls so a test can prove WHAT was queried, and
// serves a per-table response — same shape as signals.test.ts's makeService.
function makeService(byTable: Record<string, { data: unknown; error: unknown }>) {
  const calls = {
    schemas: [] as string[],
    tables: [] as string[],
    eq: [] as [string, unknown][],
    or: [] as string[],
    gte: [] as [string, unknown][],
    lt: [] as [string, unknown][],
    limit: [] as number[],
  }
  const schema = (name: string) => {
    calls.schemas.push(name)
    return { from }
  }
  const from = (table: string) => {
    calls.tables.push(table)
    const response = byTable[table] ?? { data: [], error: null }
    const builder: Record<string, unknown> = {}
    for (const m of ['select', 'order', 'neq']) builder[m] = vi.fn(() => builder)
    builder.limit = vi.fn((n: number) => {
      calls.limit.push(n)
      return builder
    })
    builder.eq = vi.fn((c: string, v: unknown) => {
      calls.eq.push([c, v])
      return builder
    })
    builder.gte = vi.fn((c: string, v: unknown) => {
      calls.gte.push([c, v])
      return builder
    })
    builder.lt = vi.fn((c: string, v: unknown) => {
      calls.lt.push([c, v])
      return builder
    })
    builder.or = vi.fn((clause: string) => {
      calls.or.push(clause)
      return builder
    })
    ;(builder as { then: unknown }).then = (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
      Promise.resolve(response).then(res, rej)
    return builder
  }
  return { client: { schema, from }, calls }
}

const UUID = '11111111-1111-1111-1111-111111111111'

function auditRows(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: 1000 - i,
    at: `2026-07-06T10:0${i}:00.000Z`,
    actor: UUID,
    table_name: 'products',
    row_id: UUID,
    action: 'UPDATE',
    before: { status: 'DRAFT' },
    after: { status: 'PUBLISHED' },
  }))
}

describe('listAuditLog · group-admin gate + SQL filtering', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forbids non group-admins before touching the DB', async () => {
    getIsGroupAdmin.mockResolvedValue(false)
    const { client, calls } = makeService({})
    createServiceClient.mockReturnValue(client)

    const res = await listAuditLog({})
    expect(res.error?.code).toBe('FORBIDDEN_LANE')
    expect(calls.tables).not.toContain('audit_log')
  })

  it('reads tower.audit_log and applies filters in SQL', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    const { client, calls } = makeService({ audit_log: { data: auditRows(3), error: null } })
    createServiceClient.mockReturnValue(client)

    const res = await listAuditLog({ tableName: 'products', action: 'UPDATE', actor: UUID, from: '2026-07-01T00:00:00.000Z' })

    expect(res.data?.rows).toHaveLength(3)
    expect(calls.schemas).toContain('tower')
    expect(calls.tables).toContain('audit_log')
    // Filters are pushed to the query, not applied in JS.
    expect(calls.eq).toContainEqual(['table_name', 'products'])
    expect(calls.eq).toContainEqual(['action', 'UPDATE'])
    expect(calls.eq).toContainEqual(['actor', UUID])
    expect(calls.gte).toContainEqual(['at', '2026-07-01T00:00:00.000Z'])
  })

  it('emits a nextCursor only when a full extra row is returned (limit+1)', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    // limit defaults to 50; return 51 rows → hasMore.
    const { client } = makeService({ audit_log: { data: auditRows(51), error: null } })
    createServiceClient.mockReturnValue(client)

    const res = await listAuditLog({})
    expect(res.data?.rows).toHaveLength(50)
    expect(res.data?.nextCursor).toBeTruthy()
  })

  it('derives a lane filter from the before/after JSON via .or()', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    const { client, calls } = makeService({ audit_log: { data: [], error: null } })
    createServiceClient.mockReturnValue(client)

    await listAuditLog({ laneId: UUID })
    expect(calls.or.some((c) => c.includes(`after->>lane_id.eq.${UUID}`) && c.includes(`before->>lane_id.eq.${UUID}`))).toBe(true)
  })

  it('rejects invalid filters as VALIDATION', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    createServiceClient.mockReturnValue(makeService({}).client)
    const res = await listAuditLog({ actor: 'not-a-uuid' })
    expect(res.error?.code).toBe('VALIDATION')
  })
})

describe('getAuditFacets · admin only', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forbids non group-admins', async () => {
    getIsGroupAdmin.mockResolvedValue(false)
    createServiceClient.mockReturnValue(makeService({}).client)
    const res = await getAuditFacets()
    expect(res.error?.code).toBe('FORBIDDEN_LANE')
  })

  it('returns curated tables/actions plus named actors/lanes/brands', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    const { client } = makeService({
      profiles: { data: [{ id: UUID, full_name: 'Ada', email: 'a@x.com' }], error: null },
      lanes: { data: [{ id: UUID, code: 'WGT/01', name: 'Machinery' }], error: null },
      brands: { data: [{ id: UUID, slug: 'wings', name: 'Wings' }], error: null },
    })
    createServiceClient.mockReturnValue(client)

    const res = await getAuditFacets()
    expect(res.data?.tables).toContain('products')
    expect(res.data?.actions).toEqual(['INSERT', 'UPDATE', 'DELETE'])
    expect(res.data?.actors).toEqual([{ id: UUID, name: 'Ada' }])
    expect(res.data?.lanes[0]).toMatchObject({ code: 'WGT/01' })
    expect(res.data?.brands[0]).toMatchObject({ slug: 'wings' })
  })
})
