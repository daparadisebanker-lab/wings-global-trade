'use client'

// MisterLineage — Scenario Ledger Stage 2. Turns Stage 1's provenance stamp into
// an interactive edge on the CANVAS (the primary surface, where the editors don't
// render the seededFrom header): the artifact discloses the scenario it chained
// off — a click jumps to that parent — and when parent and child are the same kind,
// a delta row exhibits what the inherited change did to the money (Δ landed cost,
// Δ sale price, Δ units). Display-only; every figure comes from the two stored
// deterministic payloads.
import { t, type Localized } from '@/lib/i18n'
import { useMister, type ArtifactEntry } from './MisterProvider'
import { deltasFor } from './lineage'

export function MisterLineage({ entry }: { entry: ArtifactEntry }) {
  const { locale, artifacts, selectArtifact } = useMister()
  if (entry.parentSeq == null) return null
  const parent = artifacts.find((a) => a.seq === entry.parentSeq)
  if (!parent) return null

  const seeded = (entry.result.data as { seededFrom?: { fields: Localized[] } } | undefined)?.seededFrom
  const sameKind = parent.result.renderer === entry.result.renderer
  const deltas = sameKind ? deltasFor(entry.result.renderer, entry.result.data, parent.result.data) : []

  return (
    <div className="ck-lineage">
      <button
        type="button"
        className="ck-lineage-to"
        onClick={() => selectArtifact(parent.seq)}
        aria-label={t(
          { es: `Ir al lienzo de origen #${parent.seq}`, en: `Go to source canvas #${parent.seq}` },
          locale,
        )}
      >
        <span aria-hidden className="g" />
        <span>
          {t({ es: 'Heredado del lienzo', en: 'Inherited from canvas' }, locale)} #{parent.seq}
          {seeded && seeded.fields.length ? `: ${seeded.fields.map((f) => t(f, locale)).join(' · ')}` : ''}
        </span>
        <span aria-hidden className="arrow">
          ↩
        </span>
      </button>

      {deltas.length ? (
        <div className="ck-deltas" aria-label={t({ es: 'Cambios frente al origen', en: 'Changes vs source' }, locale)}>
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
