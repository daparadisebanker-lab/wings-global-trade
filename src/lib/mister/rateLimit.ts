// src/lib/mister/rateLimit.ts
// Per-IP rate limiting via Upstash Redis.
// Fails open when Redis is unavailable (warns, proceeds).
// Authoritative: ENRICHED_SPEC §7.7, ai-engineer.md §7

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface LimiterPair {
  perMinute: Ratelimit
  perHour: Ratelimit
}

let _limiter: LimiterPair | null | undefined = undefined

function createLimiter(): LimiterPair | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const redis = new Redis({ url, token })
  return {
    perMinute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      prefix: 'mister:rl:ip:min',
    }),
    perHour: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(300, '1 h'),
      prefix: 'mister:rl:ip:hr',
    }),
  }
}

function getLimiter(): LimiterPair | null {
  if (_limiter === undefined) _limiter = createLimiter()
  return _limiter
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterMs?: number
}

/**
 * Check per-IP rate limits (20/min, 300/hr).
 * Returns allowed:true immediately when Redis is not configured (fail-open).
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getLimiter()
  if (!limiter) return { allowed: true }

  try {
    const [min, hr] = await Promise.all([
      limiter.perMinute.limit(ip),
      limiter.perHour.limit(ip),
    ])
    if (!min.success) return { allowed: false, retryAfterMs: min.reset - Date.now() }
    if (!hr.success) return { allowed: false, retryAfterMs: hr.reset - Date.now() }
    return { allowed: true }
  } catch (err) {
    console.warn('[mister/rate-limit] Redis error — failing open:', err)
    return { allowed: true }
  }
}

/**
 * Check tightened per-IP rate limits for flagged sessions (halved limits).
 */
export async function checkTightenedRateLimit(ip: string): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return { allowed: true }

  try {
    const redis = new Redis({ url, token })
    const tightened = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      prefix: 'mister:rl:ip:tight',
    })
    const result = await tightened.limit(ip)
    return result.success
      ? { allowed: true }
      : { allowed: false, retryAfterMs: result.reset - Date.now() }
  } catch {
    return { allowed: true }
  }
}
