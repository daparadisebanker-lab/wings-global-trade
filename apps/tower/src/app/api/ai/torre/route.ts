// POST /api/ai/torre  (streamed) — one Mister Torre agentic run.
// Router picks a profile, the tool loop runs with that profile's scoped belt, and the
// run is streamed as SSE. Events per request:
//   route  { decision, profile }     the chosen specialism + urgency
//   step   { index, text, calls }    one model↔tool round (narration + tool calls)
//   final  { text, stopReason, ... } the closing turn
//   error  { code, message }
//   done   {}
//
// Nothing here sends/commits: the profile's tools terminate in ai_drafts DRAFTs
// (propose_quote / draft_message). The drafts surface in the Torre review queue for
// human approval — this route only streams the run's narration.
import type { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z, ZodError } from 'zod'
import { getIntelligenceClient } from '@/lib/ai/client'
import { requireApiUser } from '../_lib/drafts'
import { wrapAnthropic } from '@/lib/torre/agent/anthropic-runner'
import { createTorreProvider } from '@/lib/torre/agent/provider'
import { runTorreAgent } from '@/lib/torre/agent/run'
import type { QuoteLaneRow } from '@/lib/torre/quote-core'

export const runtime = 'nodejs'
export const maxDuration = 120

const bodySchema = z.object({
  laneId: z.string().uuid(),
  text: z.string().trim().min(3).max(2000),
  today: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

const encoder = new TextEncoder()
function sse(event: string, payload: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
}
function jsonError(code: string, message: string, status: number): Response {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export async function POST(request: NextRequest) {
  const gate = await requireApiUser()
  if (!gate.ok) return gate.response
  const { supabase, user } = gate

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch (err) {
    const message = err instanceof ZodError ? 'Datos inválidos / Invalid data' : 'Error interno / Internal error'
    return jsonError('VALIDATION', message, 400)
  }

  const routerClient = getIntelligenceClient()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!routerClient || !apiKey) {
    return jsonError('AI_UNAVAILABLE', 'Intelligence no configurada / Intelligence not configured', 503)
  }

  // Lane → brand + code (RLS-scoped: a lane the operator can't see returns nothing).
  const { data: lane } = await supabase.from('lanes').select('id,brand_id,code,archetype').eq('id', body.laneId).maybeSingle()
  const laneRow = lane as QuoteLaneRow | null
  if (!laneRow?.brand_id) {
    return jsonError('FORBIDDEN_LANE', 'Lane no encontrada o sin acceso / Lane not found or no access', 403)
  }

  const today = body.today ?? new Date().toISOString().slice(0, 10)
  const sdk = wrapAnthropic(new Anthropic({ apiKey }))
  const provider = createTorreProvider(supabase, { laneRow, today, createdBy: user.id })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (chunk: Uint8Array) => {
        try {
          controller.enqueue(chunk)
        } catch {
          // client aborted — ignore
        }
      }
      try {
        await runTorreAgent({
          routerClient,
          sdk,
          provider,
          text: body.text,
          today,
          signal: request.signal,
          onEvent: (e) => enqueue(sse(e.type, e)),
        })
      } catch (err) {
        console.error('[ai/torre]', err)
        enqueue(sse('error', { code: 'AI_ERROR', message: 'La corrida falló / The run failed' }))
      } finally {
        enqueue(sse('done', {}))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  })
}
