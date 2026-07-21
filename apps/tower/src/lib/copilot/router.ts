// The Mister router — one cheap classify call picks at most one capability, then
// that capability does its own extraction + compute. Two calls total (classify →
// capability), which keeps each capability fully self-contained (its own prompt)
// so they can be built in parallel.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { CAPABILITIES } from './registry'
import { textResult, type CopilotResult } from './types'

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
 */
export async function routeAndRun(client: IntelligenceClient, text: string): Promise<CopilotResult> {
  const raw = await client.complete({
    model: INTELLIGENCE_MODELS.classify,
    system: routerSystem(),
    user: text,
    maxTokens: 60,
  })
  const obj = extractJsonObject(raw)
  const id = typeof obj?.capability === 'string' ? obj.capability : 'none'
  const cap = CAPABILITIES.find((c) => c.id === id)

  if (!cap) {
    const menu = CAPABILITIES.map((c) => `• ${c.router.description}`).join('\n')
    return textResult(
      `Puedo ayudarte con: / I can help with:\n${menu}`,
    )
  }
  return cap.run(client, text)
}
