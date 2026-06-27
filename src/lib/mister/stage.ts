// src/lib/mister/stage.ts
// Stage inference and async collected-field extraction.
// Authoritative: ai-engineer.md §4 (stage transition + extractCollected)

import type { MisterArchetype, MisterStage, MisterCollected } from '@/types/mister'
import { MISTER_EXTRACT_MODEL, getMisterClient } from '@/lib/mister/client'

// ─────────────────────────────────────────────────────────────
// Stage inference (server-side, no model cooperation needed)
// ─────────────────────────────────────────────────────────────
const STAGE_ORDER: MisterStage[] = [
  'induction',
  'discovery',
  'consideration',
  'pre_qualification',
  'support',
]

/**
 * Infer the next stage from archetype + collected state.
 * Stage never regresses. Support is only entered by explicit escalation.
 */
export function inferStage(
  archetype: MisterArchetype,
  collected: MisterCollected,
  currentStage: MisterStage,
): MisterStage {
  const currentIdx = STAGE_ORDER.indexOf(currentStage)

  if (archetype === 'unresolved') return 'induction'

  // Resolved archetype → at least discovery
  let inferred = Math.max(currentIdx, 1)

  // 3+ collected fields signals consideration
  const filledFields = Object.values(collected).filter(
    (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true),
  ).length
  if (filledFields >= 3) inferred = Math.max(inferred, 2) // consideration

  // Has destination + (timeline or RUC) → pre_qualification
  if (collected.destinationCountry && (collected.timeline || collected.ruc)) {
    inferred = Math.max(inferred, 3) // pre_qualification
  }

  // Support is only entered by escalation events — do not auto-advance.
  return STAGE_ORDER[inferred] ?? 'discovery'
}

// ─────────────────────────────────────────────────────────────
// Async collected-field extraction via Haiku
// ─────────────────────────────────────────────────────────────

export interface ExtractCollectedResult extends Partial<MisterCollected> {
  archetypeSignal?: MisterArchetype | null
}

/**
 * Extract trade data from a conversation exchange using claude-haiku (fast, cheap).
 * Called fire-and-forget after the main stream closes.
 * Returns only newly learnable fields; merges into existing collected on the caller side.
 */
export async function extractCollected(
  assistantResponse: string,
  userMessage: string,
  currentCollected: MisterCollected,
): Promise<ExtractCollectedResult> {
  const client = getMisterClient()
  if (!client) return {}

  try {
    const result = await client.messages.create({
      model: MISTER_EXTRACT_MODEL,
      max_tokens: 300,
      system: `Extract trade import data from a conversation exchange. Return ONLY a JSON object with fields you can confidently identify. Include:
- destinationCountry: string (country name)
- destinationCity: string
- incoterm: EXW|FOB|CFR|CIF|DAP|DDP
- containerType: 20GP|40GP|40HC|reefer|LCL
- volume: string (quantity or container count)
- ruc: string (tax ID number)
- timeline: string (delivery timeline)
- productInterest: string[] (product names or slugs mentioned)
- budgetBand: string
- archetypeSignal: lead_buyer|project_manager|logistics_manager|reseller|wholesale_partner|null

Rules:
- Only return fields with HIGH confidence from explicit user statements.
- Never infer or guess — if not explicitly stated, omit the field.
- Return {} if nothing new can be extracted.
- archetypeSignal: only if the user explicitly identifies their role.
- Current known values (do not re-extract): ${JSON.stringify(currentCollected)}`,
      messages: [
        {
          role: 'user',
          content: `User said: "${userMessage.slice(0, 500)}"\nMister replied: "${assistantResponse.slice(0, 600)}"`,
        },
      ],
    })

    const text = result.content[0]
    if (text.type !== 'text') return {}

    const raw = text.text.trim()
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(jsonStr) as ExtractCollectedResult
    return parsed
  } catch (err) {
    console.warn('[mister/stage] extractCollected failed:', err)
    return {}
  }
}
