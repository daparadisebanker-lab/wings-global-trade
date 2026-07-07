// src/lib/ai/brief.ts
// (4) Weekly lane brief orchestrator: a lane's rollups + pipeline snapshot →
// a Markdown draft digest. sonnet (reason tier). Also scheduled weekly via n8n
// (API_MAP). The brief is prose the director edits before use — approval marks it
// APPROVED; it is never auto-published anywhere.
import {
  INTELLIGENCE_MODELS,
  type AiDraft,
  type WeeklyBriefPayload,
} from './types'
import type { IntelligenceClient } from './client'
import { buildWeeklyBriefPrompt } from './prompts'
import { parseWeeklyBriefDraft, WEEKLY_BRIEF_CONFIDENCE } from './parse'
import type { Archetype } from '@/lib/archetypes'

export interface WeeklyBriefContext {
  laneId: string
  laneName: string
  archetype: Archetype
  /** ISO week key, e.g. '2026-W28'. */
  week: string
  rollupsSummary: string
  pipelineSummary: string
}

export async function runWeeklyBrief(
  client: IntelligenceClient,
  ctx: WeeklyBriefContext,
): Promise<AiDraft<WeeklyBriefPayload>> {
  const { system, user } = buildWeeklyBriefPrompt({
    laneName: ctx.laneName,
    archetype: ctx.archetype,
    week: ctx.week,
    rollupsSummary: ctx.rollupsSummary,
    pipelineSummary: ctx.pipelineSummary,
  })

  const text = await client.complete({
    model: INTELLIGENCE_MODELS.reason,
    system,
    user,
    maxTokens: 2048,
  })

  const parsed = parseWeeklyBriefDraft(text)
  if (!parsed.ok) throw new Error(`weekly-brief parse failed: ${parsed.reason}`)

  const payload: WeeklyBriefPayload = {
    laneId: ctx.laneId,
    week: ctx.week,
    markdown: parsed.value.markdown,
    highlights: parsed.value.highlights,
  }
  return { draft: payload, confidence: WEEKLY_BRIEF_CONFIDENCE, model: INTELLIGENCE_MODELS.reason }
}
