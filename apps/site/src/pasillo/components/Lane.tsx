'use client'

// El Pasillo · §4.6 + §4.9 + §4.10 — the Lane.
//
// One series per screen. Presence, not recognition: you walk the aisle and each
// booth is a whole series, stated once by its spec bar and shown by its faces.
//
// The swipe grammar:
//   right  collect the series as a folder, every SKU pre-checked
//   left   PASS — the booth dims to --pas-dimmed and the lane advances
//   tap    the sheet-dock at peek
//
// Pass is not reject. The series stays in position, stays on the scrubber, and
// re-lights when you come back to it. Nothing flies off a deck: the lane is
// finite, revisiting is the core behaviour, and a destructive skip would fight
// the scrubber directly. Passes expire with the session (see lib/record).
//
// The lane NEVER reorders. That is the whole reason spatial memory survives a
// filter here while the denser views are free to sort.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useDrag } from '@use-gesture/react'
import { SpecBar } from '@/pasillo/components/SpecBar'
import { LANE, skusOf } from '@/pasillo/lib/catalogue'
import { PARAM_SERIES, PARAM_SKU, PASILLO_ROUTES } from '@/pasillo/lib/routes'
import {
  COMMIT_DISTANCE_RATIO,
  MAX_ROTATION_DEG,
  SETTLE_SPRING,
  VERTICAL_FOLLOW,
  WASH_FULL,
  WASH_IN,
  judgeSwipe,
} from '@/pasillo/lib/lane'
import { haptic, useRecord } from '@/pasillo/lib/record'
import { Spring, clamp, mapRange, requestFrames } from '@/pasillo/lib/spring'
import { useReducedMotion } from '@/pasillo/hooks/useReducedMotion'
import type { Series, Sku } from '@/pasillo/types/catalogue'

/** Faces shown on the booth before the buyer goes to the dense views. */
const BOOTH_FACES = 12

/** Matches --pas-dur-light. The verdict must read before the booth swaps. */
const VERDICT_FLASH_MS = 240

export function Lane({ onOpenSku }: { onOpenSku: (sku: Sku) => void }) {
  const rec = useRecord()
  const reduced = useReducedMotion()
  const params = useSearchParams()

  const [index, setIndex] = useState(0)
  const [swapping, setSwapping] = useState(false)

  const areaRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const keepRef = useRef<HTMLDivElement>(null)
  const passRef = useRef<HTMLDivElement>(null)

  const sx = useRef(new Spring(SETTLE_SPRING)).current
  const sy = useRef(new Spring(SETTLE_SPRING)).current
  const commitDistance = useRef(100)
  const stopLoop = useRef<(() => void) | null>(null)

  const series = LANE[index]

  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      commitDistance.current = Math.max(56, e.contentRect.width * COMMIT_DISTANCE_RATIO)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /**
   * Held while a non-drag verdict flash is on screen. Without it the flash is
   * invisible: collect() advances the index, the index effect re-runs paint(),
   * and paint() recomputes the wash from a spring that is already at rest — so
   * the overlay is wiped in the same frame it was raised.
   */
  const flashUntil = useRef(0)

  /** Written from the gesture and the spring loop — never from a render. */
  const paint = useCallback(() => {
    const p = clamp(sx.value / commitDistance.current, -1, 1)
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${sx.value}px, ${sy.value}px, 0) rotate(${
        reduced ? 0 : p * MAX_ROTATION_DEG
      }deg)`
    }
    // The transform always paints; only the wash yields to an in-flight flash.
    if (performance.now() < flashUntil.current) return
    if (keepRef.current) keepRef.current.style.opacity = String(mapRange(p, WASH_IN, WASH_FULL, 0, 1))
    if (passRef.current) passRef.current.style.opacity = String(mapRange(p, -WASH_IN, -WASH_FULL, 0, 1))
  }, [reduced, sx, sy])

  const run = useCallback(() => {
    if (stopLoop.current) return
    stopLoop.current = requestFrames((dt) => {
      const moving = [sx.step(dt), sy.step(dt)].includes(true)
      paint()
      if (moving) return true
      stopLoop.current = null
      return false
    })
  }, [paint, sx, sy])

  /**
   * Deep-link arrival. Procurement is multi-party: the buyer works against a
   * spec someone else wrote, so "is this the one?" has to be answerable with a
   * link rather than a screenshot — which carries no code, no coverage and no
   * carton count. Runs on param change only; it never fights the buyer's own
   * position afterwards.
   */
  useEffect(() => {
    const serie = params.get(PARAM_SERIES)
    const code = params.get(PARAM_SKU)
    if (!serie && !code) return
    const sku = code
      ? LANE.flatMap((s) => skusOf(s.series_uid)).find((k) => k.code === code)
      : undefined
    const target = sku?.series_uid ?? serie
    const at = LANE.findIndex((s) => s.series_uid === target)
    if (at >= 0) setIndex(at)
    if (sku) onOpenSku(sku)
    // onOpenSku is a fresh closure each render; depending on it would reopen
    // the sheet on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  useEffect(() => () => stopLoop.current?.(), [])
  useLayoutEffect(() => {
    paint()
  }, [paint, index])

  const advance = useCallback(
    (to: number) => {
      const next = clamp(to, 0, LANE.length - 1)
      if (next === index) return
      setSwapping(true)
      setIndex(next)
      // the frame never moves; only the contents cross-fade
      setTimeout(() => setSwapping(false), reduced ? 0 : 180)
    },
    [index, reduced],
  )

  /**
   * The verdict wash, fired for the paths that are not a drag.
   *
   * The wash overlays exist and read beautifully — but they were driven purely
   * by drag progress, so pressing the button or hitting an arrow key advanced
   * the lane with no confirmation at all. The buyer's only evidence was the
   * muestrario counter changing somewhere else on screen. This is state
   * communication, not decoration: same overlay, same duration token, and
   * reduced motion collapses it to zero because the token does.
   */
  const flashVerdict = useCallback(
    (which: 'collect' | 'pass') => {
      const el = which === 'collect' ? keepRef.current : passRef.current
      if (!el || reduced) return
      flashUntil.current = performance.now() + VERDICT_FLASH_MS
      el.style.opacity = '1'
      window.setTimeout(() => {
        flashUntil.current = 0
        if (el) el.style.opacity = '0'
      }, VERDICT_FLASH_MS)
    },
    [reduced],
  )

  const collect = useCallback(() => {
    if (!series) return
    haptic('collect')
    flashVerdict('collect')
    rec.collectSeries(series.series_uid)
    rec.unpass(series.series_uid)
    advance(index + 1)
  }, [advance, flashVerdict, index, rec, series])

  const pass = useCallback(() => {
    if (!series) return
    haptic('pass')
    flashVerdict('pass')
    rec.pass(series.series_uid)
    advance(index + 1)
  }, [advance, flashVerdict, index, rec, series])

  const bind = useDrag(
    ({ down, movement: [mx, my], velocity: [vx], direction: [dx], last, tap }) => {
      if (tap) return
      if (down) {
        sx.set(mx)
        sy.set(my * VERTICAL_FOLLOW)
        paint()
        return
      }
      if (!last) return

      const v = judgeSwipe({
        movementX: mx,
        speedX: vx,
        directionX: dx,
        commitDistance: commitDistance.current,
      })
      // Whatever the verdict, the booth returns home. Nothing flies off.
      sx.to(0, v.dir * Math.abs(vx) * 1000)
      sy.to(0)
      run()
      if (v.action === 'collect') collect()
      else if (v.action === 'pass') pass()
    },
    { axis: 'x', filterTaps: true },
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        collect()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        pass()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        advance(index + 1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        advance(index - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, collect, index, pass])

  if (!series) return null

  const passed = rec.passed.has(series.series_uid)
  const collected = rec.isCollected(series.series_uid)
  const faces = skusOf(series.series_uid)

  return (
    <div className="relative flex h-dvh flex-col bg-pas-lane-ground text-pas-surface">
      <div {...bind()} className="relative flex-1 touch-pan-y overflow-hidden">
        <div ref={areaRef} className="h-full">
          <div
            ref={cardRef}
            className={`flex h-full flex-col will-change-transform transition-opacity duration-pas-light ${
              passed ? 'opacity-pas-dimmed' : 'opacity-pas-lit'
            }`}
          >
            {/* The booth needs a measure, but not the same one at every size.
                Unconstrained it stretched to 1440px: the face grid clipped its
                second row to a sliver, thumbs blew up to ~630px and the actions
                became 940px pills. Pinned at max-w-2xl it did the opposite on a
                desktop — a 672px column of six tiles inside 1440px of empty
                ground, on a screen where a buyer opens this precisely to see the
                colour big. So the measure grows with the grid: 2xl through the
                2- and 3-column steps, 5xl at lg where the grid is 4 across and
                each face lands near 250px.
                pt-pas-8 clears the fixed control band (exit stamp + switch). */}
            <div
              className={`mx-auto flex h-full w-full max-w-2xl flex-col px-pas-5 pt-pas-8 transition-opacity duration-pas-cross lg:max-w-5xl ${
                swapping ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {/* One left-anchored line. The passed state used to sit at the
                  right end of this row, directly under the fixed density switch,
                  so the only textual confirmation that a series had been passed
                  was fully occluded at 390px. */}
              <p className="pas-stamp opacity-pas-resting">
                Serie {String(index + 1).padStart(2, '0')} / {LANE.length}
                {passed && ' · Pasada'}
              </p>

              <div className="mt-4">
                <SpecBar series={series} invertedOnDark />
              </div>

              <div className="mt-pas-5 min-h-0 flex-1 overflow-y-auto pb-4">
                {/* TWO COLUMNS ON A PHONE, not three.
                    At 390px a 3-col grid drew 112px faces — and this is a
                    colour purchase, judged on a glaze that varies across a
                    kiln. 112px is a swatch you cannot read, and a six-SKU
                    series left half the aisle empty below it. Two columns put
                    the face at ~167px, and the same six SKUs now fill the
                    booth instead of floating at the top of a void.
                    Three from sm, four from lg, where width is not scarce. */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {faces.slice(0, BOOTH_FACES).map((sku) => (
                    <button
                      key={sku.sku_uid}
                      type="button"
                      onClick={() => onOpenSku(sku)}
                      className="relative aspect-square overflow-hidden rounded-pas-record bg-pas-surface-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sku.thumb}
                        alt={sku.code}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                      {rec.isSkuSelected(sku.series_uid, sku.sku_uid) && (
                        <>
                          <span aria-hidden className="pas-collected-mark absolute inset-0" />
                          <span aria-hidden className="pas-collected-corner" />
                        </>
                      )}
                    </button>
                  ))}
                </div>
                {faces.length > BOOTH_FACES && (
                  // It named a destination and did nothing. "la lista" was also
                  // ambiguous between the Lista view and the buyer's own record.
                  <Link
                    href={PASILLO_ROUTES.lista}
                    className="pas-stamp mt-3 inline-block underline-offset-4 opacity-pas-resting
                               hover:underline hover:opacity-pas-lit focus-visible:underline"
                  >
                    + {faces.length - BOOTH_FACES} diseños más — verlos en Lista
                  </Link>
                )}
              </div>
            </div>

            {/* verdict wash — the answer reads before the thumb lifts */}
            <div
              ref={keepRef}
              aria-hidden
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 ring-4 ring-inset ring-pas-surface"
            >
              <span className="pas-stamp absolute right-pas-5 top-pas-5 bg-pas-surface px-3 py-2 text-pas-ink">
                Guardar serie
              </span>
            </div>
            <div
              ref={passRef}
              aria-hidden
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              <span className="pas-stamp absolute left-pas-5 top-pas-5 border border-pas-surface/40 px-3 py-2">
                Pasar
              </span>
            </div>
          </div>
        </div>
      </div>

      <LaneActions
        collected={collected}
        onCollect={collect}
        onPass={pass}
        index={index}
        onBack={() => advance(index - 1)}
      />
      <EdgeScrubber index={index} onGo={advance} />
    </div>
  )
}

function LaneActions({
  collected,
  onCollect,
  onPass,
  index,
  onBack,
}: {
  collected: boolean
  onCollect: () => void
  onPass: () => void
  index: number
  onBack: () => void
}) {
  // Everything interactive stays in the bottom 60% — one-handed, 24 booths.
  return (
    <div className="mx-auto w-full max-w-2xl shrink-0 px-pas-5 pb-24 pt-3 pr-12">
      {/* GOING BACK.
          The edge scrubber can reach any booth, but it is a bare rail of ticks
          with no label — a buyer who has just passed a series by mistake has no
          visible way to return, and reaching for a 3px rail at the screen edge
          is not an answer on a phone held one-handed. This is that answer: a
          named control, in the thumb zone, that says what it does.
          It is hidden at the first booth rather than disabled, because a dead
          control a buyer can press is worse than one that is not there. */}
      <div className="mb-3 flex min-h-[1.25rem] items-center justify-between gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="pas-stamp relative -ml-1 whitespace-nowrap px-1 py-1 underline-offset-4 opacity-pas-resting
                       transition-opacity duration-pas-light hover:underline hover:opacity-pas-lit
                       focus-visible:underline focus-visible:opacity-pas-lit
                       before:absolute before:-inset-2 before:content-['']"
          >
            ← Serie anterior
          </button>
        ) : (
          <span />
        )}
        {/* Full keyboard parity ships and nothing said so. Pointer-fine only: on
            a phone the gesture IS the affordance and this would be noise. */}
        {/* Wide AND fine-pointer. A fine pointer at 390px is a narrow desktop
            window, where this legend wrapped into the back control beside it. */}
        <p className="pas-stamp hidden whitespace-nowrap opacity-pas-dimmed sm:[@media(pointer:fine)]:block">
          → guardar · ← pasar · ↑ ↓ serie
        </p>
      </div>
      {/* data-tour is a CONTRACT, not a hook of convenience: the tour targets
          these by attribute and never by class, because class names change
          under restyling and take the tour with them, silently. */}
      <div data-tour="lane-actions" className="flex items-center gap-3">
        {/* py-3 lands these at ~47px — past the 44px floor, and on the frozen
            scale, where py-3.5 (14px) was not. */}
        <button
          type="button"
          onClick={onPass}
          className="flex-1 rounded-pas-chrome border border-pas-surface/30 py-3 text-pas-t0"
        >
          Pasar
        </button>
        <button
          type="button"
          data-tour="lane-collect"
          onClick={onCollect}
          className={`flex-1 rounded-pas-chrome py-3 text-pas-t0 ${
            collected
              ? 'border border-pas-surface/30 opacity-pas-resting'
              : 'bg-pas-surface text-pas-ink'
          }`}
        >
          {collected ? 'En el muestrario' : 'Guardar serie'}
        </button>
      </div>
    </div>
  )
}

/**
 * §4.9 — the edge scrubber. The signature element: the buyer's collected series
 * are visible as marks on the aisle itself, so the record and the walk become
 * the same object seen two ways. Collected ticks are solid; passed ticks hollow.
 * Doubles as the progress bar.
 */
function EdgeScrubber({ index, onGo }: { index: number; onGo: (i: number) => void }) {
  const rec = useRecord()
  const railRef = useRef<HTMLDivElement>(null)

  const goFromY = useCallback(
    (clientY: number) => {
      const el = railRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const t = clamp((clientY - r.top) / r.height, 0, 1)
      onGo(Math.round(t * (LANE.length - 1)))
    },
    [onGo],
  )

  const [scrubbing, setScrubbing] = useState(false)
  const bind = useDrag(({ xy: [, y], event, down }) => {
    event.preventDefault()
    setScrubbing(down)
    goFromY(y)
  })

  return (
    <div
      {...bind()}
      role="slider"
      aria-label="Recorrer el catálogo"
      aria-valuemin={1}
      aria-valuemax={LANE.length}
      aria-valuenow={index + 1}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') onGo(index + 1)
        if (e.key === 'ArrowUp') onGo(index - 1)
      }}
      // 3px rail, 44px invisible hit area
      className="absolute bottom-0 right-0 top-pas-8 z-10 flex w-11 cursor-ns-resize touch-none justify-end"
    >
      {/* The rail stays 3px; the MARKS protrude. At 3px wide and 25% opacity
          on a near-black ground, collected and passed were indistinguishable —
          which cost the signature element its entire point: the record and the
          walk being the same object seen twice. Values stay on the 4/8 steps. */}
      {/* Names the rail the moment it is touched or focused. Without this it
          is a column of ticks that a buyer has no reason to believe is a
          control — the concept was sound and completely unannounced. */}
      <span
        aria-hidden
        className={`pas-stamp pointer-events-none absolute right-11 top-1/2 -translate-y-1/2 whitespace-nowrap
                    rounded-pas-chrome bg-pas-surface px-2 py-1 text-pas-ink transition-opacity duration-pas-light
                    ${scrubbing ? 'opacity-pas-lit' : 'opacity-0'}`}
      >
        Serie {String(index + 1).padStart(2, '0')} / {LANE.length}
      </span>
      <div ref={railRef} className="my-pas-6 mr-2 flex w-[3px] flex-col items-end justify-between">
        {LANE.map((s: Series, i) => {
          const isCollected = rec.isCollected(s.series_uid)
          const isPassed = rec.passed.has(s.series_uid)
          return (
            <span
              key={s.series_uid}
              aria-hidden
              className={`block transition-[width,height,background-color,opacity] duration-pas-light ${
                i === index ? 'h-4' : 'h-2'
              } ${
                isCollected
                  ? 'w-2 bg-pas-surface'
                  : isPassed
                    ? 'w-full border border-pas-surface/40 bg-transparent'
                    : i === index
                      ? 'w-full bg-pas-surface'
                      : 'w-full bg-pas-surface/25'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
