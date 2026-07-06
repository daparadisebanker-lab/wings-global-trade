// src/lib/mister/client.ts
// Anthropic client singleton for the Mister v2 AI layer.
// Server-side only — never import into client components.

import Anthropic from '@anthropic-ai/sdk'

export const MISTER_MODEL = process.env.MISTER_MODEL ?? 'claude-sonnet-4-6'
export const MISTER_EXTRACT_MODEL = 'claude-haiku-4-5-20251001'

let _client: Anthropic | null = null

export function getMisterClient(): Anthropic | null {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  _client = new Anthropic({ apiKey })
  return _client
}

export function isMisterConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}
