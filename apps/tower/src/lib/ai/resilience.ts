// Load hardening for the model seam — the Mister ask path is the product's main
// workflow, so it has to degrade under concurrency instead of failing.
//
// Three things bite when many operators ask at once, and all three used to
// surface to the operator as the same dead end:
//
//  1. RATE LIMITS. The Anthropic org has RPM/TPM ceilings. At load a share of
//     calls come back 429 (or 529 overloaded) — transient, and the correct
//     response is to wait and retry. The SDK was built with `maxRetries: 0`, so
//     every one of them failed immediately. That was a deliberate choice (see
//     client.ts) to stop TIMEOUTS being retried past the dock's watchdog — but it
//     threw out rate-limit recovery with it. The fix is to retry by FAILURE CLASS
//     rather than all-or-nothing: 429/529/5xx/network yes, timeouts never.
//
//  2. NO SHARED BUDGET. One ask makes up to two model calls, each previously
//     allowed the full 40s, behind a 45s client watchdog. Two slow calls could
//     burn 80s of server capacity for an answer nobody was still waiting for —
//     wasting exactly the capacity that is scarce under load. Now one deadline
//     covers the whole ask and each call gets what is left of it.
//
//  3. INVISIBLE FAILURES. `console.error(err)` cannot tell you whether you are
//     rate-limited, timing out, or misrouting. classifyError gives every failure
//     a stable label to log and alert on.
//
// Everything here is pure or clock-injected, so the retry and budget behaviour is
// unit-tested without a network.

import type { CompletionRequest, IntelligenceClient } from './client'

/** Stable failure labels — for retry decisions and for logs you can aggregate. */
export type FailureClass =
  | 'rate_limit' // 429 — org RPM/TPM ceiling; the load signal
  | 'overloaded' // 529 — Anthropic capacity
  | 'server' // 5xx
  | 'network' // connection reset/DNS
  | 'timeout' // our own deadline — NEVER retried
  | 'auth' // 401/403 — a key problem; retrying cannot help
  | 'bad_request' // 400/413/422 — our payload is wrong; retrying cannot help
  | 'unknown'

/** Read a numeric HTTP status off an SDK error without depending on SDK types
 *  (the pinned SDK's error classes have moved between versions). */
function statusOf(err: unknown): number | undefined {
  const e = err as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } }
  for (const v of [e?.status, e?.statusCode, e?.response?.status]) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return undefined
}

/** Classify a thrown model error. Never throws — an unrecognisable failure is
 *  'unknown', which is NOT retried (we only retry what we understand). */
export function classifyError(err: unknown): FailureClass {
  const status = statusOf(err)
  if (status === 429) return 'rate_limit'
  if (status === 529) return 'overloaded'
  if (status === 401 || status === 403) return 'auth'
  if (status === 400 || status === 413 || status === 422) return 'bad_request'
  if (typeof status === 'number' && status >= 500) return 'server'

  const name = String((err as { name?: unknown })?.name ?? '')
  const message = String((err as { message?: unknown })?.message ?? '').toLowerCase()
  // Our own AbortError/timeout, or the SDK's connection-timeout class.
  if (name === 'AbortError' || /timeout|timed out|aborted/.test(name.toLowerCase() + ' ' + message)) return 'timeout'
  if (/econnreset|enotfound|econnrefused|socket hang up|fetch failed|network/.test(message)) return 'network'
  return 'unknown'
}

/**
 * Should this class be retried?
 *
 * TIMEOUT IS DELIBERATELY ABSENT. Retrying a timeout is what the `maxRetries: 0`
 * decision in client.ts exists to prevent: a hung call re-tried would blow past
 * the dock's watchdog and strand the operator, which is the exact failure that
 * guard was added for. Under load a timeout also means the system is already
 * saturated — retrying adds load to a system that is failing from load.
 */
export function isRetryable(cls: FailureClass): boolean {
  return cls === 'rate_limit' || cls === 'overloaded' || cls === 'server' || cls === 'network'
}

/** Honour a server-sent `retry-after` (seconds) when present — the API telling us
 *  exactly how long to wait beats any backoff curve we invent. */
export function retryAfterMs(err: unknown): number | undefined {
  const e = err as { headers?: Record<string, unknown>; response?: { headers?: { get?: (k: string) => string | null } } }
  const raw =
    (typeof e?.headers?.['retry-after'] === 'string' ? (e.headers['retry-after'] as string) : undefined) ??
    e?.response?.headers?.get?.('retry-after') ??
    undefined
  if (!raw) return undefined
  const seconds = Number(raw)
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : undefined
}

/** Base delay per attempt (exponential), before jitter. */
const BASE_BACKOFF_MS = 500
/** Ceiling on one wait — beyond this the deadline is better spent answering. */
const MAX_BACKOFF_MS = 8_000

/**
 * Exponential backoff with FULL jitter. Jitter is not decoration here: under load
 * every client fails at the same instant, and a fixed curve marches them back in
 * lockstep to collide again. Full jitter spreads the retry storm out, which is
 * the difference between recovering and oscillating.
 */
export function backoffMs(attempt: number, retryAfter?: number, rand: () => number = Math.random): number {
  if (typeof retryAfter === 'number' && retryAfter >= 0) return Math.min(retryAfter, MAX_BACKOFF_MS)
  const ceiling = Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempt), MAX_BACKOFF_MS)
  return Math.round(rand() * ceiling)
}

/** Attempts per call (1 initial + up to this many retries), on top of which the
 *  deadline is the real limiter — whichever runs out first wins. */
export const MAX_RETRIES = 2

/** What a resilient wrapper reports about a call, for structured logging. */
export interface CallOutcome {
  ok: boolean
  attempts: number
  durationMs: number
  failure?: FailureClass
}

export interface ResilienceOptions {
  /** Absolute epoch-ms the WHOLE ask must finish by — shared across its calls. */
  deadlineAt: number
  /** Injected for tests. */
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  rand?: () => number
  /** Called once per completed call (success or final failure). */
  onOutcome?: (outcome: CallOutcome) => void
}

/** Thrown when the ask's shared budget is gone. Classified as 'timeout', so it is
 *  never retried and the caller degrades gracefully. */
export class DeadlineExceededError extends Error {
  readonly name = 'AbortError'
  constructor(message = 'Mister deadline exceeded') {
    super(message)
  }
}

/** Below this there is no point starting another model call — it cannot finish. */
const MIN_USEFUL_BUDGET_MS = 1_500

/**
 * Wrap a client so every call it makes shares ONE deadline and retries only the
 * failures worth retrying.
 *
 * Wrapping the seam rather than editing call sites is what makes this free: the
 * capabilities call `client.complete` exactly as before and inherit the budget
 * and the retries without a single signature change.
 */
export function resilient(inner: IntelligenceClient, opts: ResilienceOptions): IntelligenceClient {
  const now = opts.now ?? (() => Date.now())
  const sleep = opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)))
  const rand = opts.rand ?? Math.random

  return {
    async complete(req: CompletionRequest): Promise<string> {
      const started = now()
      let attempts = 0
      let lastError: unknown

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const remaining = opts.deadlineAt - now()
        if (remaining < MIN_USEFUL_BUDGET_MS) {
          const err = lastError ?? new DeadlineExceededError()
          opts.onOutcome?.({
            ok: false,
            attempts,
            durationMs: now() - started,
            failure: classifyError(err),
          })
          throw err
        }

        attempts += 1
        try {
          // Each call gets what is LEFT of the ask's budget, never a fresh 40s.
          const text = await inner.complete({ ...req, budgetMs: remaining })
          opts.onOutcome?.({ ok: true, attempts, durationMs: now() - started })
          return text
        } catch (err) {
          lastError = err
          const cls = classifyError(err)
          const canRetry = isRetryable(cls) && attempt < MAX_RETRIES
          if (!canRetry) {
            opts.onOutcome?.({ ok: false, attempts, durationMs: now() - started, failure: cls })
            throw err
          }
          const wait = backoffMs(attempt, retryAfterMs(err), rand)
          // Only sleep if the answer could still land after waiting.
          if (opts.deadlineAt - now() - wait < MIN_USEFUL_BUDGET_MS) {
            opts.onOutcome?.({ ok: false, attempts, durationMs: now() - started, failure: cls })
            throw err
          }
          await sleep(wait)
        }
      }
      /* istanbul ignore next — the loop always returns or throws */
      throw lastError ?? new DeadlineExceededError()
    },

    // Streaming is not on the dock's path; pass it through untouched rather than
    // pretending to give it semantics this wrapper has not been designed for.
    stream: (req: CompletionRequest) => inner.stream(req),
  }
}
