// src/lib/ai/triage.ts
// (1) Triage orchestrator: inbound RFQ text → proposed lane + archetype + stage
// draft. Pure of the SDK — it takes an IntelligenceClient (real or fake) and the
// resolved candidate lanes, calls the model, and hands the raw text to the pure
// parser. The result is an AiDraft envelope; persistence + application are the
// route's / server action's job (Directive 7).
import { INTELLIGENCE_MODELS, type AiDraft, type TriagePayload } from './types'
import type { IntelligenceClient } from './client'
import { buildTriagePrompt, type TriagePromptAccount } from './prompts'
import { parseTriageDraft, type TriageLaneCandidate } from './parse'
import type { Archetype } from '@/lib/archetypes'

/** A lane offered as a triage target — carries both the display + resolution data. */
export interface TriageLane extends TriageLaneCandidate {
  laneName: string
}

export interface TriageContext {
  inboundText: string
  lanes: TriageLane[]
  accounts?: TriagePromptAccount[]
}

export async function runTriage(
  client: IntelligenceClient,
  ctx: TriageContext,
): Promise<AiDraft<TriagePayload>> {
  const { system, user } = buildTriagePrompt({
    inboundText: ctx.inboundText,
    lanes: ctx.lanes.map((l) => ({
      laneCode: l.laneCode,
      laneName: l.laneName,
      archetype: l.archetype as Archetype,
    })),
    accounts: ctx.accounts,
  })

  const text = await client.complete({
    model: INTELLIGENCE_MODELS.classify,
    system,
    user,
    maxTokens: 1024,
  })

  const parsed = parseTriageDraft(text, ctx.lanes)
  if (!parsed.ok) throw new Error(`triage parse failed: ${parsed.reason}`)

  return {
    draft: parsed.value.payload,
    confidence: parsed.value.confidence,
    model: INTELLIGENCE_MODELS.classify,
  }
}
