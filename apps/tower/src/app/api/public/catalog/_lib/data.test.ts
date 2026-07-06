import { describe, expect, it, vi, beforeEach } from 'vitest'

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import { getPublishedProductBySlug, listPublishedProducts } from './data'

type Call = { method: string; args: unknown[] }

/**
 * Minimal fake of the supabase-js fluent query builder: every filter/order
 * method records its call and returns `this`; the query resolves (both via
 * `await query` directly and via `.maybeSingle()`) to a canned per-table
 * response. Good enough to (a) shape-test the mapped result and (b) assert the
 * `status = 'PUBLISHED'` guard is actually present in every query that reads
 * `products` — the one thing standing between this endpoint and leaking
 * DRAFT/IN_REVIEW rows.
 */
function fakeSupabase(responses: Record<string, { data: unknown; error: unknown }>, calls: Record<string, Call[]>) {
  return {
    from(table: string) {
      calls[table] ??= []
      const record = (method: string, args: unknown[]) => {
        calls[table].push({ method, args })
        return builder
      }
      const resolve = () => Promise.resolve(responses[table] ?? { data: null, error: null })
      const builder = {
        select: (...a: unknown[]) => record('select', a),
        eq: (...a: unknown[]) => record('eq', a),
        in: (...a: unknown[]) => record('in', a),
        or: (...a: unknown[]) => record('or', a),
        order: (...a: unknown[]) => record('order', a),
        limit: (...a: unknown[]) => record('limit', a),
        maybeSingle: () => resolve(),
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
          resolve().then(onFulfilled, onRejected),
      }
      return builder
    },
  }
}

describe('getPublishedProductBySlug', () => {
  let calls: Record<string, Call[]>

  beforeEach(() => {
    calls = {}
    vi.clearAllMocks()
  })

  it('shapes a snapshot correctly for a published product', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          brands: { data: { id: 'brand-1' }, error: null },
          lanes: { data: { id: 'lane-1' }, error: null },
          products: { data: { id: 'product-1', slug: 'arabica-01' }, error: null },
          product_versions: {
            data: { version: 3, snapshot: { name: { es: 'Café Arábica' } }, published_at: '2026-07-01T00:00:00Z' },
            error: null,
          },
        },
        calls,
      ),
    )

    const result = await getPublishedProductBySlug({
      brandSlug: 'wings',
      laneSlug: 'provisions',
      productSlug: 'arabica-01',
    })

    expect(result).toEqual({
      ok: true,
      data: {
        productId: 'product-1',
        slug: 'arabica-01',
        version: 3,
        publishedAt: '2026-07-01T00:00:00Z',
        snapshot: { name: { es: 'Café Arábica' } },
      },
    })

    // The published-only guard is present on the products query.
    expect(calls.products).toContainEqual({ method: 'eq', args: ['status', 'PUBLISHED'] })
  })

  it('returns PRODUCT_NOT_FOUND (never a snapshot) when the product row is missing', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          brands: { data: { id: 'brand-1' }, error: null },
          lanes: { data: { id: 'lane-1' }, error: null },
          products: { data: null, error: null }, // e.g. status is DRAFT/IN_REVIEW/RETIRED
        },
        calls,
      ),
    )

    const result = await getPublishedProductBySlug({
      brandSlug: 'wings',
      laneSlug: 'provisions',
      productSlug: 'draft-product',
    })

    expect(result).toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' })
  })

  it('returns BRAND_NOT_FOUND when the brand slug does not resolve', async () => {
    createServiceClient.mockReturnValue(fakeSupabase({ brands: { data: null, error: null } }, calls))

    const result = await getPublishedProductBySlug({
      brandSlug: 'nonexistent',
      laneSlug: 'provisions',
      productSlug: 'arabica-01',
    })

    expect(result).toEqual({ ok: false, error: 'BRAND_NOT_FOUND' })
  })

  it('returns UNAVAILABLE (never throws) when Supabase env is not configured', async () => {
    createServiceClient.mockReturnValue(null)

    const result = await getPublishedProductBySlug({
      brandSlug: 'wings',
      laneSlug: 'provisions',
      productSlug: 'arabica-01',
    })

    expect(result).toEqual({ ok: false, error: 'UNAVAILABLE' })
  })
})

describe('listPublishedProducts', () => {
  let calls: Record<string, Call[]>

  beforeEach(() => {
    calls = {}
    vi.clearAllMocks()
  })

  it('shapes a page of snapshots and guards on PUBLISHED status', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          brands: { data: { id: 'brand-1' }, error: null },
          lanes: { data: { id: 'lane-1' }, error: null },
          products: {
            data: [{ id: 'product-1', slug: 'arabica-01', updated_at: '2026-07-01T00:00:00Z' }],
            error: null,
          },
          product_versions: {
            data: [
              { product_id: 'product-1', version: 1, snapshot: { name: 'v1' }, published_at: '2026-06-01T00:00:00Z' },
              { product_id: 'product-1', version: 2, snapshot: { name: 'v2' }, published_at: '2026-07-01T00:00:00Z' },
            ],
            error: null,
          },
        },
        calls,
      ),
    )

    const result = await listPublishedProducts({
      brandSlug: 'wings',
      laneSlug: 'provisions',
      limit: 50,
      cursor: null,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('unreachable')

    // Highest version (2) wins over the older row (1).
    expect(result.data.items).toEqual([
      {
        productId: 'product-1',
        slug: 'arabica-01',
        version: 2,
        publishedAt: '2026-07-01T00:00:00Z',
        snapshot: { name: 'v2' },
      },
    ])
    expect(result.data.nextCursor).toBeNull()
    expect(calls.products).toContainEqual({ method: 'eq', args: ['status', 'PUBLISHED'] })
  })

  it('returns an empty page (not an error) when no products are published', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          brands: { data: { id: 'brand-1' }, error: null },
          lanes: { data: { id: 'lane-1' }, error: null },
          products: { data: [], error: null },
        },
        calls,
      ),
    )

    const result = await listPublishedProducts({
      brandSlug: 'wings',
      laneSlug: 'provisions',
      limit: 50,
      cursor: null,
    })

    expect(result).toEqual({ ok: true, data: { items: [], nextCursor: null } })
  })

  it('returns LANE_NOT_FOUND when the lane does not resolve under the brand', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          brands: { data: { id: 'brand-1' }, error: null },
          lanes: { data: null, error: null },
        },
        calls,
      ),
    )

    const result = await listPublishedProducts({
      brandSlug: 'wings',
      laneSlug: 'nonexistent',
      limit: 50,
      cursor: null,
    })

    expect(result).toEqual({ ok: false, error: 'LANE_NOT_FOUND' })
  })
})
