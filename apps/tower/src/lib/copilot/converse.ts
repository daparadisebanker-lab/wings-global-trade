// The 'none' branch — what Mister says when no capability fits.
//
// It used to dump the capability menu verbatim. Mid-conversation that reads as if
// Mister ignored the operator: they answer the question Mister just asked and get
// a bulleted brochure back (the exact failure in the reported screenshots). So the
// dead end becomes a turn: a short reply that either answers, or asks for the ONE
// missing datum that would let a capability run.
//
// COST: that reply is drafted by the ROUTER's own call — the classifier has
// already read the transcript, so asking it for a reply in the same JSON costs
// output tokens only on the 'none' path and adds no second round-trip. (It was a
// separate call for one commit; folding it in removed that.) A capability match
// emits ~15 tokens and never pays for the larger ceiling.
//
// This is deliberately NOT a registered capability — the router can never select
// it; it only ever handles the fall-through, so it can't shadow a real capability.

import { CAPABILITIES } from './registry'

/** The deterministic last resort: what Mister can do. Used when the model returns
 *  no usable reply, and it is the honest answer to "¿qué puedes hacer?". */
export function capabilityMenu(): string {
  const menu = CAPABILITIES.map((c) => `• ${c.router.description}`).join('\n')
  return `Puedo ayudarte con: / I can help with:\n${menu}`
}

/** The guardrails for the fallback reply, injected into the router's system prompt.
 *  Kept here rather than inline in router.ts so Mister's voice and its refusals
 *  live in one place — the same law whether the reply is a nudge or a question. */
export function fallbackReplyRules(): string {
  return `SOLO si eliges "none", escribe además un campo "reply": la respuesta que Mister le da
al operador. Reglas del "reply" (si eliges una capacidad, OMÍTELO):
- Español, máximo 3 líneas, tono de operador de comercio exterior: directo, sin saludos.
- Si el operador está contestando algo que Mister pidió antes, acusa recibo del dato y pide
  UNA sola cosa: la que falta para poder ejecutar.
- Si el mensaje no tiene nada que ver con comercio mayorista, dilo en una línea y nombra 2 o
  3 cosas concretas que Mister sí puede hacer.
- NUNCA inventes precios, fletes, aranceles ni tipos de cambio: esos salen del motor.
- NUNCA prometas haber guardado, enviado ni cotizado algo.`
}
