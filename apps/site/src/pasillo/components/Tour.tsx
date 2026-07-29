'use client'

// The teaching layer for the aisle. Bottom sheet + spotlight, three steps.
//
// NO TOUR LIBRARY, AND NO POSITIONING LIBRARY. src/pasillo/CLAUDE.md §5 lists
// "any animation library on the Lane" as absent on purpose, and a tour is the
// worst possible reason to break that: it is the one surface most buyers see
// exactly once. Floating UI would buy anchored popovers, which this does not
// use — below 640px they are cramped and fragile, and above it a bottom sheet
// still reads correctly. One pattern, both widths, zero dependencies.
//
// The spotlight is a getBoundingClientRect and four <div>s of scrim. It dims to
// 62%: darker and the aisle reads as disabled rather than de-emphasised, which
// is a lie about a page the buyer can still scroll and still tap through.
//
// ESCAPE ALWAYS WORKS, and Saltar is visible from step one. A teaching layer
// that traps a buyer is a hostage situation, and hiding Skip buys resentment,
// not completion.

import { useCallback, useEffect, useRef, useState } from 'react'
import { AISLE_TOUR, writeTour, type TourStep } from '@/pasillo/lib/onboarding'

interface Box {
  top: number
  left: number
  width: number
  height: number
}

/** 8px of air so the highlighted control is not clipped by its own spotlight. */
const PAD = 8

function boxFor(target: string): Box | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  }
}

export function Tour({ onEnd }: { onEnd: () => void }) {
  const [i, setI] = useState(0)
  // Steps whose target never materialised are dropped, not rendered pointing at
  // the void. Resolved once, after mount, so the sequence a buyer sees is
  // stable — recomputing per step would renumber "2 de 3" underneath them.
  const [steps, setSteps] = useState<TourStep[] | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const returnTo = useRef<Element | null>(null)

  useEffect(() => {
    returnTo.current = document.activeElement
    setSteps(AISLE_TOUR.steps.filter((s) => !s.optional || boxFor(s.target)))
  }, [])

  const finish = useCallback(
    (status: 'completed' | 'skipped', at: number) => {
      writeTour(AISLE_TOUR.id, AISLE_TOUR.version, status, at)
      if (returnTo.current instanceof HTMLElement) returnTo.current.focus()
      onEnd()
    },
    [onEnd],
  )

  const step = steps?.[i]

  // Track the target through scroll, resize and the Lane's own transforms. The
  // #1 tour bug is measuring before layout settles, so this measures on a frame
  // AFTER the step changes, and keeps measuring while the step is open.
  useEffect(() => {
    if (!step) return
    let raf = 0
    const measure = () => {
      setBox(boxFor(step.target))
      raf = requestAnimationFrame(measure)
    }
    raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [step])

  // Focus the sheet on open and on every step change, so a screen-reader user
  // is moved to the thing that just changed rather than left behind in the page.
  useEffect(() => {
    if (step) sheetRef.current?.focus()
  }, [step])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        finish('skipped', i)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [finish, i])

  if (!steps || steps.length === 0 || !step) return null
  const last = i === steps.length - 1

  // THE SHEET FLIPS AWAY FROM THE TARGET.
  // This aisle is a full-viewport tool that deliberately keeps every control in
  // the thumb zone, so a bottom sheet and the thing it is teaching want the same
  // 270px. The usual mobile fix — scroll the target above the sheet — does not
  // apply to a page that does not scroll. So the sheet takes whichever half the
  // target is not in. A teaching layer that covers its own subject is worse than
  // no teaching layer.
  const mid = typeof window === 'undefined' ? 0 : window.innerHeight / 2
  const atTop = !!box && box.top + box.height / 2 > mid

  return (
    <>
      {/* Scrim in four pieces around the cutout, so the highlighted control is
          genuinely untouched rather than covered by a transparent overlay that
          still eats its taps. pointer-events stay off everywhere regardless —
          the sheet is the only thing that takes input. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
        {box ? (
          <>
            <Scrim style={{ top: 0, left: 0, right: 0, height: Math.max(box.top, 0) }} />
            <Scrim style={{ top: box.top + box.height, left: 0, right: 0, bottom: 0 }} />
            <Scrim style={{ top: box.top, left: 0, width: Math.max(box.left, 0), height: box.height }} />
            <Scrim style={{ top: box.top, left: box.left + box.width, right: 0, height: box.height }} />
            <div
              className="absolute rounded-pas-chrome border border-pas-surface/70"
              style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
            />
          </>
        ) : (
          <Scrim style={{ inset: 0 }} />
        )}
      </div>

      {/* Announced separately from the sheet so the step change is spoken even
          when focus has not moved. */}
      <div aria-live="polite" className="sr-only">
        Paso {i + 1} de {steps.length}: {step.title}
      </div>

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        tabIndex={-1}
        className={`fixed inset-x-0 z-50 mx-auto max-w-2xl bg-pas-surface px-pas-5 outline-none ${
          atTop
            ? 'top-0 rounded-b-pas-chrome pb-pas-6 [padding-top:max(theme(spacing.pas-5),env(safe-area-inset-top))]'
            : 'bottom-0 rounded-t-pas-chrome pt-pas-5 [padding-bottom:max(theme(spacing.pas-6),env(safe-area-inset-bottom))]'
        }`}
      >
        <div className="flex items-baseline justify-between gap-4">
          <p className="pas-stamp opacity-pas-resting">
            {i + 1} de {steps.length}
          </p>
          {/* Visible from step one. Buried skip buys resentment, not completion. */}
          <button
            type="button"
            onClick={() => finish('skipped', i)}
            className="pas-stamp min-h-11 px-2 underline underline-offset-4 opacity-pas-resting"
          >
            Saltar
          </button>
        </div>

        <h2
          id="tour-title"
          className="mt-2 font-pas-display text-pas-t2 font-semibold tracking-pas-display"
        >
          {step.title}
        </h2>
        <p className="mt-2 max-w-[42ch] text-pas-t1">{step.body}</p>

        <div className="mt-pas-6 flex gap-3">
          {i > 0 && (
            <button
              type="button"
              onClick={() => setI((n) => n - 1)}
              className="min-h-11 flex-1 rounded-pas-chrome border border-pas-ink/30 px-pas-5 text-pas-t0"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? finish('completed', i) : setI((n) => n + 1))}
            className="min-h-11 flex-[2] rounded-pas-chrome bg-pas-ink px-pas-5 text-pas-t0 text-pas-surface"
          >
            {last ? 'Entendido' : 'Siguiente'}
          </button>
        </div>
      </div>
    </>
  )
}

function Scrim({ style }: { style: React.CSSProperties }) {
  return <div className="absolute bg-pas-lane-ground/[0.62]" style={style} />
}
