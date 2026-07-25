'use client'

// La Escalera · Rung 1 — "Undo = a 4-second toast. Nothing else."
//
// Its own file, and CSS-driven rather than library-driven, because both the deck
// and the muestrario render it — and the deck route must stay free of an
// animation library (see lib/spring.ts). A slide-and-fade is two properties;
// it does not need a runtime.
//
// The toast stays mounted briefly after the undo window closes so it can leave
// the way it arrived. Unmounting instantly would make a dismissal feel like a
// glitch rather than a decision.

import { useEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/motion'
import { useRecord, type UndoToast as UndoState } from '@/lib/record'

/** Matches the .toast-exit animation in globals.css. */
const EXIT_MS = 180

export function UndoToast() {
  const rec = useRecord()
  const [shown, setShown] = useState<UndoState | null>(null)
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    if (rec.undo) {
      setShown(rec.undo)
      setLeaving(false)
      return
    }
    // The undo window closed — play the exit, then unmount.
    if (shown) {
      setLeaving(true)
      timer.current = setTimeout(() => {
        setShown(null)
        setLeaving(false)
      }, EXIT_MS)
    }
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
    // `shown` is deliberately not a dependency: reacting to it would restart
    // the exit timer every time this effect re-ran and the toast would stick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.undo])

  if (!shown) return null

  return (
    <div
      role="status"
      className={`fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-[520px] items-center justify-between gap-4 rounded-dock bg-deck-2 px-5 py-4 shadow-elevation-3 ${
        leaving ? 'toast-exit' : 'toast-enter'
      }`}
    >
      <span className="text-t0 text-deck-ink">
        <span className="font-mono">{shown.label}</span> fuera del muestrario
      </span>
      <button
        type="button"
        onClick={() => {
          haptic('undo')
          rec.runUndo()
        }}
        className="stamp rounded-pill bg-gold px-4 py-2 text-gold-ink"
      >
        Deshacer
      </button>
    </div>
  )
}
