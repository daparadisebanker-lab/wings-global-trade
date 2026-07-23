'use client'

// MisterCockpit — the full-width production cockpit (Phase E slice 1). Three
// zones: command spine (instruct) · composition canvas (the live artifact, big) ·
// commit rail (redirect into the modules + review queue). One frame, two hosts:
//   - mode="overlay": ⌘J summons it full-bleed over any screen (retires the old
//     430px MisterDock — "the full experience, not half a screen").
//   - mode="page": the /intelligence route renders it inline as the Mister module.
// Both read ONE conversation from MisterProvider, so a draft started in the
// overlay is still there on the page. Below lg the grid collapses to the spine
// alone (artifacts still render inline in the thread), so a phone gets the chat.
import { useEffect, useRef } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'
import { MisterMark } from '../MisterMark'
import { MisterConversation } from './MisterConversation'
import { MisterCanvas } from './MisterCanvas'
import { MisterCommitRail } from './MisterCommitRail'
import { useMister } from './MisterProvider'
import './mister-cockpit.css'

function CockpitBody({ showClose, active, onClose }: { showClose: boolean; active: boolean; onClose?: () => void }) {
  const { locale } = useMister()
  return (
    <div className="ck-shell">
      <div className="mister-bar ck-bar">
        <span className="mister-id">
          <MisterMark size={26} className="mark" />
          <span className="name">
            <b>MISTER</b> · {t({ es: 'Interno', en: 'Internal' }, locale)}
          </span>
        </span>
        {showClose ? (
          <button
            type="button"
            className="mister-close"
            onClick={onClose}
            aria-label={t({ es: 'Cerrar Mister', en: 'Close Mister' }, locale)}
            title="Mister · ⌘J"
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="ck-grid">
        <div className="ck-spine">
          <MisterConversation />
        </div>
        <div className="ck-canvas" aria-label={t({ es: 'Lienzo de composición', en: 'Composition canvas' }, locale)}>
          <MisterCanvas />
        </div>
        <aside className="ck-rail" aria-label={t({ es: 'Registrar y redirigir', en: 'Commit and hand-off' }, locale)}>
          <MisterCommitRail active={active} />
        </aside>
      </div>
    </div>
  )
}

export function MisterCockpit({
  mode,
  open = false,
  onClose,
}: {
  mode: 'overlay' | 'page'
  open?: boolean
  onClose?: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Overlay: inert + untabbable when closed; Escape closes; focus the composer on
  // each open. Page mode never steals focus and is always interactive.
  useEffect(() => {
    if (mode !== 'overlay') return
    const node = overlayRef.current
    if (node) node.inert = !open
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    const id = window.setTimeout(() => node?.querySelector<HTMLTextAreaElement>('textarea')?.focus(), 80)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(id)
    }
  }, [mode, open, onClose])

  if (mode === 'page') {
    return (
      <div className="mister-cockpit is-page">
        <CockpitBody showClose={false} active />
      </div>
    )
  }

  return (
    <div ref={overlayRef} className={cn('mister-cockpit-overlay', open && 'is-open')} aria-hidden={!open}>
      <button
        type="button"
        className="mister-cockpit-scrim"
        aria-label={t({ es: 'Cerrar Mister', en: 'Close Mister' }, DEFAULT_LOCALE)}
        onClick={onClose}
      />
      <div className="mister-cockpit is-overlay" role="dialog" aria-modal="false" aria-label="Mister">
        <CockpitBody showClose active={open} onClose={onClose} />
      </div>
    </div>
  )
}
