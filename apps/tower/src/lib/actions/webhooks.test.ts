import { describe, expect, it, vi, beforeEach } from 'vitest'

const { getIsGroupAdmin } = vi.hoisted(() => ({ getIsGroupAdmin: vi.fn() }))
vi.mock('@/lib/lanes/memberships', () => ({ getIsGroupAdmin }))

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import { getWebhookHealth } from './webhooks'

function makeService(response: { data: unknown; error: unknown }) {
  const calls = { schemas: [] as string[], tables: [] as string[], gte: [] as [string, unknown][], limit: [] as number[] }
  const schema = (name: string) => {
    calls.schemas.push(name)
    return { from }
  }
  const from = (table: string) => {
    calls.tables.push(table)
    const builder: Record<string, unknown> = {}
    for (const m of ['select', 'order']) builder[m] = vi.fn(() => builder)
    builder.gte = vi.fn((c: string, v: unknown) => {
      calls.gte.push([c, v])
      return builder
    })
    builder.limit = vi.fn((n: number) => {
      calls.limit.push(n)
      return builder
    })
    ;(builder as { then: unknown }).then = (res: (v: unknown) => void, rej?: (e: unknown) => void) =>
      Promise.resolve(response).then(res, rej)
    return builder
  }
  return { client: { schema, from }, calls }
}

describe('getWebhookHealth · group-admin gate + bounded read', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forbids non group-admins before touching the DB', async () => {
    getIsGroupAdmin.mockResolvedValue(false)
    const { client, calls } = makeService({ data: [], error: null })
    createServiceClient.mockReturnValue(client)

    const res = await getWebhookHealth()
    expect(res.error?.code).toBe('FORBIDDEN_LANE')
    expect(calls.tables).not.toContain('webhook_deliveries')
  })

  it('reads tower.webhook_deliveries (bounded) and returns the summary', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    const { client, calls } = makeService({
      data: [
        { id: '1', source: 'REVALIDATE_OUT', direction: 'OUTBOUND', status: 'OK', reference: 'wings/machinery', detail: {}, occurred_at: '2026-07-06T10:00:00.000Z' },
        { id: '2', source: 'REVALIDATE_OUT', direction: 'OUTBOUND', status: 'FAILED', reference: 'wings/machinery', detail: {}, occurred_at: '2026-07-06T11:00:00.000Z' },
      ],
      error: null,
    })
    createServiceClient.mockReturnValue(client)

    const res = await getWebhookHealth({ days: 7 })
    expect(res.data?.windowDays).toBe(7)
    expect(res.data?.totalOk).toBe(1)
    expect(res.data?.totalFailed).toBe(1)
    expect(calls.schemas).toContain('tower')
    expect(calls.tables).toContain('webhook_deliveries')
    // A ceiling is always applied — never fetch-all.
    expect(calls.limit[0]).toBeGreaterThan(0)
    expect(calls.gte[0][0]).toBe('occurred_at')
  })

  it('surfaces a DB error as VALIDATION (never a raw message)', async () => {
    getIsGroupAdmin.mockResolvedValue(true)
    const { client } = makeService({ data: null, error: { message: 'relation does not exist' } })
    createServiceClient.mockReturnValue(client)

    const res = await getWebhookHealth()
    expect(res.error?.code).toBe('VALIDATION')
    expect(res.error?.message).not.toContain('relation does not exist')
  })
})
