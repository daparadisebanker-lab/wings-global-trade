// Scenario Ledger Stage 2 — pure lineage logic (no React), so the parent-edge
// derivation and the parent→child deltas are unit-testable. The numbers all come
// from the two stored, deterministic payloads; nothing here recomputes the engine.
import type { Localized } from '@/lib/i18n'
import type { LandedCostData } from '@/lib/copilot/capabilities/landed-cost'
import type { ReverseQuoteData } from '@/lib/copilot/capabilities/reverse-quote'
import type { ContainerFitResult } from '@/lib/copilot/container-fit'

export type Delta = { label: Localized; value: string }

/** The seq of the artifact a child chained off, or null. Guards spoofed/stale seqs:
 *  a parent must be a positive integer strictly earlier than the child (seqs are
 *  contiguous per session, assigned by arrival order). */
export function deriveParentSeq(raw: unknown, childSeq: number): number | null {
  return typeof raw === 'number' && Number.isInteger(raw) && raw > 0 && raw < childSeq ? raw : null
}

const signedMoney = (n: number): string =>
  n.toLocaleString('en-US', { signDisplay: 'exceptZero', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const signedInt = (n: number): string =>
  n.toLocaleString('en-US', { signDisplay: 'exceptZero', maximumFractionDigits: 0 })
const signedPp = (n: number): string =>
  `${n.toLocaleString('en-US', { signDisplay: 'exceptZero', maximumFractionDigits: 1 })} pp`

/** Build one delta only when BOTH operands are finite — an older/partial payload
 *  missing a field drops that chip rather than rendering "NaN" as a figure. */
function delta(label: Localized, a: number, b: number, fmt: (n: number) => string): Delta | null {
  return Number.isFinite(a) && Number.isFinite(b) ? { label, value: fmt(a - b) } : null
}

/** The single lead comparable figure for a renderer (Scenario Ledger Stage 3) — a
 *  compact headline delta for the switcher chip: landed-cost → Δ landed cost;
 *  reverse-quote → Δ sale price; fit → Δ units. null when not comparable/finite. */
export function headlineDelta(renderer: string, child: unknown, base: unknown): Delta | null {
  if (!child || !base) return null
  if (renderer === 'landed-cost') {
    return delta(
      { es: 'Costo puesto', en: 'Landed cost' },
      (child as LandedCostData).landedCost,
      (base as LandedCostData).landedCost,
      signedMoney,
    )
  }
  if (renderer === 'reverse-quote') {
    return delta(
      { es: 'Precio de venta', en: 'Sale price' },
      (child as ReverseQuoteData).salePrice,
      (base as ReverseQuoteData).salePrice,
      signedMoney,
    )
  }
  if (renderer === 'fit') {
    return delta({ es: 'Unidades', en: 'Units' }, (child as ContainerFitResult).units, (base as ContainerFitResult).units, signedInt)
  }
  return null
}

/** Deltas between a child artifact and its parent of the SAME renderer, read
 *  straight off both stored payloads. Signed, tabular; the sign is exhibited, not
 *  judged (no color meaning — a bigger landed cost is not "bad" here). Returns []
 *  when the two artifacts are different kinds (nothing comparable); individual
 *  chips drop when a payload lacks the field they compare. */
export function deltasFor(renderer: string, child: unknown, parent: unknown): Delta[] {
  if (!child || !parent) return []
  if (renderer === 'landed-cost') {
    const c = child as LandedCostData
    const p = parent as LandedCostData
    return [
      delta({ es: 'Costo puesto', en: 'Landed cost' }, c.landedCost, p.landedCost, signedMoney),
      // Matches the card's row for the same figure (avoids "Final price" vs "Sale price (final)").
      delta({ es: 'Precio de venta', en: 'Sale price' }, c.salePriceFinal, p.salePriceFinal, signedMoney),
    ].filter((d): d is Delta => d !== null)
  }
  if (renderer === 'reverse-quote') {
    const c = child as ReverseQuoteData
    const p = parent as ReverseQuoteData
    // achievedPct is relative to the payload's OWN marginKind (gross vs net-cash are
    // different measures) — compare it only when both scenarios use the same kind, so
    // a follow-up that switches kind never subtracts one measure from the other.
    const sameMargin = Boolean(c.marginKind) && c.marginKind === p.marginKind
    return [
      delta({ es: 'Precio de venta', en: 'Sale price' }, c.salePrice, p.salePrice, signedMoney),
      sameMargin ? delta({ es: 'Margen', en: 'Margin' }, c.achievedPct * 100, p.achievedPct * 100, signedPp) : null,
    ].filter((d): d is Delta => d !== null)
  }
  if (renderer === 'fit') {
    const c = child as ContainerFitResult
    const p = parent as ContainerFitResult
    return [
      delta({ es: 'Unidades', en: 'Units' }, c.units, p.units, signedInt),
      delta({ es: 'Volumen', en: 'Volume' }, c.cbmUsedPct, p.cbmUsedPct, signedPp),
    ].filter((d): d is Delta => d !== null)
  }
  return []
}
