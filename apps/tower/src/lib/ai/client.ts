// src/lib/ai/client.ts
// The thin Claude wrapper. Server-only — ANTHROPIC_API_KEY is read here and
// nowhere a client bundle can reach it. Orchestrators depend on the small
// `IntelligenceClient` interface, NOT the SDK, so a fake client drives them in
// tests and no raw SDK/model error can leak past this boundary.
//
// Server-only by convention (never import into a client component) — matches
// lib/supabase/server.ts, which guards with a comment rather than a `server-only`
// dependency this workspace does not carry.
import Anthropic from '@anthropic-ai/sdk'
import { THINKING_ON_BY_DEFAULT, type IntelligenceModel } from './types'

/** Attach `thinking: { disabled }` for a thinking-on-by-default model, in a shape
 *  the pinned SDK's params type predates (runtime-only key; sent on the wire). Left
 *  on, a one-shot JSON extraction with a tight max_tokens (our capabilities pass
 *  500–1100) can spend the whole budget thinking and return an EMPTY answer — Mister
 *  then silently fails. These calls are deterministic extraction/classification, so
 *  the full budget goes to the structured answer. (Model list: THINKING_ON_BY_DEFAULT.) */
function withThinkingOff<T extends object>(params: T, model: string): T {
  if (THINKING_ON_BY_DEFAULT.has(model)) (params as Record<string, unknown>).thinking = { type: 'disabled' }
  return params
}

/** Prompt caching needs a minimum prompt length to be accepted at all, and below
 *  roughly this size the saving would not pay for the cache write anyway. Short
 *  system prompts are sent plain. */
const MIN_CACHEABLE_SYSTEM_CHARS = 2_000

/** Build the `system` field: a plain string, or — for a byte-identical prompt big
 *  enough to be worth it — a single text block marked cacheable. Under load the
 *  Mister router sends the SAME ~1k-token capability list on every ask; caching it
 *  cuts that from full price per ask to one write per window, which is headroom
 *  against the org's token-per-minute ceiling, not just a smaller bill. */
function systemField(system: string, cacheSystem: boolean | undefined): unknown {
  if (!cacheSystem || system.length < MIN_CACHEABLE_SYSTEM_CHARS) return system
  return [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
}

/** Per-request ceiling so a hung or slow Anthropic call fails fast with a clean
 *  thrown error instead of inheriting the SDK's ~10-minute default — which would
 *  hang the caller (e.g. the Mister dock's server action) with no recovery. Kept
 *  under the dock's 45s client-side watchdog so the server surfaces a typed error
 *  before the UI gives up. The SDK is built with maxRetries: 0 (see below) so this
 *  IS the worst-case wall clock — with the SDK's default 2 retries a timed-out call
 *  would be re-tried up to 3× (~120s), blowing straight past the 45s watchdog and
 *  making this invariant false in exactly the hang it guards against. */
const REQUEST_TIMEOUT_MS = 40_000

/** A base64 image attached to a completion — the supplier-screenshot vision path. */
export interface ImageInput {
  /** e.g. 'image/png', 'image/jpeg', 'image/webp', 'image/gif'. */
  mediaType: string
  /** Raw base64 (no data: URI prefix). */
  dataBase64: string
}

export interface CompletionRequest {
  model: IntelligenceModel
  system: string
  /** The single user turn — Intelligence calls are one-shot classify/extract, not chat. */
  user: string
  maxTokens: number
  /** Optional image for a vision turn (supplier screenshots). Ignored by `stream`. */
  image?: ImageInput
  /**
   * Milliseconds this call may take, injected by the resilience wrapper as what
   * REMAINS of the whole ask's budget (lib/ai/resilience.ts). Absent → the
   * standard per-request ceiling. Capped at REQUEST_TIMEOUT_MS either way, so a
   * caller can shrink the budget but never extend it.
   */
  budgetMs?: number
  /**
   * Mark the system prompt as cacheable. Set it for a prompt that is BYTE-
   * IDENTICAL across calls — the router's capability list, a capability's
   * extraction schema. Under load this is the difference between paying full
   * input price on every ask and paying it once per cache window, which raises
   * how far the org's token-per-minute ceiling stretches. Never set it on a
   * prompt that interpolates per-ask data: that would write a new cache entry
   * every time and cost more than not caching.
   */
  cacheSystem?: boolean
}

/**
 * The seam every orchestrator talks to. `complete` buffers a full response;
 * `stream` yields text chunks for responses likely to exceed ~2s (spec-extract).
 * Both surface a clean thrown Error on failure — callers translate to a typed
 * error code; a raw Anthropic error never reaches the client.
 */
export interface IntelligenceClient {
  complete(req: CompletionRequest): Promise<string>
  stream(req: CompletionRequest): AsyncIterable<string>
}

// Exported for a focused unit test (a stub SDK asserts the request shape — that
// thinking is disabled for a thinking-on model and absent otherwise); production
// still constructs it only through getIntelligenceClient() below.
export class AnthropicIntelligenceClient implements IntelligenceClient {
  constructor(private readonly sdk: Anthropic) {}

  async complete(req: CompletionRequest): Promise<string> {
    // A vision turn sends an image block before the text; a text turn keeps the
    // plain-string content the rest of Intelligence relies on.
    const content = req.image
      ? ([
          {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: req.image.mediaType as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif',
              data: req.image.dataBase64,
            },
          },
          { type: 'text' as const, text: req.user },
        ])
      : req.user
    // A caller-supplied budget may only SHRINK the ceiling, never extend it — the
    // 40s invariant against the dock's 45s watchdog has to survive any caller.
    const timeout =
      typeof req.budgetMs === 'number' && Number.isFinite(req.budgetMs)
        ? Math.max(1, Math.min(REQUEST_TIMEOUT_MS, Math.floor(req.budgetMs)))
        : REQUEST_TIMEOUT_MS
    const params = withThinkingOff(
      {
        model: req.model,
        max_tokens: req.maxTokens,
        // Keep the plain string here so the SDK's NON-streaming overload resolves;
        // the cacheable block form is assigned below, like `thinking`.
        system: req.system,
        // `as const` — without the contextual typing the inline call used to give
        // it, `role` widens to string and stops matching MessageParam.
        messages: [{ role: 'user' as const, content }],
      },
      req.model,
    )
    const sys = systemField(req.system, req.cacheSystem)
    if (typeof sys !== 'string') (params as Record<string, unknown>).system = sys
    const res = await this.sdk.messages.create(params, { timeout })
    let text = ''
    for (const block of res.content) {
      if (block.type === 'text') text += block.text
    }
    return text
  }

  async *stream(req: CompletionRequest): AsyncIterable<string> {
    const stream = this.sdk.messages.stream(
      withThinkingOff(
        {
          model: req.model,
          max_tokens: req.maxTokens,
          system: req.system,
          messages: [{ role: 'user', content: req.user }],
        },
        req.model,
      ),
      { timeout: REQUEST_TIMEOUT_MS },
    )
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  }
}

let cached: IntelligenceClient | null = null

/**
 * The RLS-independent model client. Returns null when ANTHROPIC_API_KEY is
 * absent so routes/actions degrade to a typed AI_UNAVAILABLE rather than
 * throwing — mirrors createServerSupabase()'s null-on-missing-env contract.
 */
export function getIntelligenceClient(): IntelligenceClient | null {
  if (cached) return cached
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  // maxRetries: 0 — a timeout must fail once, not be silently re-tried 3× past the
  // dock's 45s watchdog (see REQUEST_TIMEOUT_MS). A transient failure surfaces as a
  // typed AI error the caller degrades gracefully, which is what we want here.
  cached = new AnthropicIntelligenceClient(new Anthropic({ apiKey, maxRetries: 0 }))
  return cached
}

export function isIntelligenceConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}
