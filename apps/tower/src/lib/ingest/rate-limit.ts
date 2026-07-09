// src/lib/ingest/rate-limit.ts
// Per-session_hash rate limiting for POST /api/ingest (API_MAP: "Rate-limited
// per session_hash"; error code RATE_LIMITED). A fixed-window counter in
// process memory.
//
// ⚠ FLAG (Conductor): this is a single-instance limiter. On Vercel's serverless
// fleet each lambda has its own memory, so the effective limit scales with the
// instance count — fine as a floor / abuse brake, NOT a hard global cap. The
// documented upgrade path is a shared store (Upstash Redis / Supabase) keyed the
// same way; this module's `checkRateLimit` signature is the seam to swap behind.
export interface RateLimitConfig {
  /** Max events per window per key. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

export const DEFAULT_INGEST_RATE_LIMIT: RateLimitConfig = {
  limit: 60,
  windowMs: 60_000, // 60 events / minute / session_hash
}

interface Bucket {
  count: number
  resetAt: number
}

// Module-level so it survives across requests on a warm instance.
const buckets = new Map<string, Bucket>()

// Bound memory: opportunistically evict expired buckets when the map grows.
const MAX_TRACKED_KEYS = 10_000

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  /** Seconds until the window resets — surfaced as Retry-After on a 429. */
  retryAfterSeconds: number
}

/**
 * Count one event against `key` (brand + session_hash). Returns whether it's
 * allowed and, when throttled, how long until the window resets. Pure-ish:
 * mutates the module bucket map, takes `now` for deterministic tests.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_INGEST_RATE_LIMIT,
  now: number = Date.now(),
): RateLimitResult {
  if (buckets.size > MAX_TRACKED_KEYS) sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= config.limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

/** Test seam — clears all buckets. */
export function __resetRateLimit(): void {
  buckets.clear()
}
