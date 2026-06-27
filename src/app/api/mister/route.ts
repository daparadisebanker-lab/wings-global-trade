// src/app/api/mister/route.ts
// Mister v2 — streaming POST endpoint.
// Authoritative: ENRICHED_SPEC §7, ai-engineer.md §2/§3/§4/§5/§6/§7
//
// Event sequence per turn:
//  1. Validate body (Zod)
//  2. Sanitize user input (injection guard)
//  3. Rate limit (IP, Upstash)
//  4. Upsert mister_projects row; atomic in_flight burst guard
//  5. Parallel context assembly
//  6. Open SSE stream
//  7. Emit pre-loaded surface events
//  8. Call Claude with cached static prompt + dynamic context
//  9. Stream tokens (fence-detecting mister control block)
// 10. Post-stream: guardrail scan
// 11. Post-stream: parse control block → emit actions / state / done SSE
// 12. Persist: history, collected patch, turn_count, stage, archetype
// 13. Clear in_flight (always in finally)

import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { getMisterClient, MISTER_MODEL } from '@/lib/mister/client'
import { MISTER_STATIC_PROMPT } from '@/lib/mister/systemPrompt'
import { buildMisterContext, trimHistory, capStoredHistory } from '@/lib/mister/buildContext'
import {
  scanGuardrails,
  sanitizeInput,
  getRoutingMessage,
  buildGuardrailFlag,
  buildInjectionFlag,
} from '@/lib/mister/guardrails'
import { checkRateLimit, checkTightenedRateLimit } from '@/lib/mister/rateLimit'
import { inferStage, extractCollected } from '@/lib/mister/stage'
import { isValidArchetype, isValidStage } from '@/lib/mister/archetype'
import { getFallbackActions, isValidQuickAction } from '@/lib/mister/fallback-actions'
import type {
  MisterProjectRow,
  MisterArchetype,
  MisterStage,
  MisterCollected,
  MisterQuickAction,
  MisterSurfaceType,
  MisterControlBlock,
  SurfaceEventPayload,
} from '@/types/mister'

export const runtime = 'nodejs'
export const maxDuration = 60

// ─────────────────────────────────────────────────────────────
// Request schema
// ─────────────────────────────────────────────────────────────
const ChatSchema = z.object({
  sessionId: z.string().min(1).max(128),
  message: z.string().min(1).max(4000),
  currentPage: z.string().max(256).optional().nullable(),
  currentProductId: z.string().uuid().optional().nullable(),
  locale: z.enum(['es-PE', 'en', 'nl', 'de']).optional().default('es-PE'),
})

// ─────────────────────────────────────────────────────────────
// SSE helpers
// ─────────────────────────────────────────────────────────────
const encoder = new TextEncoder()

function sseEvent(name: string, payload: unknown): Uint8Array {
  return encoder.encode(`event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`)
}

function sseError(code: string, message: string, extra?: Record<string, string>): Uint8Array {
  return sseEvent('error', { code, message, ...extra })
}

// ─────────────────────────────────────────────────────────────
// Mister control block extraction
// ─────────────────────────────────────────────────────────────
const FENCE_OPEN = '```mister'
const FENCE_CLOSE = '```'

interface StreamState {
  accumulator: string
  fenceStart: number // -1 if fence not yet found
  safeUpto: number   // index up to which tokens have been emitted
}

function processChunk(
  state: StreamState,
  chunk: string,
): { tokenToEmit: string | null; state: StreamState } {
  const acc = state.accumulator + chunk
  const fenceIdx = acc.indexOf(FENCE_OPEN)

  if (fenceIdx === -1) {
    const tokenToEmit = acc.slice(state.safeUpto)
    return {
      tokenToEmit: tokenToEmit || null,
      state: { ...state, accumulator: acc, safeUpto: acc.length },
    }
  }

  // Fence found — emit only text before the fence start
  const newSafeUpto = Math.min(fenceIdx, acc.length)
  const tokenToEmit =
    newSafeUpto > state.safeUpto ? acc.slice(state.safeUpto, newSafeUpto) : null

  return {
    tokenToEmit,
    state: { ...state, accumulator: acc, fenceStart: fenceIdx, safeUpto: newSafeUpto },
  }
}

function extractControlBlock(fullText: string): {
  cleanText: string
  block: MisterControlBlock | null
} {
  const openIdx = fullText.indexOf(FENCE_OPEN)
  if (openIdx === -1) return { cleanText: fullText.trimEnd(), block: null }

  const bodyStart = fullText.indexOf('\n', openIdx) + 1
  // Find the closing ``` that comes after the opening fence body
  const closeIdx = fullText.indexOf(FENCE_CLOSE, bodyStart)
  if (closeIdx === -1) return { cleanText: fullText.slice(0, openIdx).trimEnd(), block: null }

  const jsonBody = fullText.slice(bodyStart, closeIdx).trim()
  let block: MisterControlBlock | null = null
  try {
    const parsed = JSON.parse(jsonBody)
    // Validate structure loosely
    if (parsed && typeof parsed === 'object') {
      block = parsed as MisterControlBlock
    }
  } catch {
    console.warn('[mister/route] malformed control block JSON:', jsonBody.slice(0, 200))
  }

  return {
    cleanText: fullText.slice(0, openIdx).trimEnd(),
    block,
  }
}

// ─────────────────────────────────────────────────────────────
// Main POST handler
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Parse body
  let parsed: z.infer<typeof ChatSchema>
  try {
    parsed = ChatSchema.parse(await request.json())
  } catch (err) {
    if (err instanceof ZodError) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: err.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      )
    }
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }

  const { sessionId, message, currentPage, currentProductId, locale } = parsed

  // 2. Input sanitization
  const { clean: cleanMessage, injectionDetected } = sanitizeInput(message)

  // 3. Rate limit (IP)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  const rlResult = await checkRateLimit(ip)
  if (!rlResult.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Demasiadas consultas en poco tiempo. Espera un momento — vuelvo enseguida.',
        code: 'RATE_LIMITED',
        retryAfterMs: rlResult.retryAfterMs,
      }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    )
  }

  // 4. Supabase + session upsert + burst guard
  const supabase = createServiceClient()
  if (!supabase) {
    // Dev mode without Supabase — run mock stream
    return devMockStream(sessionId, cleanMessage, locale)
  }

  // Upsert session row (create on first message)
  const { error: upsertError } = await supabase.from('mister_projects').upsert(
    {
      session_id: sessionId,
      locale,
      current_page: currentPage ?? null,
      current_product_id: currentProductId ?? null,
    },
    { onConflict: 'session_id', ignoreDuplicates: false },
  )

  if (upsertError) {
    console.error('[mister/route] upsert error', upsertError)
    return new Response(
      JSON.stringify({ error: 'Error de sesión. Recarga la página.', code: 'SESSION_ERROR' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }

  // Atomic burst guard
  const { data: sessionRow, error: lockError } = await supabase
    .from('mister_projects')
    .update({ in_flight: true })
    .eq('session_id', sessionId)
    .eq('in_flight', false)
    .select()
    .single<MisterProjectRow>()

  if (lockError || !sessionRow) {
    return new Response(
      JSON.stringify({
        error: 'Mister ya está procesando tu pregunta.',
        code: 'CONCURRENT_REQUEST',
      }),
      { status: 409, headers: { 'content-type': 'application/json' } },
    )
  }

  // Check tightened rate limit if session has flags
  if (sessionRow.flags.length >= 3) {
    const tightened = await checkTightenedRateLimit(ip)
    if (!tightened.allowed) {
      await clearInFlight(supabase, sessionId)
      return new Response(
        JSON.stringify({ error: 'Límite de sesión alcanzado.', code: 'RATE_LIMITED' }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      )
    }
  }

  // Turn limit
  if (sessionRow.turn_count >= 40) {
    await clearInFlight(supabase, sessionId)
    const stream = buildErrorStream(
      'SESSION_LIMIT',
      'Sesión completada. Un especialista continúa por WhatsApp.',
      sessionId,
    )
    return streamResponse(stream)
  }

  // 5. Parallel context assembly
  const { contextString, surfaces } = await buildMisterContext(
    sessionRow,
    { currentPage: currentPage ?? null, currentProductId: currentProductId ?? null },
    supabase,
  ).catch((err) => {
    console.error('[mister/route] context assembly error', err)
    return { contextString: '', surfaces: [] as SurfaceEventPayload[] }
  })

  // 6. Claude client
  const claudeClient = getMisterClient()
  if (!claudeClient) {
    await clearInFlight(supabase, sessionId)
    return devMockStream(sessionId, cleanMessage, locale)
  }

  // Trim history for model call
  const { trimmed: trimmedMessages } = trimHistory(sessionRow.history, 15)

  // Append current user message
  const messagesForModel: { role: 'user' | 'assistant'; content: string }[] = [
    ...trimmedMessages,
    { role: 'user', content: cleanMessage },
  ]

  // 7–13. Build and return SSE stream
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (chunk: Uint8Array) => {
        try {
          controller.enqueue(chunk)
        } catch {
          // Stream closed by client abort — ignore
        }
      }

      const flagsToAppend: string[] = []
      if (injectionDetected) {
        flagsToAppend.push(buildInjectionFlag())
      }

      try {
        // Emit pre-loaded surface events
        for (const surface of surfaces) {
          enqueue(sseEvent('surface', surface))
        }

        // Call Claude with prompt caching
        const anthropicStream = claudeClient.messages.stream({
          model: MISTER_MODEL,
          max_tokens: 2048,
          system: [
            {
              type: 'text',
              text: MISTER_STATIC_PROMPT,
              // @ts-expect-error — cache_control is valid in SDK ≥0.24.0
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: contextString,
            },
          ],
          messages: messagesForModel,
        })

        let streamState: StreamState = {
          accumulator: '',
          fenceStart: -1,
          safeUpto: 0,
        }
        let fullText = ''

        for await (const event of anthropicStream) {
          // Respect client abort
          if (request.signal.aborted) break

          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = event.delta.text
            fullText += chunk

            const { tokenToEmit, state: nextState } = processChunk(streamState, chunk)
            streamState = nextState

            if (tokenToEmit) {
              enqueue(sseEvent('token', { delta: tokenToEmit }))
            }
          }
        }

        // 10. Post-stream guardrail scan
        const { cleanText, block } = extractControlBlock(fullText)
        const guardrailResult = scanGuardrails(cleanText)

        if (guardrailResult.violated) {
          const routingMsg = getRoutingMessage(locale)
          flagsToAppend.push(buildGuardrailFlag(guardrailResult.patterns))
          enqueue(
            sseError('CONTENT_REPLACED', routingMsg, { fallback: routingMsg }),
          )
        }

        // 11. Emit actions, state, done
        const quickActions = resolveQuickActions(
          block,
          sessionRow.archetype,
          sessionRow.stage,
        )
        enqueue(sseEvent('actions', { quickActions }))

        const newArchetype = resolveArchetype(block, sessionRow.archetype)
        const newStage = resolveStage(
          block,
          newArchetype,
          sessionRow.collected,
          sessionRow.stage,
        )
        enqueue(sseEvent('state', { archetype: newArchetype, stage: newStage }))

        const messageId = crypto.randomUUID()
        enqueue(sseEvent('done', { messageId }))

        // 12. Persist (best-effort, non-blocking for client)
        const collectedPatch = block?.collected ?? {}
        const mergedCollected: MisterCollected = {
          ...sessionRow.collected,
          ...collectedPatch,
        }

        const updatedHistory = capStoredHistory([
          ...sessionRow.history,
          { role: 'user' as const, content: cleanMessage },
          { role: 'assistant' as const, content: cleanText },
        ])

        // Build archetype history entry if archetype changed
        const archetypeHistoryPatch =
          newArchetype !== sessionRow.archetype
            ? [
                ...sessionRow.archetype_history,
                { from: sessionRow.archetype, to: newArchetype, at: new Date().toISOString() },
              ]
            : sessionRow.archetype_history

        const newFlags = [...sessionRow.flags, ...flagsToAppend]
        if (newFlags.length >= 3 && !newFlags.includes('TIGHTENED')) {
          newFlags.push('TIGHTENED')
        }

        await supabase
          .from('mister_projects')
          .update({
            archetype: newArchetype,
            archetype_history: archetypeHistoryPatch,
            stage: newStage,
            locale,
            current_page: currentPage ?? null,
            current_product_id: currentProductId ?? null,
            collected: mergedCollected,
            history: updatedHistory,
            turn_count: sessionRow.turn_count + 1,
            flags: newFlags,
            in_flight: false,
          })
          .eq('session_id', sessionId)

        // 12b. Async collected extraction (fire-and-forget via haiku)
        if (block === null || Object.keys(collectedPatch).length === 0) {
          // Only fire haiku extraction if control block had no collected patch
          void extractCollected(cleanText, cleanMessage, mergedCollected)
            .then(async (patch) => {
              if (Object.keys(patch).length === 0) return
              const { archetypeSignal, ...collectedFields } = patch
              const refreshed: MisterCollected = { ...mergedCollected, ...collectedFields }

              const updates: Record<string, unknown> = { collected: refreshed }
              if (
                archetypeSignal &&
                isValidArchetype(archetypeSignal) &&
                archetypeSignal !== newArchetype &&
                newArchetype === 'unresolved'
              ) {
                updates['archetype'] = archetypeSignal
              }

              await supabase
                .from('mister_projects')
                .update(updates)
                .eq('session_id', sessionId)
            })
            .catch((err) => console.warn('[mister/route] async extraction failed:', err))
        }
      } catch (err) {
        console.error('[mister/route] stream error', err)
        const isAnthropicError = err instanceof Error && err.message.includes('429')
        if (isAnthropicError) {
          enqueue(
            sseError(
              'OVERLOADED',
              'Demasiadas consultas ahora. Intenta en un momento o escríbenos por WhatsApp.',
            ),
          )
        } else {
          enqueue(
            sseError(
              'AI_UNAVAILABLE',
              'Mister no está disponible en este momento. Intenta en unos segundos.',
            ),
          )
        }
        // Clear in_flight on error
        await clearInFlight(supabase, sessionId).catch(() => null)
      } finally {
        controller.close()
      }
    },
  })

  return streamResponse(readable)
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function streamResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  })
}

async function clearInFlight(supabase: ReturnType<typeof createServiceClient>, sessionId: string) {
  if (!supabase) return
  await supabase
    .from('mister_projects')
    .update({ in_flight: false })
    .eq('session_id', sessionId)
}

function buildErrorStream(code: string, message: string, sessionId: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(sseError(code, message))
      controller.enqueue(sseEvent('done', { messageId: sessionId + ':error' }))
      controller.close()
    },
  })
}

function resolveQuickActions(
  block: MisterControlBlock | null,
  archetype: MisterArchetype,
  stage: MisterStage,
): MisterQuickAction[] {
  if (block?.quick_actions && Array.isArray(block.quick_actions)) {
    const valid = block.quick_actions.filter(isValidQuickAction)
    if (valid.length === 3) return valid
  }
  return getFallbackActions(archetype, stage)
}

function resolveArchetype(
  block: MisterControlBlock | null,
  currentArchetype: MisterArchetype,
): MisterArchetype {
  const declared = block?.state?.archetype
  if (declared && isValidArchetype(declared)) return declared
  return currentArchetype
}

function resolveStage(
  block: MisterControlBlock | null,
  archetype: MisterArchetype,
  collected: MisterCollected,
  currentStage: MisterStage,
): MisterStage {
  const declared = block?.state?.stage
  if (declared && isValidStage(declared)) {
    // Use model-declared stage, but also run server inference as a sanity check.
    // Never regress the stage below what the model declared.
    const inferred = inferStage(archetype, collected, currentStage)
    const stageOrder = ['induction', 'discovery', 'consideration', 'pre_qualification', 'support']
    const declaredIdx = stageOrder.indexOf(declared)
    const inferredIdx = stageOrder.indexOf(inferred)
    return stageOrder[Math.max(declaredIdx, inferredIdx)] as MisterStage ?? declared
  }
  return inferStage(archetype, collected, currentStage)
}

// ─────────────────────────────────────────────────────────────
// Dev mock stream (no Supabase / no API key)
// ─────────────────────────────────────────────────────────────
function devMockStream(
  sessionId: string,
  message: string,
  locale: string,
): Response {
  const reply =
    locale === 'en'
      ? `I'm Mister — Wings Global Trade's trade intelligence layer. You mentioned: "${message.slice(0, 60)}...". Tell me more about your import operation and I'll route you to the relevant intelligence.`
      : `Soy Mister — la capa de inteligencia comercial de Wings Global Trade. Mencionaste: "${message.slice(0, 60)}...". Cuéntame más sobre tu operación de importación y te oriento con lo que corresponde.`

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const words = reply.split(' ')
      for (const word of words) {
        controller.enqueue(sseEvent('token', { delta: word + ' ' }))
        await new Promise((r) => setTimeout(r, 10))
      }
      controller.enqueue(
        sseEvent('actions', {
          quickActions: [
            { label: 'Muéstrame productos para mi uso', action: 'show_product' },
            {
              label: 'Explícame cómo se construye el costo de internación',
              action: 'explain_cost',
            },
            { label: 'Comparar algunas opciones para mí', action: 'show_comparison' },
          ],
        }),
      )
      controller.enqueue(sseEvent('state', { archetype: 'unresolved', stage: 'induction' }))
      controller.enqueue(sseEvent('done', { messageId: crypto.randomUUID() }))
      controller.close()
    },
  })

  return streamResponse(stream)
}
