'use client'

// MisterCanvas — the composition canvas (Phase E, center zone). It shows the
// SELECTED artifact big, reusing the same renderer map the thread uses (no
// artifact is rebuilt — same organ, more room). When more than one artifact has
// been composed this session, a switcher lets the operator flip between them
// (fit → cost → quote…), which is what makes this a workspace and not a readout.
import { t } from '@/lib/i18n'
import { MisterMark } from '../MisterMark'
import { MISTER_RENDERERS } from '../mister-renderers'
import { useMister } from './MisterProvider'
import { artifactLabel } from './handoffs'

export function MisterCanvas() {
  const { locale, artifacts, selectedSeq, selectArtifact, selectedArtifact } = useMister()

  if (!selectedArtifact) {
    return (
      <div className="ck-canvas-empty">
        <MisterMark size={54} />
        <p className="ck-empty-hi">{t({ es: 'Tu composición aparece aquí.', en: 'Your composition appears here.' }, locale)}</p>
        <p className="ck-empty-sub">
          {t(
            {
              es: 'Pídele a Mister que arme un contenedor, costee un aterrizaje o redacte una cotización — el artefacto se abre a tamaño completo en este lienzo.',
              en: 'Ask Mister to pack a container, cost a landing, or draft a quote — the artifact opens full-size on this canvas.',
            },
            locale,
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="ck-canvas-scroll">
      <div className="ck-canvas-head">
        <span className="ck-canvas-eyebrow">
          <span aria-hidden className="g" />
          {t({ es: 'Lienzo', en: 'Canvas' }, locale)}
        </span>
        <span className="ck-canvas-title">{t(artifactLabel(selectedArtifact.renderer), locale)}</span>
      </div>

      {/* Switcher — only once there's more than one composition to move between. */}
      {artifacts.length > 1 ? (
        <div className="ck-switcher" role="tablist" aria-label={t({ es: 'Composiciones', en: 'Compositions' }, locale)}>
          {artifacts.map((a) => {
            const active = a.seq === selectedSeq
            return (
              <button
                key={a.seq}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? 'ck-switch is-active' : 'ck-switch'}
                onClick={() => selectArtifact(a.seq)}
              >
                <span aria-hidden className="n">
                  {a.seq}
                </span>
                {t(artifactLabel(a.result.renderer), locale)}
              </button>
            )
          })}
        </div>
      ) : null}

      {selectedArtifact.note ? <p className="ck-canvas-note">{selectedArtifact.note}</p> : null}
      {/* key on selectedSeq so the reveal replays when the operator swaps artifacts. */}
      <div key={selectedSeq ?? 'art'} className="ck-canvas-art">
        {MISTER_RENDERERS[selectedArtifact.renderer]?.(selectedArtifact.data, locale) ?? (
          <span>{selectedArtifact.text ?? ''}</span>
        )}
      </div>
    </div>
  )
}
