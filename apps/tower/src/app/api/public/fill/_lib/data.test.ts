import { describe, expect, it, vi, beforeEach } from 'vitest'

const { createServiceClient } = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createServiceClient }))

import { getContainerFillState } from './data'

type Call = { method: string; args: unknown[] }

/** Minimal fake of the supabase-js fluent query builder — same shape as the
 * public catalog's data.test.ts fake (Wave 2 precedent). */
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
        maybeSingle: () => resolve(),
        then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
          resolve().then(onFulfilled, onRejected),
      }
      return builder
    },
  }
}

describe('getContainerFillState', () => {
  let calls: Record<string, Call[]>

  beforeEach(() => {
    calls = {}
    vi.clearAllMocks()
  })

  it('returns fill state for a public container, summing only RESERVED/CONFIRMED/LOADED commitments', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          containers: {
            data: {
              id: 'container-1',
              code: 'WGT/02-C014',
              capacity_cbm: 40,
              status: 'FILLING',
              mode: 'SHARED',
              public_fill_visible: true,
            },
            error: null,
          },
          container_commitments: {
            data: [
              { cbm: 10, status: 'RESERVED' },
              { cbm: 5, status: 'CONFIRMED' },
            ],
            error: null,
          },
        },
        calls,
      ),
    )

    const result = await getContainerFillState('WGT/02-C014')

    expect(result).toEqual({
      ok: true,
      data: {
        code: 'WGT/02-C014',
        capacityCbm: 40,
        committedCbm: 15,
        fillPercent: 37.5,
        status: 'FILLING',
        mode: 'SHARED',
      },
    })

    // The public_fill_visible guard is present on the containers query.
    expect(calls.containers).toContainEqual({ method: 'select', args: expect.any(Array) })
    // The commitment status filter never widens to include RELEASED.
    expect(calls.container_commitments).toContainEqual({ method: 'in', args: ['status', ['RESERVED', 'CONFIRMED', 'LOADED']] })
  })

  it('NEVER returns fill state for a private container — same NOT_FOUND as a missing code', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          containers: {
            data: {
              id: 'container-2',
              code: 'WGT/02-C015',
              capacity_cbm: 40,
              status: 'FILLING',
              mode: 'DEDICATED',
              public_fill_visible: false,
            },
            error: null,
          },
        },
        calls,
      ),
    )

    const result = await getContainerFillState('WGT/02-C015')
    expect(result).toEqual({ ok: false, error: 'NOT_FOUND' })
    // Must not have proceeded to query commitments for a private container.
    expect(calls.container_commitments).toBeUndefined()
  })

  it('returns NOT_FOUND (indistinguishable from private) when the code does not resolve', async () => {
    createServiceClient.mockReturnValue(fakeSupabase({ containers: { data: null, error: null } }, calls))

    const result = await getContainerFillState('NONEXISTENT')
    expect(result).toEqual({ ok: false, error: 'NOT_FOUND' })
  })

  it('returns UNAVAILABLE (never throws) when Supabase env is not configured', async () => {
    createServiceClient.mockReturnValue(null)

    const result = await getContainerFillState('WGT/02-C014')
    expect(result).toEqual({ ok: false, error: 'UNAVAILABLE' })
  })

  it('returns UNAVAILABLE on a backend error reading commitments (never a partial/zero fill state)', async () => {
    createServiceClient.mockReturnValue(
      fakeSupabase(
        {
          containers: {
            data: {
              id: 'container-1',
              code: 'WGT/02-C014',
              capacity_cbm: 40,
              status: 'FILLING',
              mode: 'SHARED',
              public_fill_visible: true,
            },
            error: null,
          },
          container_commitments: { data: null, error: { message: 'boom' } },
        },
        calls,
      ),
    )

    const result = await getContainerFillState('WGT/02-C014')
    expect(result).toEqual({ ok: false, error: 'UNAVAILABLE' })
  })
})
