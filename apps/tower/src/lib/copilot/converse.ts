// The 'none' branch — what Mister says when no capability fits.
//
// It used to dump the capability menu verbatim. Mid-conversation that reads as if
// Mister ignored the operator: they answer the question Mister just asked and get
// a bulleted brochure back (the exact failure in the reported screenshots). So the
// dead end becomes a turn: a short reply that either answers, or asks for the ONE
// missing datum that would let a capability run.
//
// It is deliberately NOT a registered capability — the router can never select it;
// it only ever handles the fall-through, so it can't shadow a real capability.
// Guardrails match the rest of Mister: never invent a rate, a tariff or a price
// (those come from the engine), never promise a side effect.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CAPABILITIES } from './registry'
import { withHistory, type Turn } from './history'
import { textResult, type CopilotResult } from './types'

/** The deterministic last resort: what Mister can do. Also the first-contact
 *  answer to "¿qué puedes hacer?" when there is no model reply to give. */
export function capabilityMenu(): string {
  const menu = CAPABILITIES.map((c) => `• ${c.router.description}`).join('\n')
  return `Puedo ayudarte con: / I can help with:\n${menu}`
}

function converseSystem(): string {
  const list = CAPABILITIES.map((c) => `- ${c.id}: ${c.router.description}`).join('\n')
  return `Eres Mister, el copiloto interno de Wings Global Trade (comercio MAYORISTA B2B, Perú).
El mensaje del operador no cayó en ninguna de tus capacidades ejecutables:

${list}

Responde en español, breve (máximo 4 líneas), en el tono de un operador de comercio
exterior: directo, sin relleno, sin saludos de asistente.

Reglas:
- Si el operador está contestando algo que pediste antes, acusa recibo del dato y di
  exactamente qué falta para ejecutar (UNA sola cosa, la más importante).
- Si su mensaje sí se puede ejecutar pero le falta un dato, pide SOLO ese dato.
- Si el mensaje no tiene nada que ver con comercio mayorista, dilo en una línea y
  nombra 2 o 3 cosas concretas que sí puedes hacer.
- NUNCA inventes precios, fletes, aranceles ni tipos de cambio: esos salen del motor.
- NUNCA prometas haber guardado, enviado o cotizado algo.
- No listes todas tus capacidades como catálogo salvo que te pregunten qué puedes hacer.

Responde solo con el texto de la respuesta, sin JSON y sin comillas alrededor.`
}

/**
 * Reply conversationally when nothing routed. Any failure (transport, empty
 * answer) degrades to the deterministic menu — the dock always renders a bubble.
 */
export async function converse(
  client: IntelligenceClient,
  text: string,
  history?: Turn[],
): Promise<CopilotResult> {
  try {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.classify,
      system: converseSystem(),
      user: withHistory(text, history),
      maxTokens: 300,
    })
    const reply = raw.trim()
    if (reply) return textResult(reply)
  } catch {
    // fall through to the menu
  }
  return textResult(capabilityMenu())
}
