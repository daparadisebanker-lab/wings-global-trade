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
import { useDrag } from '@use-gesture/react'
import { SpecBar } from '@/pasillo/components/SpecBar'
import { LANE, skusOf } from '@/pasillo/lib/catalogue'
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

export function Lane({ onOpenSku }: { onOpenSku: (sku: Sku) => void }) {
  const rec = useRecord()
  const reduced = useReducedMotion()

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

  /** Written from the gesture and the spring loop — never from a render. */
  const paint = useCallback(() => {
    const p = clamp(sx.value / commitDistance.current, -1, 1)
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${sx.value}px, ${sy.value}px, 0) rotate(${
        reduced ? 0 : p * MAX_ROTATION_DEG
      }deg)`
    }
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

  const collect = useCallback(() => {
    if (!series) return
    haptic('collect')
    rec.collectSeries(series.series_uid)
    rec.unpass(series.series_uid)
    advance(index + 1)
  }, [advance, index, rec, series])

  const pass = useCallback(() => {
    if (!series) return
    haptic('pass')
    rec.pass(series.series_uid)
    advance(index + 1)
  }, [advance, index, rec, series])

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
            <div
              className={`flex h-full flex-col px-pas-5 pt-pas-6 transition-opacity duration-pas-cross ${
                swapping ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <p className="pas-stamp opacity-pas-resting">
                  Serie {String(index + 1).padStart(2, '0')} / {LANE.length}
                </p>
                {passed && <p className="pas-stamp opacity-pas-resting">Pasada</p>}
              </div>

              <div className="mt-4">
                <SpecBar series={series} invertedOnDark />
              </div>

              <div className="mt-pas-5 min-h-0 flex-1 overflow-y-auto pb-4">
                <div className="grid grid-cols-3 gap-2">
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
                  <p className="pas-stamp mt-3 opacity-pas-resting">
                    + {faces.length - BOOTH_FACES} diseños en la lista
                  </p>
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
              <span className="pas-stamp absolute right-pas-5 top-pas-5 bg-pas-surface px-3 py-1.5 text-pas-ink">
                Guardar serie
              </span>
            </div>
            <div
              ref={passRef}
              aria-hidden
              style={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              <span className="pas-stamp absolute left-pas-5 top-pas-5 border border-pas-surface/40 px-3 py-1.5">
                Pasar
              </span>
            </div>
          </div>
        </div>
      </div>

      <LaneActions collected={collected} onCollect={collect} onPass={pass} />
      <EdgeScrubber index={index} onGo={advance} />
    </div>
  )
}

function LaneActions({
  collected,
  onCollect,
  onPass,
}: {
  collected: boolean
  onCollect: () => void
  onPass: () => void
}) {
  // Everything interactive stays in the bottom 60% — one-handed, 24 booths.
  return (
    <div className="flex shrink-0 items-center gap-3 px-pas-5 pb-24 pt-3 pr-12">
      <button
        type="button"
        onClick={onPass}
        className="flex-1 rounded-pas-chrome border border-pas-surface/30 py-3.5 text-pas-t0"
      >
        Pasar
      </button>
      <button
        type="button"
        onClick={onCollect}
        className={`flex-1 rounded-pas-chrome py-3.5 text-pas-t0 ${
          collected ? 'border border-pas-surface/30 opacity-pas-resting' : 'bg-pas-surface text-pas-ink'
        }`}
      >
        {collected ? 'En el muestrario' : 'Guardar serie'}
      </button>
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

  const bind = useDrag(({ xy: [, y], event }) => {
    event.preventDefault()
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
      className="absolute bottom-0 right-0 top-20 z-10 flex w-11 cursor-ns-resize touch-none justify-end"
    >
      <div ref={railRef} className="my-pas-6 mr-2 flex w-[3px] flex-col justify-between">
        {LANE.map((s: Series, i) => {
          const isCollected = rec.isCollected(s.series_uid)
          const isPassed = rec.passed.has(s.series_uid)
          return (
            <span
              key={s.series_uid}
              aria-hidden
              className={`block w-full transition-all duration-pas-light ${
                i === index ? 'h-4 bg-pas-surface' : 'h-2'
              } ${
                isCollected
                  ? 'bg-pas-surface'
                  : isPassed
                    ? 'border border-pas-surface/40 bg-transparent'
                    : 'bg-pas-surface/25'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
