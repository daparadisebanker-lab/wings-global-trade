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

/** Deltas between a child artifact and its parent of the SAME renderer, read
 *  straight off both stored payloads. Signed, tabular; the sign is exhibited, not
 *  judged (no color meaning — a bigger landed cost is not "bad" here). Returns []
 *  when the two artifacts are different kinds (nothing comparable) or a payload is
 *  missing a field. */
export function deltasFor(renderer: string, child: unknown, parent: unknown): Delta[] {
  if (!child || !parent) return []
  if (renderer === 'landed-cost') {
    const c = child as LandedCostData
    const p = parent as LandedCostData
    if (!Number.isFinite(c.landedCost) || !Number.isFinite(p.landedCost)) return []
    return [
      { label: { es: 'Costo puesto', en: 'Landed cost' }, value: signedMoney(c.landedCost - p.landedCost) },
      { label: { es: 'Precio final', en: 'Final price' }, value: signedMoney(c.salePriceFinal - p.salePriceFinal) },
    ]
  }
  if (renderer === 'reverse-quote') {
    const c = child as ReverseQuoteData
    const p = parent as ReverseQuoteData
    if (!Number.isFinite(c.salePrice) || !Number.isFinite(p.salePrice)) return []
    return [
      { label: { es: 'Precio de venta', en: 'Sale price' }, value: signedMoney(c.salePrice - p.salePrice) },
      { label: { es: 'Margen', en: 'Margin' }, value: signedPp((c.achievedPct - p.achievedPct) * 100) },
    ]
  }
  if (renderer === 'fit') {
    const c = child as ContainerFitResult
    const p = parent as ContainerFitResult
    if (!Number.isFinite(c.units) || !Number.isFinite(p.units)) return []
    return [
      { label: { es: 'Unidades', en: 'Units' }, value: signedInt(c.units - p.units) },
      { label: { es: 'Volumen', en: 'Volume' }, value: signedPp(c.cbmUsedPct - p.cbmUsedPct) },
    ]
  }
  return []
}
