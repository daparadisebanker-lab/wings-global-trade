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
import { inheritedCostingLabels, safeSeq } from '../canvas-seed'
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
  "marginPct": number|null,             // el margen objetivo tal como lo dijo el operador (ej. 22 para 22%); null si no lo repite
  "marginKind": "bruto"|"neto_caja"|null, // null si el operador no lo aclara (se hereda del lienzo, o "bruto" por defecto)
  "fob": number|null,                    // el costo base declarado (FOB, o el valor CFR/CIF/EXW). null si no lo dieron.
  "incoterm": "EXW"|"FOB"|"CFR"|"CIF"|null, // null si el operador no lo menciona
  "fuelType": "gasoline"|"diesel"|"hybrid"|"electric"|null,  // null si el operador no lo menciona
  "engineCC": number|null,               // cilindrada del motor para el ISC; null si no aplica.
  "note": string                         // nota breve EN EL IDIOMA de la frase del operador (español o inglés).
}

Reglas: "margen neto", "neto de caja", "net cash", "net margin" → "neto_caja".
"margen bruto", "bruto", "gross" → "bruto". Interpreta separadores de miles (78,400 → 78400).
En una PREGUNTA DE SEGUIMIENTO el operador puede cambiar UN SOLO campo ("¿y con 25%?", "¿y sobre un
FOB de 50,000?"); deja en null todo lo que NO repita — el sistema hereda el resto del lienzo.
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
// Nullable so run() can tell "operator stated it" from "operator left it unset"
// (and inherit the canvas value on a follow-up) rather than force a default.
function fuelOf(v: unknown): FuelType | null {
  return FUELS.includes(v as FuelType) ? (v as FuelType) : null
}
function incotermOf(v: unknown): Incoterm | null {
  return INCOTERMS.includes(v as Incoterm) ? (v as Incoterm) : null
}
function marginKindOf(v: unknown): MarginKind | null {
  return v === 'neto_caja' ? 'neto_caja' : v === 'bruto' ? 'bruto' : null
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

    // Chained ask: inherit the canvas's tuned base from the artifact the operator
    // was on, else the app SUNAT defaults. Resolve BEFORE the guards so a follow-up
    // that keeps the price or the margin need not restate it.
    const ctxBase = context?.kind === 'costing' ? context.inputs : null

    const statedFob = num(obj.fob)
    const effFob = statedFob !== null && statedFob > 0 ? statedFob : ctxBase && ctxBase.fob > 0 ? ctxBase.fob : null
    if (effFob === null) {
      return textResult(
        'Necesito el costo base (FOB, o el valor CIF/CFR). / I need the cost basis (FOB, or the CIF/CFR value).',
      )
    }

    const statedMargin = num(obj.marginPct)
    // Inherit a gross target from the canvas (net-cash pins a price, not a %, so it
    // is not inheritable as a margin — the operator restates it).
    const ctxTargetPct = ctxBase && ctxBase.marginMode === 'percent' && ctxBase.marginPercent > 0 ? ctxBase.marginPercent : null
    const targetPct = statedMargin !== null && statedMargin !== 0 ? normalizePct(statedMargin) : ctxTargetPct
    if (targetPct === null || targetPct === 0) {
      return textResult(
        '¿Qué margen objetivo? Dame el % (bruto o neto de caja). / What target margin? Give me the % (gross or net-cash).',
      )
    }

    // Merge context OVER defaults so a partial/hostile context can never leave a
    // required field undefined reaching the engine.
    const base = ctxBase ? { ...DEFAULT_INPUTS, ...ctxBase } : DEFAULT_INPUTS
    // Inherit incoterm / fuel / margin-kind when the follow-up doesn't restate them.
    const marginKind: MarginKind =
      marginKindOf(obj.marginKind) ?? (ctxBase?.marginMode === 'target_price' ? 'neto_caja' : 'bruto')
    const incoterm = incotermOf(obj.incoterm) ?? base.incoterm
    const fuelType = fuelOf(obj.fuelType) ?? base.fuelType

    const baseInputs: ImportInputs = {
      ...base,
      fob: effFob,
      incoterm,
      fuelType,
      engineCC: num(obj.engineCC) ?? base.engineCC,
    }

    // One source of truth for the payload (and the commit inputs the editor uses),
    // so the displayed price and any saved cost sheet can never drift.
    const { data } = solveReverseQuote(baseInputs, marginKind, targetPct)

    // Provenance: which cost inputs were inherited from the canvas this ask chained off.
    const stated = new Set<string>()
    if (statedFob !== null && statedFob > 0) stated.add('fob')
    if (incotermOf(obj.incoterm) !== null) stated.add('incoterm')
    if (fuelOf(obj.fuelType) !== null) stated.add('fuelType')
    if (num(obj.engineCC) !== null) stated.add('engineCC')
    const seq = safeSeq(context?.sourceSeq)
    if (ctxBase && seq !== undefined && data.input) {
      const fields = inheritedCostingLabels(data.input, DEFAULT_INPUTS, stated)
      if (fields.length) data.seededFrom = { seq, fields }
    }

    return { renderer: 'reverse-quote', note, data }
  },
}
