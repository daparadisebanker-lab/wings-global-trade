'use client'

// MisterLineage — Scenario Ledger Stage 2. Turns Stage 1's provenance stamp into
// an interactive edge on the CANVAS (the primary surface, where the editors don't
// render the seededFrom header): the artifact discloses the scenario it chained
// off — a click jumps to that parent — and when parent and child are the same kind,
// a delta row exhibits what the inherited change did to the money (Δ landed cost,
// Δ sale price, Δ units). Deltas compare against the parent's headline AS INHERITED
// (seededFrom.baseline, captured at chain time), falling back to the parent's stored
// payload only when no baseline travelled. Display-only.
import { t } from '@/lib/i18n'
import type { SeededFrom } from '@/lib/copilot/types'
import { useMister, type ArtifactEntry } from './MisterProvider'
import { deltasFor } from './lineage'

export function MisterLineage({ entry, onJump }: { entry: ArtifactEntry; onJump?: () => void }) {
  const { locale, artifacts, selectArtifact } = useMister()
  if (entry.parentSeq == null) return null
  const parent = artifacts.find((a) => a.seq === entry.parentSeq)
  if (!parent) return null

  const seeded = (entry.result.data as { seededFrom?: SeededFrom } | undefined)?.seededFrom
  const sameKind = parent.result.renderer === entry.result.renderer
  // Compare against the state the child inherited (baseline captured at chain time),
  // not the parent's possibly-retuned stored payload.
  const baseline = seeded?.baseline
  const deltas = sameKind ? deltasFor(entry.result.renderer, entry.result.data, baseline ?? parent.result.data) : []

  function jump() {
    selectArtifact(parent!.seq)
    onJump?.() // keep keyboard focus on the canvas the operator just jumped to
  }

  return (
    <div className="ck-lineage">
      {/* Visible text is the accessible name (fields included) — no aria-label override
          (WCAG 2.5.3). The ← leads, matching the switcher's parent-edge tag. */}
      <button type="button" className="ck-lineage-to" onClick={jump}>
        <span aria-hidden className="arrow">
          ←
        </span>
        <span aria-hidden className="g" />
        <span>
          {t({ es: 'Heredado del lienzo', en: 'Inherited from canvas' }, locale)} #{parent.seq}
          {seeded && seeded.fields.length ? `: ${seeded.fields.map((f) => t(f, locale)).join(' · ')}` : ''}
        </span>
      </button>

      {deltas.length ? (
        <div
          className="ck-deltas"
          role="group"
          aria-label={t({ es: 'Cambios frente al origen', en: 'Changes vs source' }, locale)}
        >
          {deltas.map((d, i) => (
            <span key={i} className="ck-delta">
              <span className="dl">Δ {t(d.label, locale)}</span>
              <span className="dv">{d.value}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
