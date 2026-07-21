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
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { FuelType, ImportInputs, ImportResult, Incoterm } from '@/lib/costing/types'
import { textResult, type Capability, type CopilotResult } from '../types'

// ── Solver (PURE — no model, no SDK: unit-tested in reverse-quote.test.ts) ────

/** Which margin the operator is targeting. */
export type MarginKind = 'bruto' | 'neto_caja'

/** Convergence band for the numeric solve: 0.1 percentage points. */
export const MARGIN_TOLERANCE = 0.001

/** The solved answer — the price plus the margin the engine actually achieves at it. */
export interface ReverseQuoteSolution {
  /** Final sale price incl. IGV ventas, USD — the number quoted to the buyer. */
  salePrice: number
  /** Margin the engine achieves at `salePrice`, as a decimal fraction. */
  achievedPct: number
  /** The full engine result at the solved price (landed, cash outlay, taxes…). */
  result: ImportResult
}

/** Read the requested margin off an engine result as a decimal fraction. */
function readMargin(result: ImportResult, kind: MarginKind): number {
  return kind === 'bruto' ? result.margenBrutoPct : result.margenNetoCajaPct
}

/**
 * Solve for the sale price that hits `targetPct` (decimal fraction) of the given
 * margin kind, against `baseInputs` (whose margin fields are overwritten here).
 * Gross → direct engine input; net-cash → bisection. Always returns the engine's
 * own achieved margin at the solved price, so the caller can show honestly how
 * close it landed (the net-cash band, or the gross floor, can bind).
 */
export function solveSalePriceForMargin(
  baseInputs: ImportInputs,
  marginKind: MarginKind,
  targetPct: number,
): ReverseQuoteSolution {
  // Gross margin is a native engine input → solve in one shot.
  if (marginKind === 'bruto') {
    const result = computeImportCost({
      ...baseInputs,
      marginMode: 'percent',
      marginPercent: targetPct,
    })
    return { salePrice: result.salePriceFinal, achievedPct: result.margenBrutoPct, result }
  }

  // Net-cash margin is only an engine OUTPUT → bisection on the final sale price.
  // landedCost is independent of the sale price, so one probe bounds the search.
  const landed = computeImportCost({
    ...baseInputs,
    marginMode: 'target_price',
    targetSalePrice: baseInputs.fob,
  }).landedCost

  let lo = landed
  let hi = landed * 5
  let result = computeImportCost({
    ...baseInputs,
    marginMode: 'target_price',
    targetSalePrice: hi,
  })

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    result = computeImportCost({ ...baseInputs, marginMode: 'target_price', targetSalePrice: mid })
    const achieved = readMargin(result, marginKind)
    if (Math.abs(achieved - targetPct) <= MARGIN_TOLERANCE) break
    // Margin rises monotonically with the sale price.
    if (achieved < targetPct) lo = mid
    else hi = mid
  }

  return { salePrice: result.salePriceFinal, achievedPct: readMargin(result, marginKind), result }
}

// ── Renderer payload ─────────────────────────────────────────────────────────

/** What the 'reverse-quote' renderer draws — exported so the renderer casts to it. */
export interface ReverseQuoteData {
  marginKind: MarginKind
  /** Target margin, decimal fraction (e.g. 0.22). */
  targetPct: number
  /** Achieved margin at the solved price, decimal fraction. */
  achievedPct: number
  /** Whether the engine landed within 0.1pp of target (net-cash can be capped). */
  onTarget: boolean
  /** Final sale price incl. IGV ventas, USD. */
  salePrice: number
  landedCost: number
  cashOutlay: number
  fob: number
  incoterm: Incoterm
}

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
  "note": string                         // nota breve en español.
}

Reglas: "margen neto", "neto de caja", "net cash", "net margin" → "neto_caja".
"margen bruto", "bruto", "gross" → "bruto". Interpreta separadores de miles (78,400 → 78400).
Si la frase NO pide un precio de venta para un margen objetivo, devuelve understood=false con una "note" breve en español.`

const FUELS: readonly FuelType[] = ['gasoline', 'diesel', 'hybrid', 'electric']
const INCOTERMS: readonly Incoterm[] = ['EXW', 'FOB', 'CFR', 'CIF']

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}
/** Normalize a stated margin to a decimal fraction: 22 → 0.22, 0.22 → 0.22. */
function normalizePct(raw: number): number {
  return raw > 1 ? raw / 100 : raw
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
  async run(client: IntelligenceClient, text: string): Promise<CopilotResult> {
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

    const baseInputs: ImportInputs = {
      ...DEFAULT_INPUTS,
      fob,
      incoterm,
      fuelType: fuelOf(obj.fuelType),
      engineCC: num(obj.engineCC) ?? DEFAULT_INPUTS.engineCC,
    }

    const solution = solveSalePriceForMargin(baseInputs, marginKind, targetPct)

    const data: ReverseQuoteData = {
      marginKind,
      targetPct,
      achievedPct: solution.achievedPct,
      onTarget: Math.abs(solution.achievedPct - targetPct) <= MARGIN_TOLERANCE,
      salePrice: solution.salePrice,
      landedCost: solution.result.landedCost,
      cashOutlay: solution.result.cashOutlay,
      fob,
      incoterm,
    }

    return { renderer: 'reverse-quote', note, data }
  },
}
