// src/app/api/accio/chat/route.ts
// Accio Engine chat endpoint. Streams Claude responses as SSE, strips embedded
// JSON extraction blocks before sending text to the client, and emits
// tpr_update + done events. Falls back to a deterministic mock stream when
// ANTHROPIC_API_KEY is absent so the UI is fully testable offline.

import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import {
  getAnthropicClient,
  buildAccioSystemPrompt,
  ACCIO_CHAT_MODEL,
  extractTprFields,
  stripJsonMarkers,
} from '@/lib/claude'
import { coerceTprValue, computeCompleteness } from '@/lib/tpr'
import type { TprState, TprFieldKey } from '@/types/accio'

export const runtime = 'nodejs'
export const maxDuration = 30

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .min(1)
    .max(40),
  tpr_state: z.record(z.unknown()).default({}),
  session_id: z.string(),
})

const encoder = new TextEncoder()

function sse(obj: unknown): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
}

export async function POST(request: NextRequest) {
  let parsed
  try {
    parsed = ChatSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } },
      )
    }
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }

  // Enforce max conversation length server-side (sliding window of 20 turns).
  const messages = parsed.messages.slice(-20)
  const tprState = parsed.tpr_state as TprState
  const client = getAnthropicClient()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const updatedState: TprState = { ...tprState }

      const emitFields = (fields: { field: TprFieldKey; value: unknown }[]) => {
        for (const { field, value } of fields) {
          const coerced = coerceTprValue(field, value)
          if (coerced === undefined) continue
          ;(updatedState as Record<string, unknown>)[field] = coerced
          controller.enqueue(sse({ type: 'tpr_update', field, value: coerced }))
        }
      }

      try {
        if (!client) {
          await mockStream(controller, messages, updatedState, emitFields)
        } else {
          await claudeStream(controller, client, messages, tprState, emitFields)
        }
        controller.enqueue(
          sse({ type: 'done', tpr_completeness: computeCompleteness(updatedState) }),
        )
      } catch (error) {
        console.error('[api/accio/chat] stream error', error)
        controller.enqueue(sse({ type: 'error', message: 'El motor Accio no está disponible en este momento.' }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  })
}

async function claudeStream(
  controller: ReadableStreamDefaultController<Uint8Array>,
  client: NonNullable<ReturnType<typeof getAnthropicClient>>,
  messages: { role: 'user' | 'assistant'; content: string }[],
  tprState: TprState,
  emitFields: (fields: { field: TprFieldKey; value: unknown }[]) => void,
) {
  const anthropicStream = await client.messages.stream({
    model: ACCIO_CHAT_MODEL,
    max_tokens: 1024,
    system: buildAccioSystemPrompt(tprState),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  })

  let buffer = ''
  let fullText = ''

  for await (const event of anthropicStream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const chunk = event.delta.text
      fullText += chunk
      buffer += chunk
      // Stream only text that is safely outside any JSON block.
      const { safe, remainder } = stripJsonMarkers(buffer)
      if (safe) controller.enqueue(sse({ type: 'delta', content: safe }))
      buffer = remainder
    }
  }

  // Flush any remaining safe text and parse all captured fields.
  if (buffer) {
    const { cleaned } = extractTprFields(buffer)
    if (cleaned) controller.enqueue(sse({ type: 'delta', content: cleaned }))
  }
  const { fields } = extractTprFields(fullText)
  emitFields(fields)
}

/** Deterministic offline assistant — advances TPR one field at a time. */
async function mockStream(
  controller: ReadableStreamDefaultController<Uint8Array>,
  messages: { role: 'user' | 'assistant'; content: string }[],
  state: TprState,
  emitFields: (fields: { field: TprFieldKey; value: unknown }[]) => void,
) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const captured: { field: TprFieldKey; value: unknown }[] = []
  let reply = ''

  if (!state.product_description) {
    captured.push({ field: 'product_description', value: lastUser.slice(0, 160) || 'Producto a importar' })
    reply = `Entendido, registro tu requerimiento: ${lastUser.slice(0, 80)}. ¿Qué cantidad aproximada necesitas importar?`
  } else if (!state.quantity) {
    captured.push({ field: 'quantity', value: lastUser })
    reply = `Confirmo la cantidad: ${lastUser}. ¿A qué país de destino se realizaría la importación?`
  } else if (!state.destination_country) {
    captured.push({ field: 'destination_country', value: lastUser })
    reply = `Destino registrado: ${lastUser}. ¿Cuál es tu precio objetivo por unidad en dólares?`
  } else if (state.target_price_usd == null) {
    const n = parseFloat(lastUser.replace(/[^\d.]/g, '')) || 1000
    captured.push({ field: 'target_price_usd', value: n })
    reply = `Precio objetivo registrado. Con estos datos puedo preparar un estimado CIF preliminar. ¿Deseas que lo calcule ahora?`
  } else {
    reply = 'Tengo los datos mínimos para un estimado CIF. Puedes generarlo o continuar añadiendo certificaciones y especificaciones técnicas.'
  }

  // Stream the reply word-by-word for a natural feel.
  for (const word of reply.split(' ')) {
    controller.enqueue(sse({ type: 'delta', content: word + ' ' }))
    await new Promise((r) => setTimeout(r, 12))
  }
  emitFields(captured)
}
