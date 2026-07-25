// Pins the request shape the real AnthropicIntelligenceClient sends — the one-shot
// seam the Mister dock runs through in production. A stub SDK captures the create /
// stream body so we assert: adaptive thinking is DISABLED for a thinking-on-by-default
// model (else a tight max_tokens truncates the answer to empty), left untouched for a
// thinking-off model, and the vision path builds an image block before the text. This
// is the seam the orchestrator tests (intelligence.test.ts, fake client) never exercise.
import { describe, expect, it, vi } from 'vitest'
import type Anthropic from '@anthropic-ai/sdk'
import { AnthropicIntelligenceClient } from './client'

type CreateBody = { model: string; messages: unknown[]; thinking?: unknown; system?: string; max_tokens?: number }

/** A stub SDK: create() returns one text block; stream() yields two text deltas. */
function stubSdk(capture: { create?: CreateBody; stream?: CreateBody }) {
  return {
    messages: {
      create: vi.fn(async (body: CreateBody) => {
        capture.create = body
        return { content: [{ type: 'text', text: 'ok' }] }
      }),
      stream: vi.fn((body: CreateBody) => {
        capture.stream = body
        return (async function* () {
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'he' } }
          yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'llo' } }
        })()
      }),
    },
  } as unknown as Anthropic
}

describe('AnthropicIntelligenceClient request shape', () => {
  it('disables thinking for a thinking-on-by-default model and returns the text', async () => {
    const cap: { create?: CreateBody } = {}
    const client = new AnthropicIntelligenceClient(stubSdk(cap))
    const text = await client.complete({ model: 'claude-opus-5', system: 'S', user: 'hi', maxTokens: 500 })
    expect(text).toBe('ok')
    expect(cap.create?.thinking).toEqual({ type: 'disabled' })
  })

  it('leaves thinking unset for a thinking-off model', async () => {
    const cap: { create?: CreateBody } = {}
    const client = new AnthropicIntelligenceClient(stubSdk(cap))
    await client.complete({ model: 'claude-haiku-4-5-20251001', system: 'S', user: 'hi', maxTokens: 60 })
    expect(cap.create?.thinking).toBeUndefined()
  })

  it('sends an image block before the text on a vision turn', async () => {
    const cap: { create?: CreateBody } = {}
    const client = new AnthropicIntelligenceClient(stubSdk(cap))
    await client.complete({
      model: 'claude-opus-5',
      system: 'S',
      user: 'lee esto',
      maxTokens: 500,
      image: { mediaType: 'image/png', dataBase64: 'AAAA' },
    })
    const content = (cap.create?.messages[0] as { content: Array<{ type: string }> }).content
    expect(content[0].type).toBe('image')
    expect(content[1].type).toBe('text')
  })

  it('streams text deltas and disables thinking on the stream seam too', async () => {
    const cap: { stream?: CreateBody } = {}
    const client = new AnthropicIntelligenceClient(stubSdk(cap))
    let out = ''
    for await (const chunk of client.stream({ model: 'claude-opus-5', system: 'S', user: 'hi', maxTokens: 500 })) {
      out += chunk
    }
    expect(out).toBe('hello')
    expect(cap.stream?.thinking).toEqual({ type: 'disabled' })
  })
})
