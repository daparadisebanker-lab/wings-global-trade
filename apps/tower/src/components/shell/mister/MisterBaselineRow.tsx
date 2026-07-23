'use client'

// MisterBaselineRow — Scenario Ledger Stage 3. When the operator has pinned a
// session baseline, every OTHER same-renderer artifact exhibits a second delta row
// on the canvas — "vs base #N" — so scenarios are compared against one common
// denominator (the deal on the table), not only pairwise against their parent.
// Display-only; deltas read off the current payload and the pinned baseline
// snapshot (captured at pin time). Suppressed when the pin IS this artifact's parent
// (the lineage row above already shows that comparison).
import { t } from '@/lib/i18n'
import { useMister, type ArtifactEntry } from './MisterProvider'
import { deltasFor } from './lineage'

export function MisterBaselineRow({ entry }: { entry: ArtifactEntry }) {
  const { locale, artifacts, pinnedSeq, pinnedBaseline } = useMister()
  if (pinnedSeq == null || pinnedSeq === entry.seq || pinnedSeq === entry.parentSeq) return null
  const pinned = artifacts.find((a) => a.seq === pinnedSeq)
  if (!pinned || pinned.result.renderer !== entry.result.renderer) return null

  const baseData = pinnedBaseline ?? pinned.result.data
  const deltas = deltasFor(entry.result.renderer, entry.result.data, baseData)
  if (!deltas.length) return null

  return (
    <div className="ck-lineage is-base">
      <span className="ck-base-tag">
        {t({ es: 'vs base', en: 'vs base' }, locale)} #{pinnedSeq}
      </span>
      <div
        className="ck-deltas"
        role="group"
        aria-label={t(
          { es: `Cambios frente a la base #${pinnedSeq}`, en: `Changes vs base #${pinnedSeq}` },
          locale,
        )}
      >
        {deltas.map((d, i) => (
          <span key={i} className="ck-delta is-base">
            <span className="dl">Δ {t(d.label, locale)}</span>
            <span className="dv">{d.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
