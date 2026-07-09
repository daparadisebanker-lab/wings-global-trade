// POST /api/intelligence/spec-extract  (API_MAP: POST /api/ai/spec-extract, streamed)
// Supplier-doc text → a specs DRAFT valid against the archetype's JSON-Schema
// (sonnet, STREAMED — the >2s case). SSE events per request:
//   token  { delta }        live extraction text
//   draft  { record }       the persisted AiDraftRecord (status DRAFT)
//   error  { code, message }
//   done   {}
// Approval (approveSpecExtract) writes a DRAFT product — never PUBLISHED.
//
// API_MAP says { storage_path, schema_id }. This route takes the extracted
// `documentText` in the body (n8n / the caller does OCR/PDF-to-text; this wave
// owns the AI layer, not document parsing) plus an optional `sourcePath` for the
// audit trail. FLAGGED in the wave report as a resolved ambiguity.
import type { NextRequest } from 'next/server'
import { z, ZodError } from 'zod'
import { getIntelligenceClient, streamSpecExtract, finalizeSpecExtract, type SpecExtractContext } from '@/lib/ai'
import type { Archetype } from '@/lib/archetypes'
import { requireApiUser, insertDraft } from '../_lib/drafts'

export const runtime = 'nodejs'
export const maxDuration = 120

const bodySchema = z.object({
  laneId: z.string().uuid(),
  documentText: z.string().min(1).max(60000),
  sourcePath: z.string().max(1024).optional(),
})

interface LaneRow {
  archetype: string
  brand_id: string
}

const encoder = new TextEncoder()
function sse(event: string, payload: unknown): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
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
    return new Response(JSON.stringify({ error: { code: 'VALIDATION', message } }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const client = getIntelligenceClient()
  if (!client) {
    return new Response(JSON.stringify({ error: { code: 'AI_UNAVAILABLE', message: 'Intelligence no configurada / Intelligence not configured' } }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { data: lane, error: laneError } = await supabase
    .from('lanes')
    .select('archetype,brand_id')
    .eq('id', body.laneId)
    .maybeSingle()
  if (laneError || !lane) {
    return new Response(JSON.stringify({ error: { code: 'FORBIDDEN_LANE', message: 'Lane no encontrada o sin acceso / Lane not found or no access' } }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    })
  }

  const laneRow = lane as LaneRow
  const ctx: SpecExtractContext = {
    archetype: laneRow.archetype as Archetype,
    laneId: body.laneId,
    documentText: body.documentText,
    sourcePath: body.sourcePath ?? '',
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (chunk: Uint8Array) => {
        try {
          controller.enqueue(chunk)
        } catch {
          // client aborted — ignore
        }
      }

      let fullText = ''
      try {
        for await (const delta of streamSpecExtract(client, ctx)) {
          if (request.signal.aborted) break
          fullText += delta
          enqueue(sse('token', { delta }))
        }

        // Parse the buffered text into the typed draft, then persist it.
        const envelope = finalizeSpecExtract(fullText, ctx)
        const record = await insertDraft(supabase, {
          kind: 'SPEC_EXTRACT',
          refTable: 'products',
          refId: null, // approval creates a NEW draft product
          brandId: laneRow.brand_id,
          laneId: body.laneId,
          envelope,
          createdBy: user.id,
        })

        if (!record) {
          enqueue(sse('error', { code: 'FORBIDDEN_LANE', message: 'No se pudo guardar el borrador / Could not save the draft' }))
        } else {
          enqueue(sse('draft', { record }))
        }
      } catch (err) {
        console.error('[intelligence/spec-extract]', err)
        enqueue(sse('error', { code: 'AI_ERROR', message: 'No se pudo extraer la ficha / Could not extract the spec' }))
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
