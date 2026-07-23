// Scenario Ledger Stage 1 — provenance of an inherited (chained) artifact.
// When a follow-up ask seeds from a prior canvas artifact, these helpers name the
// fields that were INHERITED (they deviate from the app defaults AND were not
// restated in this message) so the artifact can exhibit its lineage:
//   "Heredado del lienzo #1: TC 3.85 · Ad Val 6.0% · Flete 2,500"
// Pure + display-only — the numbers themselves come from the deterministic engine.
import type { ImportInputs } from '@/lib/costing/types'
import type { ContainerFitInput } from './container-fit'

/** Labels for the costing inputs inherited from the canvas (deviate from `defaults`
 *  and not in `stated`). Order = the operator's mental order (rates, then chain). */
export function inheritedCostingLabels(
  inputs: ImportInputs,
  defaults: ImportInputs,
  stated: ReadonlySet<string>,
): string[] {
  const out: string[] = []
  const consider = (key: keyof ImportInputs, label: string) => {
    if (!stated.has(key as string) && inputs[key] !== defaults[key]) out.push(label)
  }
  consider('exchangeRate', `TC ${inputs.exchangeRate}`)
  consider('adValoremRate', `Ad Val ${(inputs.adValoremRate * 100).toFixed(1)}%`)
  consider('incoterm', String(inputs.incoterm))
  consider('fuelType', String(inputs.fuelType))
  // Freight only matters (and is only shown) under EXW/FOB; under CFR/CIF it's inside
  // the stated value and the engine ignores it.
  if (inputs.incoterm === 'EXW' || inputs.incoterm === 'FOB') {
    consider('freightInternational', `Flete ${inputs.freightInternational}`)
  }
  return out
}

/** Labels for the container-fit inputs inherited from the canvas. `stated` uses the
 *  synthetic key 'box' for the L×W×H triple (the model states them together). */
export function inheritedFitLabels(input: ContainerFitInput, stated: ReadonlySet<string>): string[] {
  const out: string[] = []
  if (!stated.has('box') && input.itemLengthM > 0 && input.itemWidthM > 0 && input.itemHeightM > 0) {
    out.push(`Caja ${input.itemLengthM}×${input.itemWidthM}×${input.itemHeightM} m`)
  }
  if (!stated.has('containerKind')) out.push(String(input.containerKind))
  if (!stated.has('weightEachKg') && input.weightEachKg && input.weightEachKg > 0) {
    out.push(`${input.weightEachKg} kg c/u`)
  }
  return out
}

/** A safe integer seq for the source-artifact badge, or undefined if the client sent junk. */
export function safeSeq(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isInteger(v) && v > 0 && v < 100_000 ? v : undefined
}
