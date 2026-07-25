'use server'

// WhatsApp-import action: an exported chat (.txt) → a REVIEWABLE client-profile
// draft. Directive 7 (propose-then-dispose): this returns a draft only — nothing
// persists until the human saves it through createClient in the form. The model
// reads the transcript into JSON; parsing/guards are PURE (lib/crm/whatsapp).

import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import { getIntelligenceClient } from '@/lib/ai/client'
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { parseWhatsappExport, parseClientExtract, type ClientExtractDraft } from '@/lib/crm/whatsapp'

const MAX_INPUT = 200_000 // guard the upload before we even parse it

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. Recibes la TRANSCRIPCIÓN de una
conversación de WhatsApp entre un asesor de Wings (importador/exportador mayorista B2B) y un
CLIENTE o prospecto. Tu tarea es LEER la conversación y extraer el PERFIL DEL CLIENTE en JSON —
NO inventes datos que no estén en el texto; deja en null lo que no aparezca.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "name": string|null,            // nombre del cliente o de su empresa
  "country": string|null,
  "city": string|null,
  "category": string|null,        // categoría de producto que le interesa (p. ej. "molduras", "maquinaria")
  "archetype": "EQUIPMENT"|"PROJECT"|"COMMODITY"|"PROGRAM"|"CREDENTIAL"|"ORIGIN"|"ALLOCATION"|null,
  "demand": string|null,          // qué necesita, en UNA línea (producto + volumen si se menciona)
  "currency": string|null,        // moneda si se menciona (USD, PEN, EUR, CNY)
  "contactName": string|null,     // nombre de la persona del lado del cliente
  "contactWhatsapp": string|null, // su teléfono si aparece
  "contactRole": string|null,     // su cargo si aparece
  "summary": string|null,         // resumen en UN párrafo en español de la conversación y la oportunidad
  "confidence": number            // 0 a 1: qué tan segura es la extracción
}

Guía de archetype (cómo COMPRA el cliente):
- EQUIPMENT: unidades especificadas (maquinaria, vehículos, equipos).
- PROJECT: una entrega por proyecto/obra (interiores, materiales de construcción, FF&E).
- COMMODITY: volumen por grado/precio (insumos, alimentos, materias primas).
- PROGRAM: surtidos de SKU que se repiten (línea blanca, productos de hogar).
- CREDENTIAL: acceso/representación (mandatos, distribución).
- ORIGIN: procedencia + documentación de exportación.
- ALLOCATION: un cupo dentro de un contenedor de una marca representada.
Elige el que mejor encaje o null si no hay señal.

Si la transcripción NO identifica a un cliente con una necesidad, devuelve todo en null con un
summary breve explicándolo.`

/**
 * Read an exported WhatsApp chat and return a draft client profile. RLS is not a
 * factor here (no write happens); the draft is handed to the form, where the
 * RLS-gated createClient is the only path that persists it.
 */
export async function extractClientFromWhatsapp(rawExport: string): Promise<ActionResult<ClientExtractDraft>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  if (typeof rawExport !== 'string' || rawExport.length === 0)
    return fail('VALIDATION', 'Pega o sube el chat exportado / Paste or upload the exported chat')
  if (rawExport.length > MAX_INPUT)
    return fail('VALIDATION', 'El archivo es demasiado grande / The file is too large')

  const parsed = parseWhatsappExport(rawExport)
  if (!parsed.hasContent)
    return fail('VALIDATION', 'No se detectó una conversación de WhatsApp válida / No valid WhatsApp conversation detected')

  const client = getIntelligenceClient()
  if (!client)
    return fail('VALIDATION', 'La IA no está disponible ahora mismo / AI is unavailable right now')

  let raw: string
  try {
    raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: parsed.transcript,
      maxTokens: 900,
    })
  } catch {
    return fail('RATE_LIMITED', 'La IA no pudo procesar el chat / The AI could not process the chat')
  }

  const draft = parseClientExtract(raw, parsed.phones[0] ?? null)
  if (!draft.hasContent)
    return fail(
      'VALIDATION',
      draft.summary ?? 'No pude armar un perfil con esa conversación / I could not build a profile from that chat',
    )

  return ok(draft)
}
