'use client'

// A contextual hint — modality D. It sits IN the interface, never over it, and
// it is the right shape for knowledge that is order-independent: a buyer needs
// to know filters combine at the moment they reach the filters, not as step
// four of something they started three screens ago.
//
// WHAT SEPARATES A HINT FROM CLUTTER IS ITS RETIREMENT CONDITION. Every use of
// this component passes `retireWhen`, and the hint disappears permanently the
// moment the buyer demonstrates the knowledge — nobody gets lectured about
// something they are already doing. A hint with no retirement is furniture.

import { useEffect, useState } from 'react'
import { readHint, retireHint, type HintId } from '@/pasillo/lib/onboarding'

export function Hint({
  id,
  children,
  retireWhen = false,
}: {
  id: HintId
  children: React.ReactNode
  /** True once the buyer has shown they know this. Retires it for good. */
  retireWhen?: boolean
}) {
  // Starts hidden and is revealed after mount: reading localStorage during
  // render is a hydration mismatch, and a hint that flashes on every load for
  // someone who retired it months ago is worse than no hint.
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!readHint(id)) setShow(true)
  }, [id])

  useEffect(() => {
    if (retireWhen) {
      retireHint(id)
      setShow(false)
    }
  }, [id, retireWhen])

  if (!show) return null

  return (
    <p className="flex items-start gap-2 text-pas-label opacity-pas-resting">
      <span aria-hidden className="pas-mono shrink-0">
        ⓘ
      </span>
      <span className="min-w-0">{children}</span>
      <button
        type="button"
        onClick={() => {
          retireHint(id)
          setShow(false)
        }}
        aria-label="Ocultar esta nota"
        className="ml-auto min-h-11 shrink-0 px-2 leading-none"
      >
        ×
      </button>
    </p>
  )
}
