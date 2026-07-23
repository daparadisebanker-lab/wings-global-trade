// Scenario Ledger Stage 1 — provenance of an inherited (chained) artifact.
// When a follow-up ask seeds from a prior canvas artifact, these helpers name the
// fields that were INHERITED (they deviate from the app defaults AND were not
// restated in this message) so the artifact can exhibit its lineage:
//   "Heredado del lienzo #1: FOB 8,000 · TC 3.85 · Ad Val 6.0% · Flete 2,500"
// Each field is a localized descriptor ({ es, en }) so the header keeps ES/EN parity;
// values are grouped like the money() strips they sit beside. Pure + display-only —
// the numbers themselves come from the deterministic engine, and every field is
// validated here (finite numbers, whitelisted enums) so a guard-passing but junk
// client context can never render "TC undefined" or an arbitrary string as fact.
import type { ImportInputs, Incoterm, FuelType } from '@/lib/costing/types'
import type { ContainerKind } from '@/lib/actions/containers-types'
import type { Localized } from '@/lib/i18n'
import type { ContainerFitInput } from './container-fit'

const INCOTERM_SET: ReadonlySet<string> = new Set<Incoterm>(['EXW', 'FOB', 'CFR', 'CIF'])
const FUEL_SET: ReadonlySet<string> = new Set<FuelType>(['hybrid', 'gasoline', 'diesel', 'electric'])

/** en-US thousands grouping without forced decimals, matching the money() strips'
 *  separators for the same figure (e.g. 2500 → "2,500"). */
function group(n: number): string {
  return n.toLocaleString('en-US')
}
/** A locale-agnostic token (numbers, enum values, HS-style strings read identically
 *  in ES and EN). */
const same = (s: string): Localized => ({ es: s, en: s })

/** Localized descriptors for the costing inputs inherited from the canvas (deviate
 *  from `defaults` and not in `stated`). Order = the operator's mental order: base
 *  price, then the rates, then the chain. Every value is validated before it is
 *  emitted — a non-finite number or an out-of-enum incoterm/fuel is dropped, never
 *  stringified into the header. */
export function inheritedCostingLabels(
  inputs: ImportInputs,
  defaults: ImportInputs,
  stated: ReadonlySet<string>,
): Localized[] {
  const out: Localized[] = []
  const consider = (key: keyof ImportInputs, make: () => Localized | null) => {
    if (stated.has(key as string) || inputs[key] === defaults[key]) return
    const label = make()
    if (label) out.push(label)
  }
  // The base price the whole calc rides on — the load-bearing inherited number.
  consider('fob', () => (Number.isFinite(inputs.fob) ? same(`FOB ${group(inputs.fob)}`) : null))
  consider('exchangeRate', () => (Number.isFinite(inputs.exchangeRate) ? same(`TC ${inputs.exchangeRate}`) : null))
  consider('adValoremRate', () =>
    Number.isFinite(inputs.adValoremRate) ? same(`Ad Val ${(inputs.adValoremRate * 100).toFixed(1)}%`) : null,
  )
  consider('incoterm', () => (INCOTERM_SET.has(inputs.incoterm) ? same(String(inputs.incoterm)) : null))
  consider('fuelType', () => (FUEL_SET.has(inputs.fuelType) ? same(String(inputs.fuelType)) : null))
  consider('engineCC', () =>
    Number.isFinite(inputs.engineCC) && inputs.engineCC > 0 ? same(`${inputs.engineCC} cc`) : null,
  )
  // Freight only matters (and is only shown) under EXW/FOB; under CFR/CIF it's inside
  // the stated value and the engine ignores it.
  if (inputs.incoterm === 'EXW' || inputs.incoterm === 'FOB') {
    consider('freightInternational', () =>
      Number.isFinite(inputs.freightInternational)
        ? { es: `Flete ${group(inputs.freightInternational)}`, en: `Freight ${group(inputs.freightInternational)}` }
        : null,
    )
  }
  return out
}

/** Localized descriptors for the container-fit inputs inherited from the canvas.
 *  `stated` uses per-dimension keys (`itemLengthM`/`itemWidthM`/`itemHeightM`) so a
 *  follow-up that restates one dimension still discloses the two it inherited. The
 *  container kind is disclosed only when it genuinely came from the canvas (equals
 *  `ctxKind`, was not restated, and is not the app fallback `defaultKind`) — the
 *  default `40HC` is never labelled as "inherited". */
export function inheritedFitLabels(
  input: ContainerFitInput,
  stated: ReadonlySet<string>,
  ctxKind: ContainerKind | null,
  defaultKind: ContainerKind,
): Localized[] {
  const out: Localized[] = []
  const allDimsStated =
    stated.has('itemLengthM') && stated.has('itemWidthM') && stated.has('itemHeightM')
  if (!allDimsStated && input.itemLengthM > 0 && input.itemWidthM > 0 && input.itemHeightM > 0) {
    const dims = `${input.itemLengthM}×${input.itemWidthM}×${input.itemHeightM}`
    out.push({ es: `Caja ${dims} m`, en: `Box ${dims} m` })
  }
  if (
    !stated.has('containerKind') &&
    ctxKind !== null &&
    input.containerKind === ctxKind &&
    input.containerKind !== defaultKind
  ) {
    out.push(same(String(input.containerKind)))
  }
  if (!stated.has('quantity') && input.quantity != null && input.quantity > 0) {
    out.push({ es: `${input.quantity} uds`, en: `${input.quantity} units` })
  }
  if (!stated.has('weightEachKg') && input.weightEachKg != null && input.weightEachKg > 0) {
    out.push({ es: `${input.weightEachKg} kg c/u`, en: `${input.weightEachKg} kg ea` })
  }
  return out
}

/** A safe integer seq for the source-artifact badge, or undefined if the client sent junk. */
export function safeSeq(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isInteger(v) && v > 0 && v < 100_000 ? v : undefined
}
