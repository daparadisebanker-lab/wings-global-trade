// Pure reverse-quote solver — engine-authoritative, SDK-free, CLIENT-SAFE.
// Split out of capabilities/reverse-quote.ts (Fable review finding 7/8): that
// module also carries the LLM extraction prompt and a type-only IntelligenceClient
// import, so value-importing the solver from a 'use client' editor risked dragging
// the AI client graph toward the browser bundle. The solver has no such deps — its
// only runtime import is the pure SUNAT engine — so it lives here, and the
// capability re-exports it (tests + renderers import from the capability unchanged).
import { computeImportCost } from '@/lib/costing/engine'
import type { ImportInputs, ImportResult, Incoterm } from '@/lib/costing/types'
import type { SeededFrom } from './types'

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
  /** The base cost inputs behind the solve — lets the canvas editor seed its
   *  controls, re-solve, and commit a cost sheet. Optional so consumers guard it
   *  (older payloads / read-only renderer ignore it). */
  input?: ImportInputs
  /** Provenance when this result inherited numbers from a prior canvas artifact. */
  seededFrom?: SeededFrom
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

/**
 * Solve + package both the renderer payload AND the concrete inputs that reproduce
 * EXACTLY the solved price for persistence — the shared source of truth for the
 * capability's run() and the canvas editor, so the displayed price and the saved
 * cost sheet can never drift (Fable review finding 8). Gross pins marginPercent;
 * net-cash pins the target sale price the bisection converged to.
 */
export function solveReverseQuote(
  baseInputs: ImportInputs,
  marginKind: MarginKind,
  targetPct: number,
): { data: ReverseQuoteData; commitInputs: ImportInputs } {
  const solution = solveSalePriceForMargin(baseInputs, marginKind, targetPct)
  const data: ReverseQuoteData = {
    marginKind,
    targetPct,
    achievedPct: solution.achievedPct,
    onTarget: Math.abs(solution.achievedPct - targetPct) <= MARGIN_TOLERANCE,
    salePrice: solution.salePrice,
    landedCost: solution.result.landedCost,
    cashOutlay: solution.result.cashOutlay,
    fob: baseInputs.fob,
    incoterm: baseInputs.incoterm,
    input: baseInputs,
  }
  const commitInputs: ImportInputs =
    marginKind === 'bruto'
      ? { ...baseInputs, marginMode: 'percent', marginPercent: targetPct }
      : { ...baseInputs, marginMode: 'target_price', targetSalePrice: solution.salePrice }
  return { data, commitInputs }
}
