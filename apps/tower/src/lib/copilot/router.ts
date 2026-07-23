// The Mister router — one cheap classify call picks at most one capability, then
// that capability does its own extraction + compute. Two calls total (classify →
// capability), which keeps each capability fully self-contained (its own prompt)
// so they can be built in parallel.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CAPABILITIES } from './registry'
import { textResult, type Attachment, type CanvasContext, type CopilotResult } from './types'

function routerSystem(): string {
  const list = CAPABILITIES.map(
    (c) => `- ${c.id}: ${c.router.description}\n  ejemplos: ${c.router.examples.join(' | ')}`,
  ).join('\n')
  return `Eres el enrutador del copiloto interno Mister (Wings Global Trade). Dado un mensaje del
operador, elige la ÚNICA capacidad más adecuada de la lista, o "none" si ninguna aplica.

Capacidades:
${list}

Responde SOLO con JSON, sin texto alrededor: {"capability": "<id>" | "none"}`
}

/**
 * Route a message to a capability and run it. Throws only on a transport error;
 * an off-topic message returns a helpful menu of what Mister can do.
 *
 * An image attachment short-circuits the text classifier: an image is an
 * unambiguous signal for the (single) image-accepting capability, so we route
 * straight there and skip the classify call.
 */
export async function routeAndRun(
  client: IntelligenceClient,
  text: string,
  attachment?: Attachment,
  context?: CanvasContext,
): Promise<CopilotResult> {
  if (attachment) {
    const visionCap = CAPABILITIES.find((c) => c.acceptsImage)
    if (visionCap) return visionCap.run(client, text, attachment, context)
    // No image capability registered — fall through to text routing on the caption.
  }

  // Canvas-aware routing: a terse follow-up ("¿y si sube el TC?") carries none of
  // the vocabulary the classifier keys on, so tell it an edited artifact is open —
  // a short message is usually a follow-up about that artifact.
  const hint = context
    ? `[Contexto: el operador tiene abierto y editado un artefacto de ${
        context.kind === 'fit' ? 'cubicaje / contenedor' : 'costo de importación / precio de venta'
      } en el lienzo; una pregunta breve suele ser un seguimiento sobre ese artefacto.]\n`
    : ''
  const raw = await client.complete({
    model: INTELLIGENCE_MODELS.classify,
    system: routerSystem(),
    user: hint + text,
    maxTokens: 60,
  })
  const obj = extractJsonObject(raw)
  const id = typeof obj?.capability === 'string' ? obj.capability : 'none'
  let cap = CAPABILITIES.find((c) => c.id === id)

  // Deterministic backstop: if the classifier still bails but the operator is on a
  // fit canvas, a short follow-up is a container-fit follow-up (unambiguous — only
  // one capability produces 'fit'). The 'costing' kind is left to the hint above
  // since it maps to two capabilities.
  if (!cap && context?.kind === 'fit') {
    cap = CAPABILITIES.find((c) => c.id === 'container-fit')
  }

  if (!cap) {
    const menu = CAPABILITIES.map((c) => `• ${c.router.description}`).join('\n')
    return textResult(
      `Puedo ayudarte con: / I can help with:\n${menu}`,
    )
  }
  return cap.run(client, text, undefined, context)
}
