// The Mister router — one cheap classify call picks at most one capability, then
// that capability does its own extraction + compute. Two calls total (classify →
// capability), which keeps each capability fully self-contained (its own prompt)
// so they can be built in parallel.
//
// The classify call is CONVERSATION-AWARE (see history.ts): a follow-up carries
// none of the vocabulary the classifier keys on, so the recent transcript travels
// with it. Without that, answering a question Mister itself asked routed to
// 'none'.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CAPABILITIES } from './registry'
import { capabilityMenu, fallbackReplyRules } from './converse'
import { renderTranscript, type Turn } from './history'
import { textResult, type Attachment, type CanvasContext, type CopilotResult } from './types'

function routerSystem(): string {
  const list = CAPABILITIES.map(
    (c) => `- ${c.id}: ${c.router.description}\n  ejemplos: ${c.router.examples.join(' | ')}`,
  ).join('\n')
  return `Eres el enrutador del copiloto interno Mister (Wings Global Trade). Dado un mensaje del
operador, elige la ÚNICA capacidad más adecuada de la lista, o "none" si ninguna aplica.

Capacidades:
${list}

CONVERSACIÓN: si hay conversación previa, el mensaje a clasificar casi siempre la CONTINÚA.
- Si Mister pidió un dato y el operador lo entrega ("el precio es 25,000", "MOQ una unidad",
  "sí, diésel"), clasifica según la TAREA que ese dato desbloquea, no según las palabras del
  mensaje suelto.
- Una corrección seguida de una petición ("El MOQ es una unidad. Ayúdame a crear una
  cotización") se clasifica por la PETICIÓN.
- Un mensaje breve sin verbo ("¿y a 22%?", "en 40HC") continúa la última tarea.

Usa "none" SOLO si el mensaje es realmente ajeno al comercio mayorista o es puramente social.
Ante la duda entre "none" y una capacidad plausible, elige la capacidad.

${fallbackReplyRules()}

Responde SOLO con JSON, sin texto alrededor: {"capability": "<id>" | "none", "reply": "<texto>"}`
}

/**
 * Route a message to a capability and run it. Throws only on a transport error;
 * a message no capability fits gets a conversational reply — drafted by this same
 * classify call (converse.ts owns its rules), so the fall-through costs no extra
 * round-trip — instead of a dead-end menu.
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
  history?: Turn[],
): Promise<CopilotResult> {
  if (attachment) {
    const visionCap = CAPABILITIES.find((c) => c.acceptsImage)
    if (visionCap) return visionCap.run(client, text, attachment, context, history)
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
    user: renderTranscript(history) + hint + `MENSAJE A CLASIFICAR:\n${text}`,
    // Room for the fallback `reply` on the 'none' path. A capability match emits
    // ~15 tokens, so the larger ceiling costs nothing in the common case — output
    // is billed on what's generated, not on the cap.
    maxTokens: 320,
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

  // Nothing routed: answer with the reply the classifier drafted in the same call,
  // and only fall back to the deterministic menu when it gave none.
  if (!cap) {
    const reply = typeof obj?.reply === 'string' ? obj.reply.trim() : ''
    return textResult(reply || capabilityMenu())
  }
  return cap.run(client, text, undefined, context, history)
}
