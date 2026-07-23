// Capability: reverse quote — the SALE PRICE that hits a target margin. The
// operator asks (in Spanish) "¿qué precio me da 22% de margen neto sobre este
// FOB?"; the model ONLY parses the sentence into params, and the deterministic
// solver below inverts the SUNAT costing engine to find the price. Renders
// through the 'reverse-quote' renderer.
//
// Two solve paths (both engine-authoritative — the arithmetic is never faked):
//  · GROSS margin (`bruto`) is a NATIVE engine input (marginMode 'percent'), so
//    we feed the target straight in and read `salePriceFinal` off the result.
//  · NET-CASH margin (`neto_caja`) is only an engine OUTPUT, so we solve for it
//    numerically — bisection on `targetSalePrice` (marginMode 'target_price'),
//    40 iterations over [landedCost … landedCost×5], until the achieved margin is
//    within 0.1pp of target. Bisection is engine-agnostic and monotonic here.

import { INTELLIGENCE_MODELS } from '@/lib/ai/types'
import { extractJsonObject } from '@/lib/ai/parse'
import type { IntelligenceClient } from '@/lib/ai/client'
import { DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { FuelType, ImportInputs, Incoterm } from '@/lib/costing/types'
import { solveReverseQuote, type MarginKind } from '../reverse-quote-solve'
import { textResult, type Capability, type CanvasContext, type CopilotResult } from '../types'

// The solver + payload types live in a pure, CLIENT-SAFE module so the canvas
// editor can import them without pulling this capability's LLM graph into the
// browser bundle (Fable review finding 7). Re-exported here so tests + renderers
// import from the capability unchanged.
export { MARGIN_TOLERANCE, solveSalePriceForMargin, solveReverseQuote } from '../reverse-quote-solve'
export type { MarginKind, ReverseQuoteSolution, ReverseQuoteData } from '../reverse-quote-solve'

// ── Extraction (model → params) ──────────────────────────────────────────────

const SYSTEM = `Eres Mister, el copiloto interno de Wings Global Trade. Tu única tarea aquí es
convertir una frase en español (o inglés) que pide el PRECIO DE VENTA necesario para alcanzar
un margen objetivo, en JSON estructurado. NO calcules el precio — solo extrae los parámetros;
el sistema resuelve la aritmética con el motor de costos SUNAT.

Responde SOLO con un objeto JSON, sin texto alrededor, con esta forma exacta:
{
  "understood": boolean,
  "marginPct": number|null,             // el margen objetivo tal como lo dijo el operador (ej. 22 para 22%)
  "marginKind": "bruto"|"neto_caja",    // "bruto"=margen bruto; "neto_caja"=margen neto de caja. Si no lo aclara, usa "bruto".
  "fob": number|null,                    // el costo base declarado (FOB, o el valor CFR/CIF/EXW). null si no lo dieron.
  "incoterm": "EXW"|"FOB"|"CFR"|"CIF",  // el incoterm del valor dado; usa "FOB" si no se especifica.
  "fuelType": "gasoline"|"diesel"|"hybrid"|"electric",  // para el ISC; usa "gasoline" si no se dice.
  "engineCC": number|null,               // cilindrada del motor para el ISC; null si no aplica.
  "note": string                         // nota breve EN EL IDIOMA de la frase del operador (español o inglés).
}

Reglas: "margen neto", "neto de caja", "net cash", "net margin" → "neto_caja".
"margen bruto", "bruto", "gross" → "bruto". Interpreta separadores de miles (78,400 → 78400).
Si la frase NO pide un precio de venta para un margen objetivo, devuelve understood=false con una "note" breve en español.`

const FUELS: readonly FuelType[] = ['gasoline', 'diesel', 'hybrid', 'electric']
const INCOTERMS: readonly Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
/** Normalize a stated margin to a decimal fraction by MAGNITUDE: 22 → 0.22,
 *  0.22 → 0.22, −5 → −0.05 (a negative net-cash target is legitimate). */
function normalizePct(raw: number): number {
  return Math.abs(raw) > 1 ? raw / 100 : raw
}
function fuelOf(v: unknown): FuelType {
  return FUELS.includes(v as FuelType) ? (v as FuelType) : DEFAULT_INPUTS.fuelType
}
function incotermOf(v: unknown): Incoterm {
  return INCOTERMS.includes(v as Incoterm) ? (v as Incoterm) : 'FOB'
}
function marginKindOf(v: unknown): MarginKind {
  return v === 'neto_caja' ? 'neto_caja' : 'bruto'
}

export const reverseQuoteCapability: Capability = {
  id: 'reverse-quote',
  router: {
    description:
      'Precio de venta inverso: qué precio alcanza un margen objetivo (bruto o neto de caja) sobre un costo dado.',
    examples: [
      '¿Qué precio de venta me da 22% de margen neto a este costo?',
      'Precio para 30% de margen bruto sobre un FOB de $78,400',
      'What sale price hits a 25% gross margin on a $40,000 CIF?',
    ],
  },
  async run(client: IntelligenceClient, text: string, _attachment, context?: CanvasContext): Promise<CopilotResult> {
    const raw = await client.complete({
      model: INTELLIGENCE_MODELS.reason,
      system: SYSTEM,
      user: text,
      maxTokens: 500,
    })
    const obj = extractJsonObject(raw)
    const note = typeof obj?.note === 'string' ? obj.note : ''

    if (!obj || obj.understood !== true) {
      return textResult(
        note ||
          'Dime el margen objetivo (bruto o neto de caja) y el costo base. / Tell me the target margin (gross or net-cash) and the cost basis.',
      )
    }

    const fob = num(obj.fob)
    if (fob === null || fob <= 0) {
      return textResult(
        'Necesito el costo base (FOB, o el valor CIF/CFR). / I need the cost basis (FOB, or the CIF/CFR value).',
      )
    }

    const marginRaw = num(obj.marginPct)
    if (marginRaw === null || marginRaw === 0) {
      return textResult(
        '¿Qué margen objetivo? Dame el % (bruto o neto de caja). / What target margin? Give me the % (gross or net-cash).',
      )
    }

    const marginKind = marginKindOf(obj.marginKind)
    const targetPct = normalizePct(marginRaw)
    const incoterm = incotermOf(obj.incoterm)

    // Chained ask: inherit the canvas's tuned base (Ad Valorem / TC / freight)
    // from the artifact the operator was on, else the app SUNAT defaults.
    const ctxBase = context?.kind === 'costing' ? context.inputs : DEFAULT_INPUTS
    const baseInputs: ImportInputs = {
      ...ctxBase,
      fob,
      incoterm,
      fuelType: fuelOf(obj.fuelType),
      engineCC: num(obj.engineCC) ?? ctxBase.engineCC,
    }

    // One source of truth for the payload (and the commit inputs the editor uses),
    // so the displayed price and any saved cost sheet can never drift.
    const { data } = solveReverseQuote(baseInputs, marginKind, targetPct)

    return { renderer: 'reverse-quote', note, data }
  },
}
