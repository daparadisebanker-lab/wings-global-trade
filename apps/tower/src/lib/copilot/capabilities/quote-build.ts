// Capability: assemble a QUOTE PROPOSAL from a plain-Spanish deal description —
// the line items, quantities, and each line's UNIT PRICE, where every price
// carries a traceable basis. This is Phase 1 of the binding-proforma path: it
// PROPOSES and DISPLAYS a costed quote; it does NOT persist a quotes row. The
// binding act (create DRAFT quote → issue) stays a separate, human-gated seam.
//
// Governance (the whole point): the model never invents a number. Each line's
// unit price resolves from exactly one traceable source —
//   · 'costed'  → computeImportCost(...).salePriceFinal (the deterministic SUNAT
//                 engine, same one the landed-cost/reverse-quote capabilities use),
//                 given an operator-stated FOB + target margin;
//   · 'stated'  → a price the operator explicitly gave (model only transcribes);
//   · 'gap'     → left as [por cotizar] for a human to fill.
// Line totals are computed by the money layer (lineTotalMinor/addMinor), never by
// the model. resolveLine is PURE (computeImportCost is deterministic) → unit-tested.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { FuelType, Incoterm } from '@/lib/costing/types'
import { addMinor, lineTotalMinor } from '@/lib/money'
import { textResult, type Capability, type CopilotResult } from '../types'

// ── Renderer payload (PURE-resolver output; unit-tested) ─────────────────────

/** Where a line's unit price came from — never model invention. */
export type PriceBasis = 'costed' | 'stated' | 'gap'

export interface QuoteProposalLine {
  description: string
  quantity: number
  /** Integer minor units; null when the basis is a gap. */
  unitPriceMinor: number | null
  /** quantity × unitPrice, money-layer computed; null when the price is a gap. */
  lineTotalMinor: number | null
  basis: PriceBasis
  /** Short ES explanation of the basis, e.g. 'costo puesto + 22% margen'. */
  basisNote: string | null
}

export interface QuoteProposalData {
  currency: string
  incoterm: Incoterm | null
  /** The client/account the operator named — carried for the composer handoff. */
  clientHint: string | null
  lines: QuoteProposalLine[]
  /** Σ line totals; null when any line is a gap (an honest subtotal or none). */
  subtotalMinor: number | null
  hasGaps: boolean
}

// ── Raw model shape (per line) ───────────────────────────────────────────────
interface RawLine {
  description?: unknown
  quantity?: unknown
  statedUnitPrice?: unknown
  fob?: unknown
  marginPercent?: unknown
  fuelType?: unknown
  engineCC?: unknown
  incoterm?: unknown
}

const FUELS: readonly FuelType[] = ['gasoline', 'diesel', 'hybrid', 'electric']
const INCOTERMS: readonly Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) && n !== 0 ? n : null
  }
  return null
}
function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : null
}
function fuelOf(v: unknown): FuelType {
  return FUELS.includes(v as FuelType) ? (v as FuelType) : DEFAULT_INPUTS.fuelType
}
function incotermOf(v: unknown, fallback: Incoterm): Incoterm {
  return INCOTERMS.includes(v as Incoterm) ? (v as Incoterm) : fallback
}
/** 22 → 0.22, 0.22 → 0.22. */
function normalizePct(raw: number): number {
  return raw > 1 ? raw / 100 : raw
}
/** Decimal major units → integer minor units (2-decimal currency). */
function toMinor(major: number): number {
  return Math.round(major * 100)
}

/**
 * PURE: one raw model line → a resolved proposal line. Deterministic — the only
 * non-model input is computeImportCost, itself pure — so this is unit-testable
 * without a network or key. A line prices via exactly one basis; when neither a
 * stated price nor a (fob + margin) pair is present, it is an explicit gap.
 */
export function resolveLine(raw: RawLine, quoteIncoterm: Incoterm): QuoteProposalLine {
  const description = str(raw.description) ?? '—'
  const quantity = Math.max(1, Math.round(num(raw.quantity) ?? 1))

  const stated = num(raw.statedUnitPrice)
  const fob = num(raw.fob)
  const marginRaw = num(raw.marginPercent)

  let unitPriceMinor: number | null = null
  let basis: PriceBasis = 'gap'
  let basisNote: string | null = 'por cotizar'

  if (stated !== null && stated > 0) {
    unitPriceMinor = toMinor(stated)
    basis = 'stated'
    basisNote = 'precio indicado'
  } else if (fob !== null && fob > 0 && marginRaw !== null) {
    // Costed: the deterministic SUNAT engine owns the number.
    const targetPct = normalizePct(marginRaw)
    const result = computeImportCost({
      ...DEFAULT_INPUTS,
      fob,
      incoterm: incotermOf(raw.incoterm, quoteIncoterm),
      fuelType: fuelOf(raw.fuelType),
      engineCC: num(raw.engineCC) ?? DEFAULT_INPUTS.engineCC,
      marginMode: 'percent',
      marginPercent: targetPct,
    })
    unitPriceMinor = toMinor(result.salePriceFinal)
    basis = 'costed'
    basisNote = `costo puesto + ${Math.round(targetPct * 100)}% margen`
  }

  return {
    description,
    quantity,
    unitPriceMinor,
    lineTotalMinor: unitPriceMinor !== null ? lineTotalMinor(unitPriceMinor, quantity) : null,
    basis,
    basisNote,
  }
}

/**
 * PURE: model text → a full proposal, or null when there's nothing to quote.
 * Resolves every line and computes the subtotal via the money layer — but only
 * when no line is a gap (an honest subtotal, or none at all).
 */
export function buildQuoteProposal(raw: string): QuoteProposalData | null {
  const obj = extractJsonObject(raw)
  if (!obj || obj.understood !== true) return null

  const rawLines = Array.isArray(obj.lines) ? (obj.lines as RawLine[]) : []
  if (rawLines.length === 0) return null

  const currency = str(obj.currency)?.toUpperCase() ?? 'USD'
  const incoterm = incotermOf(obj.incoterm, 'FOB')
  const lines = rawLines.map((l) => resolveLine(l, incoterm))
  const hasGaps = lines.some((l) => l.basis === 'gap')

  const subtotalMinor =
    hasGaps || lines.length === 0
      ? null
      : addMinor(lines.map((l) => ({ minor: l.lineTotalMinor as number, currency }))).minor

  return {
    currency,
    incoterm,
    clientHint: str(obj.clientHint),
    lines,
    subtotalMinor,
    hasGaps,
  }
}

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade — comercio MAYORISTA (B2B). Tu tarea es
ARMAR la propuesta de una COTIZACIÓN a partir de la descripción del operador: los renglones (líneas),
sus cantidades y la BASE de precio de cada uno. NO calcules el precio final — el sistema corre el motor
de costos. Tu trabajo es extraer la estructura y de dónde sale cada precio.

REGLAS FIRMES:
- NUNCA inventes un precio. Para cada línea, da SOLO UNA de estas bases:
  · statedUnitPrice: si el operador dio un precio unitario explícito → ponlo (solo el número).
  · fob + marginPercent: si el operador quiere costear (dio un FOB y un margen objetivo) → pon ambos.
  · ninguno de los dos: déjalos en null (el sistema lo marca "por cotizar").
- Tono mayorista. Prohibido vocabulario retail (carrito, comprar, oferta por tiempo limitado).
- Extrae el cliente/cuenta si lo nombran (clientHint), la moneda y el incoterm.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "clientHint": string|null,
  "currency": string|null,          // p.ej. "USD"; null → USD
  "incoterm": "EXW"|"FOB"|"CFR"|"CIF"|null,
  "lines": [
    {
      "description": string,
      "quantity": number,
      "statedUnitPrice": number|null,   // precio unitario si el operador lo dio
      "fob": number|null,               // costo base para costear la línea
      "marginPercent": number|null,     // margen objetivo (ej. 22 para 22%)
      "fuelType": "gasoline"|"diesel"|"hybrid"|"electric"|null,  // para el ISC al costear
      "engineCC": number|null,
      "incoterm": "EXW"|"FOB"|"CFR"|"CIF"|null
    }
  ],
  "note": string                      // nota breve en español para el operador
}

Reglas de unidades: porcentajes tal cual (22 = 22%), separadores de miles (78,400 → 78400).
Si el mensaje NO pide armar una cotización, devuelve understood=false con una "note" breve.`

export const quoteBuildCapability: Capability = {
  id: 'quote-build',
  router: {
    description:
      'Armar la propuesta de una cotización mayorista: renglones, cantidades y precios (costeados con el motor, indicados por el operador, o por cotizar).',
    examples: [
      'Cotiza 200 scooters eléctricos a 22% de margen sobre un FOB de 128',
      'Ármame una cotización: 50 generadores diésel a 8,500 cada uno para este cliente',
      'Quote 100 forklifts, cost them at 18% margin over 14,000 FOB',
    ],
  },
  async run(client: IntelligenceClient, text: string): Promise<CopilotResult> {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: text,
      maxTokens: 1100,
    })
    const obj = extractJsonObject(raw)
    const note = str(obj?.note) ?? ''

    const data = buildQuoteProposal(raw)
    if (!data) {
      return textResult(
        note ||
          'Dime los renglones (qué y cuánto) y el precio o el margen de cada uno, y te armo la cotización. / Give me the line items (what and how many) and each one’s price or margin, and I’ll build the quote.',
      )
    }

    return { renderer: 'quote-proposal', note, data }
  },
}
