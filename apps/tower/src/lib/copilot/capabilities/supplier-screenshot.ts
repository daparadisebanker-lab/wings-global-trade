// Capability: read a supplier screenshot (WhatsApp / Alibaba / email) and extract
// the offer into structured fields the operator can act on — product, unit price,
// MOQ, incoterm, lead time, port, HS-code hint. Vision-only: it consumes the image
// attachment (acceptsImage) and routes here directly (router.ts short-circuits the
// classifier when an image is present).
//
// Discipline mirrors the rest of the copilot: the MODEL only reads pixels into
// JSON; the parse (parseSupplierExtract) is PURE and unit-tested, and no number is
// computed here — the extracted price/MOQ are the operator's next input to the
// landed-cost or reverse-quote capabilities.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { textResult, type Attachment, type Capability, type CopilotResult } from '../types'

// ── Renderer payload (PURE-parser output; unit-tested) ───────────────────────

/** One extra captured field the fixed columns don't cover (payment terms, color…). */
export interface SupplierExtractField {
  label: string
  value: string
}

/** What the 'supplier-extract' renderer draws — a read of a supplier's offer. */
export interface SupplierExtractData {
  /** Where the screenshot came from, if the model could tell. */
  source: 'whatsapp' | 'alibaba' | 'email' | 'other' | null
  supplier: string | null
  product: string | null
  unitPrice: number | null
  currency: string | null
  /** Free text, e.g. 'por unidad' / 'per set' — the unit the price is quoted in. */
  priceUnit: string | null
  /** Free text — MOQ as stated ('100 unidades', '1x40HC'). */
  moq: string | null
  incoterm: string | null
  leadTimeDays: number | null
  port: string | null
  hsCode: string | null
  /** Anything else worth surfacing, as label/value rows. */
  extras: SupplierExtractField[]
  /** One-line ES summary of the offer (also used as the bubble note). */
  summary: string | null
  /** True when at least one substantive field was read — the render/skip gate. */
  hasContent: boolean
}

// ── Extraction guards ────────────────────────────────────────────────────────
function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) && n > 0 ? n : null
  }
  return null
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}
function source(v: unknown): SupplierExtractData['source'] {
  return v === 'whatsapp' || v === 'alibaba' || v === 'email' || v === 'other' ? v : null
}

/**
 * PURE: model text → SupplierExtractData. No SDK, no image — takes the raw model
 * string so it is unit-testable (supplier-screenshot.test.ts). `hasContent` is the
 * render gate: a screenshot with nothing legible produces a text fallback, never
 * an empty card.
 */
export function parseSupplierExtract(raw: string): SupplierExtractData {
  const obj = extractJsonObject(raw)
  const empty: SupplierExtractData = {
    source: null,
    supplier: null,
    product: null,
    unitPrice: null,
    currency: null,
    priceUnit: null,
    moq: null,
    incoterm: null,
    leadTimeDays: null,
    port: null,
    hsCode: null,
    extras: [],
    summary: null,
    hasContent: false,
  }
  if (!obj) return empty

  const extras: SupplierExtractField[] = Array.isArray(obj.extras)
    ? obj.extras
        .filter((f): f is Record<string, unknown> => Boolean(f) && typeof f === 'object')
        .map((f) => ({ label: str(f.label) ?? '', value: str(f.value) ?? '' }))
        .filter((f) => f.label && f.value)
        .slice(0, 8)
    : []

  const data: SupplierExtractData = {
    source: source(obj.source),
    supplier: str(obj.supplier),
    product: str(obj.product),
    unitPrice: num(obj.unitPrice),
    currency: str(obj.currency),
    priceUnit: str(obj.priceUnit),
    moq: str(obj.moq),
    incoterm: str(obj.incoterm)?.toUpperCase() ?? null,
    leadTimeDays: num(obj.leadTimeDays),
    port: str(obj.port),
    hsCode: str(obj.hsCode),
    extras,
    summary: str(obj.summary),
    hasContent: false,
  }

  // Substantive iff any commercial field (not just a summary) was read.
  data.hasContent = Boolean(
    data.supplier ||
      data.product ||
      data.unitPrice !== null ||
      data.moq ||
      data.incoterm ||
      data.leadTimeDays !== null ||
      data.port ||
      data.hsCode ||
      extras.length > 0,
  )
  return data
}

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. Recibes la CAPTURA de una
conversación con un proveedor (WhatsApp, Alibaba, correo) o de una ficha de producto. Tu tarea es
LEER la oferta y extraerla en JSON estructurado — NO calcules nada, NO inventes datos que no estén
en la imagen. Deja en null cualquier campo que no aparezca.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "source": "whatsapp"|"alibaba"|"email"|"other"|null,
  "supplier": string|null,        // nombre del proveedor o empresa
  "product": string|null,         // qué se ofrece
  "unitPrice": number|null,       // precio unitario, SOLO el número
  "currency": string|null,        // moneda (USD, RMB, CNY…)
  "priceUnit": string|null,       // en qué se cotiza el precio ("por unidad", "per set")
  "moq": string|null,             // cantidad mínima tal como se declara ("100 unidades", "1x40HC")
  "incoterm": "EXW"|"FOB"|"CFR"|"CIF"|"DDP"|string|null,
  "leadTimeDays": number|null,    // plazo de entrega en DÍAS (convierte semanas ×7)
  "port": string|null,            // puerto de carga si se menciona
  "hsCode": string|null,          // partida arancelaria si aparece
  "extras": [ { "label": string, "value": string } ],  // otros datos (pago, color, voltaje…)
  "summary": string|null          // resumen en UNA línea en español de la oferta
}

Reglas: precios y cantidades → solo el número en "unitPrice"/"leadTimeDays" (semanas ×7 a días).
Si la imagen NO contiene una oferta legible, devuelve summary con una nota breve en español y todo
lo demás en null.`

export const supplierScreenshotCapability: Capability = {
  id: 'supplier-screenshot',
  acceptsImage: true,
  router: {
    description:
      'Leer una captura de proveedor (WhatsApp, Alibaba, correo) y extraer la oferta: producto, precio, MOQ, incoterm, plazo, puerto.',
    examples: [
      'Lee esta captura del proveedor',
      'Extrae la oferta de este screenshot de Alibaba',
      'Qué dice esta conversación de WhatsApp con el proveedor',
    ],
  },
  async run(client: IntelligenceClient, text: string, attachment?: Attachment): Promise<CopilotResult> {
    if (!attachment) {
      return textResult(
        'Pega o adjunta la captura del proveedor y la leo. / Paste or attach the supplier screenshot and I’ll read it.',
      )
    }

    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: text.trim() || 'Extrae la oferta del proveedor de esta captura.',
      maxTokens: 900,
      image: attachment,
    })

    const data = parseSupplierExtract(raw)
    if (!data.hasContent) {
      return textResult(
        data.summary ||
          'No pude leer una oferta clara en esa captura. / I couldn’t read a clear offer in that screenshot.',
      )
    }

    return { renderer: 'supplier-extract', note: data.summary ?? undefined, data }
  },
}
