'use client'

// MisterCanvas — the composition canvas (Phase E slice 1, center zone). It pins
// the latest renderable artifact and shows it BIG, reusing the same renderer map
// the thread uses (no artifact is rebuilt for the canvas — it is the same organ,
// given room to breathe). Empty until the first artifact arrives; then it swaps
// to the newest one and replays a single settle keyed on artifactSeq.
import { t } from '@/lib/i18n'
import { MisterMark } from '../MisterMark'
import { MISTER_RENDERERS } from '../mister-renderers'
import { useMister } from './MisterProvider'
import { artifactLabel } from './handoffs'

export function MisterCanvas() {
  const { locale, latestArtifact, artifactSeq } = useMister()

  if (!latestArtifact) {
    return (
      <div className="ck-canvas-empty">
        <MisterMark size={54} />
        <p className="ck-empty-hi">
          {t(
            { es: 'Tu composición aparece aquí.', en: 'Your composition appears here.' },
            locale,
          )}
        </p>
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

  const render = MISTER_RENDERERS[latestArtifact.renderer]
  return (
    <div className="ck-canvas-scroll">
      <div className="ck-canvas-head">
        <span className="ck-canvas-eyebrow">
          <span aria-hidden className="g" />
          {t({ es: 'Lienzo', en: 'Canvas' }, locale)}
        </span>
        <span className="ck-canvas-title">{t(artifactLabel(latestArtifact.renderer), locale)}</span>
      </div>
      {latestArtifact.note ? <p className="ck-canvas-note">{latestArtifact.note}</p> : null}
      {/* key on artifactSeq so the reveal replays per NEW artifact, not per render. */}
      <div key={artifactSeq} className="ck-canvas-art">
        {render ? render(latestArtifact.data, locale) : <span>{latestArtifact.text ?? ''}</span>}
      </div>
    </div>
  )
}
