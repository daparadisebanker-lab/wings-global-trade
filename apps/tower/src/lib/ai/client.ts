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
import type { IntelligenceModel } from './types'

/** Models where ADAPTIVE THINKING is ON by default. Left on, a one-shot JSON
 *  extraction with a tight max_tokens (our capabilities pass 500–1100) can spend
 *  the whole budget thinking and return an EMPTY answer — Mister then silently
 *  fails. These calls are deterministic extraction/classification, not reasoning,
 *  so we disable thinking and hand the full budget to the structured answer.
 *  (Haiku is thinking-off by default, so it's absent here.) */
const THINKS_BY_DEFAULT: ReadonlySet<string> = new Set([
  'claude-opus-5',
  'claude-opus-4-8',
  'claude-opus-4-7',
  'claude-sonnet-5',
])

/** Attach `thinking: { disabled }` for a thinking-on-by-default model, in a shape
 *  the pinned SDK's params type predates (runtime-only key; sent on the wire). */
function withThinkingOff<T extends object>(params: T, model: string): T {
  if (THINKS_BY_DEFAULT.has(model)) (params as Record<string, unknown>).thinking = { type: 'disabled' }
  return params
}

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

class AnthropicIntelligenceClient implements IntelligenceClient {
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
    const res = await this.sdk.messages.create(
      withThinkingOff(
        {
          model: req.model,
          max_tokens: req.maxTokens,
          system: req.system,
          messages: [{ role: 'user', content }],
        },
        req.model,
      ),
    )
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
  cached = new AnthropicIntelligenceClient(new Anthropic({ apiKey }))
  return cached
}

export function isIntelligenceConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}
