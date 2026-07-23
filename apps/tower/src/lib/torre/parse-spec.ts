// src/lib/torre/parse-spec.ts
// The MODEL step of the quote run: turn the operator's sentence into a STRUCTURED
// spec. The model ONLY extracts what the operator said — it never produces a price,
// a rate, or a landed cost (those come from costing_config + computeImportCost). This
// mirrors the landed-cost / quote-build extraction contract already in the repo.
//
// parseQuoteSpec is PURE (JSON text → QuoteSpec) and unit-tested; extractQuoteSpec
// wraps it with one classify/reason model call behind the IntelligenceClient seam.
import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import type { FuelType, Incoterm, Origin } from '@/lib/costing/types'

const FUELS: readonly FuelType[] = ['gasoline', 'diesel', 'hybrid', 'electric']
const INCOTERMS: readonly Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']
const ORIGINS: readonly Origin[] = ['china', 'other']

/** The structured, model-extracted spec (money knobs the operator STATED). */
export interface QuoteSpec {
  understood: boolean
  productName: string | null
  brand: string | null
  model: string | null
  fuelType: FuelType | null
  engineCC: number | null
  origin: Origin | null
  incoterm: Incoterm | null
  scenarios: Incoterm[]
  fob: number | null
  freightInternational: number | null
  quantity: number | null
  clientName: string | null
  language: string | null
  /** Operator-stated margin as a FRACTION (0.22), or null → org default. */
  marginPercent: number | null
  note: string
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) && v.trim() !== '' ? n : null
  }
  return null
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null
}
/** 22 → 0.22, 0.22 → 0.22, null → null. */
function pct(v: unknown): number | null {
  const n = num(v)
  if (n === null) return null
  return n > 1 ? n / 100 : n
}

/** PURE: model JSON text → a normalized QuoteSpec (deterministic, unit-tested). */
export function parseQuoteSpec(raw: string): QuoteSpec {
  const obj = extractJsonObject(raw) ?? {}
  const incoterm = oneOf(obj.incoterm, INCOTERMS)
  const scenarios = Array.isArray(obj.scenarios)
    ? (obj.scenarios.map((s) => oneOf(s, INCOTERMS)).filter((s): s is Incoterm => s !== null))
    : []
  return {
    understood: obj.understood === true,
    productName: str(obj.productName),
    brand: str(obj.brand),
    model: str(obj.model),
    fuelType: oneOf(obj.fuelType, FUELS),
    engineCC: num(obj.engineCC),
    origin: oneOf(obj.origin, ORIGINS),
    incoterm,
    scenarios,
    fob: num(obj.fob),
    freightInternational: num(obj.freightInternational),
    quantity: num(obj.quantity),
    clientName: str(obj.clientName),
    language: str(obj.language),
    marginPercent: pct(obj.marginPercent),
    note: str(obj.note) ?? '',
  }
}

export const QUOTE_SPEC_SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade — comercio MAYORISTA (B2B).
Tu ÚNICA tarea aquí es convertir la petición del operador de armar una COTIZACIÓN en JSON estructurado.
NO calcules costo ni precio — el sistema corre el motor SUNAT del Perú con las tasas de la lane. Solo
EXTRAE lo que el operador diga explícitamente; deja en null todo lo que NO diga.

Reglas FIRMES:
- NUNCA inventes un FOB, un flete ni una tasa. Si el operador no lo dice → null (el sistema lo marca
  "requiere verificación" y bloquea la aprobación).
- Convierte porcentajes a fracción (22% → 0.22). Miles con separador → entero (78,400 → 78400).
- toneladas a kg si aplica. Idioma del cliente: 'es' | 'en' (según a quién va dirigida la cotización).
- Extrae el cliente si lo nombran (clientHint) y los incoterms a mostrar (scenarios).

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "productName": string|null,
  "brand": string|null,
  "model": string|null,
  "fuelType": "gasoline"|"diesel"|"hybrid"|"electric"|null,
  "engineCC": number|null,
  "origin": "china"|"other"|null,
  "incoterm": "EXW"|"FOB"|"CFR"|"CIF"|null,
  "scenarios": ("EXW"|"FOB"|"CFR"|"CIF")[],   // incoterms a mostrar; [] → solo el incoterm base
  "fob": number|null,                          // valor FOB/CIF del equipo en USD
  "freightInternational": number|null,         // flete internacional en USD si lo dan
  "quantity": number|null,
  "clientName": string|null,
  "language": "es"|"en"|null,
  "marginPercent": number|null,                // margen objetivo (22 = 22%)
  "note": string                               // nota breve en el idioma del operador
}
Si el mensaje NO pide armar una cotización, devuelve understood=false con una "note" breve.`

/** One model call → a normalized QuoteSpec (uses the reasoning tier for accuracy). */
export async function extractQuoteSpec(client: IntelligenceClient, text: string): Promise<QuoteSpec> {
  const raw = await client.complete({
    model: INTELLIGENCE_MODELS.reason,
    system: QUOTE_SPEC_SYSTEM,
    user: text,
    maxTokens: 700,
  })
  return parseQuoteSpec(raw)
}
