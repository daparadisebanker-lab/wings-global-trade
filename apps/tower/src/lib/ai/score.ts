// src/lib/ai/score.ts
// (2) Lead-score orchestrator: account signals → 0–100 draft score by archetype
// behaviour, with the factors behind it. haiku (classify tier). The score lands
// as a draft; it never writes accounts.score directly — approveLeadScore does,
// as a human action.
import { INTELLIGENCE_MODELS, type AiDraft, type LeadScorePayload } from './types'
import type { IntelligenceClient } from './client'
import { buildLeadScorePrompt } from './prompts'
import { parseLeadScoreDraft } from './parse'
import type { Archetype } from '@/lib/archetypes'

export interface LeadScoreContext {
  archetype: Archetype
  account: { name: string; country?: string | null; region?: string | null }
  /** Rollups + pipeline history rendered to text (dashboards query rollups, not raw events). */
  signals: string
}

export async function runLeadScore(
  client: IntelligenceClient,
  ctx: LeadScoreContext,
): Promise<AiDraft<LeadScorePayload>> {
  const { system, user } = buildLeadScorePrompt(ctx)

  const text = await client.complete({
    model: INTELLIGENCE_MODELS.classify,
    system,
    user,
    maxTokens: 1024,
  })

  const parsed = parseLeadScoreDraft(text)
  if (!parsed.ok) throw new Error(`lead-score parse failed: ${parsed.reason}`)

  return {
    draft: parsed.value.payload,
    confidence: parsed.value.confidence,
    model: INTELLIGENCE_MODELS.classify,
  }
}
