// src/lib/ai/spec-extract.ts
// (3) Spec-extract orchestrator: supplier-doc text → a specs DRAFT valid against
// the archetype's JSON-Schema. sonnet (reason tier), STREAMED — extraction is the
// >2s case, so the route forwards `streamSpecExtract` deltas as SSE tokens, then
// calls `finalizeSpecExtract` on the buffered text to produce the typed draft.
// Approval writes it as a DRAFT product — NEVER PUBLISHED (core law).
import { INTELLIGENCE_MODELS, type AiDraft, type SpecExtractPayload } from './types'
import type { IntelligenceClient } from './client'
import { buildSpecExtractPrompt } from './prompts'
import { parseSpecExtractDraft } from './parse'
import { getSpecSchema } from '@/lib/schemas/spec'
import type { Archetype } from '@/lib/archetypes'

export interface SpecExtractContext {
  archetype: Archetype
  laneId: string
  documentText: string
  /** Storage path of the source document — recorded on the draft for audit. */
  sourcePath: string
  /** Optional lane spec-schema override rows (RLS-scoped read by the caller). */
  schemaOverrideRows?: Parameters<typeof getSpecSchema>[2]
}

function buildRequest(ctx: SpecExtractContext) {
  const schema = getSpecSchema(ctx.archetype, ctx.laneId, ctx.schemaOverrideRows)
  return buildSpecExtractPrompt({
    archetype: ctx.archetype,
    schema,
    documentText: ctx.documentText,
  })
}

/** Stream the raw model text (deltas) for the SSE `token` events. */
export async function* streamSpecExtract(
  client: IntelligenceClient,
  ctx: SpecExtractContext,
): AsyncIterable<string> {
  const { system, user } = buildRequest(ctx)
  yield* client.stream({
    model: INTELLIGENCE_MODELS.reason,
    system,
    user,
    // Spec sheets can be long; give room but stream so no HTTP timeout.
    maxTokens: 4096,
  })
}

/** Parse the buffered stream text into the typed, persistable draft. */
export function finalizeSpecExtract(
  fullText: string,
  ctx: SpecExtractContext,
): AiDraft<SpecExtractPayload> {
  const parsed = parseSpecExtractDraft(fullText, ctx.archetype)
  if (!parsed.ok) throw new Error(`spec-extract parse failed: ${parsed.reason}`)

  const { core, confidence } = parsed.value
  const payload: SpecExtractPayload = {
    archetype: core.archetype,
    laneId: ctx.laneId,
    name: core.name,
    suggestedSlug: core.suggestedSlug,
    specs: core.specs,
    fieldConfidences: core.fieldConfidences,
    ...(core.hsCode ? { hsCode: core.hsCode } : {}),
    sourcePath: ctx.sourcePath,
  }
  return { draft: payload, confidence, model: INTELLIGENCE_MODELS.reason }
}

/** Non-streamed convenience (tests / batch): buffer then finalize. */
export async function runSpecExtract(
  client: IntelligenceClient,
  ctx: SpecExtractContext,
): Promise<AiDraft<SpecExtractPayload>> {
  let full = ''
  for await (const chunk of streamSpecExtract(client, ctx)) full += chunk
  return finalizeSpecExtract(full, ctx)
}
