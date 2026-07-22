// Capability: draft a client-facing PROPOSAL MESSAGE (Spanish, with an EN mirror)
// from the operator's plain description — the note an operator sends over WhatsApp
// or email to move a wholesale deal forward.
//
// Governance boundary (deliberate): this drafts WORDS, not a binding quotation
// RECORD. A real proforma with prices comes from the deterministic costing /
// quotation engine — never model prose — so this capability never invents a price,
// rate, or figure: it only phrases and structures what the operator states. That
// keeps it a read/compose capability (no ai_drafts write, no dispose step) and
// honors Directive 2 (wholesale tone, no retail vocabulary).

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { textResult, type Capability, type CopilotResult } from '../types'

// ── Renderer payload (PURE-parser output; unit-tested) ───────────────────────

/** What the 'proposal' renderer draws — a copy-ready client proposal, ES primary. */
export interface ProposalDraftData {
  /** How it's meant to be sent, if the operator implied one. */
  channel: 'whatsapp' | 'email' | 'formal' | null
  subjectEs: string | null
  subjectEn: string | null
  /** The message body in Spanish — the primary deliverable. */
  bodyEs: string
  /** English mirror; null when the model returned only Spanish. */
  bodyEn: string | null
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}
function channelOf(v: unknown): ProposalDraftData['channel'] {
  return v === 'whatsapp' || v === 'email' || v === 'formal' ? v : null
}

/** PURE: model text → proposal. Returns null when there's no Spanish body to show. */
export function parseProposalDraft(raw: string): ProposalDraftData | null {
  const obj = extractJsonObject(raw)
  if (!obj) return null
  const bodyEs = str(obj.bodyEs)
  if (!bodyEs) return null
  return {
    channel: channelOf(obj.channel),
    subjectEs: str(obj.subjectEs),
    subjectEn: str(obj.subjectEn),
    bodyEs,
    bodyEn: str(obj.bodyEn),
  }
}

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade — comercio MAYORISTA (B2B). Tu tarea
es REDACTAR el mensaje de propuesta que el operador enviará a un cliente (por WhatsApp, correo o de
forma más formal), a partir de su descripción en lenguaje natural.

REGLAS FIRMES:
- Tono mayorista y profesional. PROHIBIDO vocabulario retail: nada de "carrito", "comprar ahora",
  "añadir al carrito", "oferta por tiempo limitado", precios por unidad al detalle. La acción del
  mensaje siempre es abrir/continuar una conversación de cotización (RFQ), nunca una venta directa.
- NUNCA inventes cifras. Usa SOLO los números que el operador te dé (precio, MOQ, plazos, incoterm).
  Si falta un dato clave, deja un marcador claro entre corchetes, p. ej. [precio FOB por confirmar],
  para que el operador lo complete — no adivines.
- Español como idioma principal; da también un espejo en inglés.
- Estructura el cuerpo con saludo, alcance/propuesta, términos comerciales (solo los dados) y un
  siguiente paso claro (cotización / hablar con el equipo).

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "channel": "whatsapp"|"email"|"formal"|null,
  "subjectEs": string|null,   // asunto (para correo); null si no aplica (WhatsApp)
  "subjectEn": string|null,
  "bodyEs": string,           // el mensaje en español, con saltos de línea \\n
  "bodyEn": string,           // espejo en inglés
  "note": string              // nota breve en español para el operador
}

Si el mensaje NO pide redactar una propuesta/cotización para un cliente, devuelve understood=false
con una "note" breve en español y bodyEs como cadena vacía.`

export const proposalDraftCapability: Capability = {
  id: 'proposal-draft',
  router: {
    description:
      'Redactar una propuesta o mensaje de cotización para un cliente (WhatsApp, correo, formal), en español con espejo en inglés.',
    examples: [
      'Redáctame una propuesta para un cliente que quiere 200 scooters eléctricos',
      'Escribe un mensaje de WhatsApp ofreciendo un contenedor de llantas a este cliente',
      'Draft an email proposal for a distributor interested in our generators',
    ],
  },
  async run(client: IntelligenceClient, text: string): Promise<CopilotResult> {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: text,
      maxTokens: 900,
    })
    const obj = extractJsonObject(raw)
    const note = str(obj?.note) ?? ''

    if (!obj || obj.understood !== true) {
      return textResult(
        note ||
          'Dime a quién le escribes y qué le ofreces, y te armo la propuesta. / Tell me who it’s for and what you’re offering, and I’ll draft the proposal.',
      )
    }

    const data = parseProposalDraft(raw)
    if (!data) {
      return textResult(
        'Necesito un poco más de detalle para redactarla. / I need a bit more detail to draft it.',
      )
    }

    return { renderer: 'proposal', note, data }
  },
}
