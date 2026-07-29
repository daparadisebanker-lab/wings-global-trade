import { describe, it, expect, vi } from 'vitest'
import {
  backoffMs,
  classifyError,
  isRetryable,
  resilient,
  retryAfterMs,
  DeadlineExceededError,
  MAX_RETRIES,
  type CallOutcome,
} from './resilience'
import type { CompletionRequest, IntelligenceClient } from './client'

/** An SDK-shaped error: the real one carries `status`. */
function apiError(status: number, headers?: Record<string, string>): Error & { status: number } {
  return Object.assign(new Error(`HTTP ${status}`), { status, headers })
}

/** A client that replays a script of outcomes and records the requests it saw. */
function scripted(script: (string | Error)[]): IntelligenceClient & { seen: CompletionRequest[] } {
  const seen: CompletionRequest[] = []
  return {
    seen,
    async complete(req) {
      seen.push(req)
      const next = script.shift()
      if (next instanceof Error) throw next
      return next ?? 'ok'
    },
    async *stream() {
      yield ''
    },
  }
}

const REQ: CompletionRequest = { model: 'claude-opus-5', system: 'S', user: 'u', maxTokens: 100 }

describe('classifyError', () => {
  it('labels the failures that matter under load', () => {
    expect(classifyError(apiError(429))).toBe('rate_limit')
    expect(classifyError(apiError(529))).toBe('overloaded')
    expect(classifyError(apiError(500))).toBe('server')
    expect(classifyError(apiError(503))).toBe('server')
    expect(classifyError(apiError(401))).toBe('auth')
    expect(classifyError(apiError(403))).toBe('auth')
    expect(classifyError(apiError(400))).toBe('bad_request')
    expect(classifyError(apiError(413))).toBe('bad_request')
  })

  it('recognises a timeout by name or message, however it is thrown', () => {
    expect(classifyError(Object.assign(new Error('x'), { name: 'AbortError' }))).toBe('timeout')
    expect(classifyError(new Error('Request timed out'))).toBe('timeout')
    expect(classifyError(new DeadlineExceededError())).toBe('timeout')
  })

  it('recognises transport failures', () => {
    expect(classifyError(new Error('fetch failed'))).toBe('network')
    expect(classifyError(new Error('socket hang up'))).toBe('network')
  })

  it('never throws, and does not guess', () => {
    expect(classifyError(undefined)).toBe('unknown')
    expect(classifyError(null)).toBe('unknown')
    expect(classifyError('a string')).toBe('unknown')
    expect(classifyError({})).toBe('unknown')
  })
})

describe('isRetryable', () => {
  it('retries the transient classes', () => {
    for (const c of ['rate_limit', 'overloaded', 'server', 'network'] as const) {
      expect(isRetryable(c), c).toBe(true)
    }
  })

  it('NEVER retries a timeout — retrying a hang is what the maxRetries:0 rule forbids', () => {
    expect(isRetryable('timeout')).toBe(false)
  })

  it('does not retry what retrying cannot fix', () => {
    for (const c of ['auth', 'bad_request', 'unknown'] as const) expect(isRetryable(c), c).toBe(false)
  })
})

describe('backoffMs', () => {
  it('grows exponentially and is bounded', () => {
    const max = (a: number) => backoffMs(a, undefined, () => 1)
    expect(max(0)).toBe(500)
    expect(max(1)).toBe(1000)
    expect(max(2)).toBe(2000)
    expect(max(10)).toBeLessThanOrEqual(8000) // capped
  })

  it('applies FULL jitter, so a retry storm spreads instead of marching in lockstep', () => {
    expect(backoffMs(2, undefined, () => 0)).toBe(0)
    expect(backoffMs(2, undefined, () => 0.5)).toBe(1000)
    expect(backoffMs(2, undefined, () => 1)).toBe(2000)
  })

  it('obeys a server-sent retry-after over its own curve', () => {
    expect(backoffMs(0, 3000, () => 1)).toBe(3000)
    expect(backoffMs(0, 999_999, () => 1)).toBe(8000) // still capped
  })

  it('reads retry-after off an error, in either shape', () => {
    expect(retryAfterMs(apiError(429, { 'retry-after': '2' }))).toBe(2000)
    expect(retryAfterMs(apiError(429))).toBeUndefined()
    expect(retryAfterMs(new Error('x'))).toBeUndefined()
  })
})

describe('resilient — retries', () => {
  const clock = (start = 0) => {
    let t = start
    return { now: () => t, sleep: async (ms: number) => void (t += ms), advance: (ms: number) => void (t += ms) }
  }

  it('absorbs a rate limit the operator never sees', async () => {
    const c = clock()
    const inner = scripted([apiError(429), 'the answer'])
    const outcomes: CallOutcome[] = []
    const client = resilient(inner, {
      deadlineAt: 38_000,
      now: c.now,
      sleep: c.sleep,
      rand: () => 0.5,
      onOutcome: (o) => outcomes.push(o),
    })

    await expect(client.complete(REQ)).resolves.toBe('the answer')
    expect(outcomes).toEqual([expect.objectContaining({ ok: true, attempts: 2 })])
  })

  it('gives up after MAX_RETRIES and reports the class', async () => {
    const c = clock()
    const inner = scripted([apiError(429), apiError(429), apiError(429)])
    const outcomes: CallOutcome[] = []
    const client = resilient(inner, {
      deadlineAt: 38_000,
      now: c.now,
      sleep: c.sleep,
      rand: () => 0,
      onOutcome: (o) => outcomes.push(o),
    })

    await expect(client.complete(REQ)).rejects.toThrow()
    expect(inner.seen).toHaveLength(MAX_RETRIES + 1)
    expect(outcomes[0]).toMatchObject({ ok: false, failure: 'rate_limit', attempts: MAX_RETRIES + 1 })
  })

  it('does not retry a timeout — one attempt, straight out', async () => {
    const c = clock()
    const inner = scripted([Object.assign(new Error('timed out'), { name: 'AbortError' })])
    const client = resilient(inner, { deadlineAt: 38_000, now: c.now, sleep: c.sleep })
    await expect(client.complete(REQ)).rejects.toThrow()
    expect(inner.seen).toHaveLength(1)
  })

  it('does not retry a bad payload — retrying cannot fix it', async () => {
    const c = clock()
    const inner = scripted([apiError(400)])
    const client = resilient(inner, { deadlineAt: 38_000, now: c.now, sleep: c.sleep })
    await expect(client.complete(REQ)).rejects.toThrow()
    expect(inner.seen).toHaveLength(1)
  })
})

describe('resilient — the shared budget', () => {
  it('passes the REMAINING budget to each call, never a fresh ceiling', async () => {
    let t = 0
    const inner = scripted(['a', 'b'])
    const client = resilient(inner, { deadlineAt: 38_000, now: () => t, sleep: async () => {} })

    await client.complete(REQ)
    t = 30_000 // a slow first call ate most of the ask
    await client.complete(REQ)

    expect(inner.seen[0].budgetMs).toBe(38_000)
    expect(inner.seen[1].budgetMs).toBe(8_000) // what is LEFT, not another 38s
  })

  it('refuses to start a call that cannot finish inside the budget', async () => {
    const inner = scripted(['never reached'])
    const client = resilient(inner, { deadlineAt: 1_000, now: () => 500, sleep: async () => {} })
    await expect(client.complete(REQ)).rejects.toBeInstanceOf(DeadlineExceededError)
    expect(inner.seen).toHaveLength(0) // no capacity spent on a doomed call
  })

  it('will not sleep past the deadline just to retry', async () => {
    let t = 0
    const inner = scripted([apiError(429, { 'retry-after': '30' }), 'unreachable'])
    const client = resilient(inner, {
      deadlineAt: 5_000, // only 5s left; the server asked for 30
      now: () => t,
      sleep: async (ms) => void (t += ms),
    })
    await expect(client.complete(REQ)).rejects.toThrow()
    expect(inner.seen).toHaveLength(1)
  })

  it('surfaces the underlying error, not a generic one, when the budget runs out mid-retry', async () => {
    let t = 0
    const inner = scripted([apiError(429), apiError(429)])
    const client = resilient(inner, {
      deadlineAt: 20_000,
      now: () => t,
      sleep: async (ms) => void (t += ms + 9_000), // each wait eats the budget
      rand: () => 1,
    })
    await expect(client.complete(REQ)).rejects.toMatchObject({ status: 429 })
  })

  it('leaves streaming untouched — it is not on this path', async () => {
    const inner = scripted([])
    const spy = vi.spyOn(inner, 'stream')
    const client = resilient(inner, { deadlineAt: 38_000 })
    for await (const _ of client.stream(REQ)) void _
    expect(spy).toHaveBeenCalled()
  })
})
