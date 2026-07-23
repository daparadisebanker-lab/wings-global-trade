'use client'

// MisterCanvas — the composition canvas (Phase E, center zone). It shows the
// SELECTED artifact big, reusing the same renderer map the thread uses (no
// artifact is rebuilt — same organ, more room). When more than one artifact has
// been composed this session, a switcher lets the operator flip between them
// (fit → cost → quote…), which is what makes this a workspace and not a readout.
import { useRef } from 'react'
import { t } from '@/lib/i18n'
import { MisterMark } from '../MisterMark'
import { MISTER_RENDERERS } from '../mister-renderers'
import { MISTER_CANVAS_EDITORS } from './canvas-editors'
import { useMister } from './MisterProvider'
import { MisterLineage } from './MisterLineage'
import { artifactLabel } from './handoffs'

export function MisterCanvas() {
  const { locale, artifacts, selectedSeq, selectArtifact, selectedArtifact } = useMister()
  // Focus lands here after a lineage jump, so keyboard users don't drop to <body>
  // when the pill unmounts (a root parent has no lineage bar of its own).
  const titleRef = useRef<HTMLSpanElement>(null)

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

  // Prefer an editable surface when the capability has one; the thread stays read-only.
  const editor = MISTER_CANVAS_EDITORS[selectedArtifact.renderer]
  const editable = Boolean(editor)
  // The shown artifact's entry — its stable seq keys the editor's working memory, and
  // its parentSeq drives the lineage bar (Scenario Ledger Stage 2).
  const currentEntry = artifacts.find((a) => a.result === selectedArtifact) ?? null
  const currentSeq = currentEntry?.seq ?? selectedSeq ?? 0

  return (
    <div className="ck-canvas-scroll">
      <div className="ck-canvas-head">
        <span className="ck-canvas-eyebrow">
          <span aria-hidden className="g" />
          {t({ es: 'Lienzo', en: 'Canvas' }, locale)}
        </span>
        <span ref={titleRef} tabIndex={-1} className="ck-canvas-title">
          {t(artifactLabel(selectedArtifact.renderer), locale)}
        </span>
        {editable ? (
          <span className="ck-canvas-editable">{t({ es: 'Editable', en: 'Editable' }, locale)}</span>
        ) : null}
      </div>

      {/* Switcher — only once there's more than one composition to move between.
          role="group" + aria-pressed (not a tablist — we don't implement the
          tab keyboard model; buttons are individually Tab-reachable). */}
      {artifacts.length > 1 ? (
        <div className="ck-switcher" role="group" aria-label={t({ es: 'Composiciones', en: 'Compositions' }, locale)}>
          {artifacts.map((a) => {
            const active = a.seq === selectedSeq
            return (
              <button
                key={a.seq}
                type="button"
                aria-pressed={active}
                // The seq badge + parent tag are aria-hidden decoration; name the button
                // so AT users can tell two same-kind compositions apart (and hear lineage).
                aria-label={
                  `#${a.seq} ${t(artifactLabel(a.result.renderer), locale)}` +
                  (a.parentSeq != null
                    ? t({ es: `, heredado de #${a.parentSeq}`, en: `, inherited from #${a.parentSeq}` }, locale)
                    : '')
                }
                className={active ? 'ck-switch is-active' : 'ck-switch'}
                onClick={() => selectArtifact(a.seq)}
              >
                <span aria-hidden className="n">
                  {a.seq}
                </span>
                {t(artifactLabel(a.result.renderer), locale)}
                {a.parentSeq != null ? (
                  <span aria-hidden className="par">← {a.parentSeq}</span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}

      {selectedArtifact.note ? <p className="ck-canvas-note">{selectedArtifact.note}</p> : null}

      {/* Lineage bar (Scenario Ledger Stage 2) — provenance made visible + clickable
          on the canvas, where the editors don't render the seededFrom header. */}
      {currentEntry ? <MisterLineage entry={currentEntry} onJump={() => titleRef.current?.focus()} /> : null}

      {/* key on the shown seq so the reveal replays on swap; the editor rehydrates
          its state from the provider's per-seq working memory across the remount. */}
      <div key={currentSeq} className="ck-canvas-art">
        {editor
          ? editor(selectedArtifact.data, locale, currentSeq)
          : (MISTER_RENDERERS[selectedArtifact.renderer]?.(selectedArtifact.data, locale) ?? (
              <span>{selectedArtifact.text ?? ''}</span>
            ))}
      </div>
    </div>
  )
}
