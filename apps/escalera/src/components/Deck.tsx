'use client'

// La Escalera · Rung 1 — THE DECK.
//
// "One tile card, full bleed. Swipe right = add. Swipe left = next. Counter in
// the corner. That's it."  The incumbent is a 60-page PDF pinched and zoomed on
// a phone; a deck you can thumb at two tiles per second, one-handed, in a
// warehouse, is a category upgrade on day one.
//
// THE ONE THING — the card carries the velocity of the throw all the way off
// screen, and the stack behind rises to meet the thumb before it lands.
//
// The architecture that buys it:
//   · @use-gesture owns the pointer and reports real kinematics — velocity in
//     px/ms, direction, tap-vs-drag — which a drag prop cannot give us.
//   · lib/spring.ts owns the physics. Release velocity is injected straight
//     into the spring, so a thrown card leaves at the speed it was thrown. A
//     card that exits on a fixed tween is a div sliding; that difference is the
//     whole product at this rung.
//   · Transforms are written directly onto the elements from one rAF loop.
//     React renders when the card CHANGES, never while it moves — a drag can
//     never be throttled by a reconcile, and the deck route ships no animation
//     library at all.
//   · Every tunable number lives in lib/motion.ts. This file has none.
//
// The enemy at this rung is still adding anything else.

import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDrag } from '@use-gesture/react'
import { TileCard } from '@/components/TileCard'
import { UndoToast } from '@/components/UndoToast'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRecord } from '@/lib/record'
import { Spring, clamp, mapRange, requestFrames } from '@/lib/spring'
import {
  COMMIT_DISTANCE_RATIO,
  FALLBACK_THROW_VELOCITY,
  FLIGHT_ROTATION_MULTIPLIER,
  KEYBOARD_THROW_VELOCITY,
  MAX_ROTATION_DEG,
  SETTLE_SPRING,
  STACK_OFFSET_Y,
  STACK_OFFSET_Y_ADVANCED,
  STACK_SCALE,
  STACK_SCALE_ADVANCED,
  THROW_SPRING,
  VERTICAL_FOLLOW,
  WASH_FULL,
  WASH_IN,
  haptic,
  judgeThrow,
} from '@/lib/motion'
import type { Tile } from '@/types/tile'

type Dir = 1 | -1

interface Flight {
  tile: Tile
  dir: Dir
  kept: boolean
  fromX: number
  fromY: number
  velocity: number
}

export function Deck({ tiles }: { tiles: Tile[] }) {
  const rec = useRecord()
  const reduced = useReducedMotion()

  const areaRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const keepRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLDivElement>(null)
  const tier0Ref = useRef<HTMLDivElement>(null)
  const tier1Ref = useRef<HTMLDivElement>(null)
  const flightRef = useRef<HTMLDivElement>(null)

  // The physics. Refs, not state: nothing here may ever trigger a render.
  const sx = useRef(new Spring(SETTLE_SPRING)).current
  const sy = useRef(new Spring(SETTLE_SPRING)).current
  const fx = useRef(new Spring(THROW_SPRING)).current
  const fy = useRef(new Spring(THROW_SPRING)).current

  const commitDistance = useRef(120)
  const stopLoop = useRef<(() => void) | null>(null)
  const flightSettled = useRef<(() => void) | null>(null)

  const [flipped, setFlipped] = useState(false)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [pulse, setPulse] = useState(0)

  const index = Math.min(rec.state.deckIndex, tiles.length)
  const tile = tiles[index]
  const kept = rec.state.entries.length

  // The commit threshold is a fraction of the card, so the gesture means the
  // same thing on a 360px phone and an 820px tablet.
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      commitDistance.current = Math.max(56, entry.contentRect.width * COMMIT_DISTANCE_RATIO)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /**
   * Write the live card and everything that follows it. Called from the gesture
   * (pointermove is already frame-aligned) and from the spring loop — never
   * from a React render.
   */
  const paint = useCallback(() => {
    const progress = clamp(sx.value / commitDistance.current, -1, 1)
    const rotation = reduced ? 0 : progress * MAX_ROTATION_DEG

    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${sx.value}px, ${sy.value}px, 0) rotate(${rotation}deg)`
    }
    if (keepRef.current) {
      keepRef.current.style.opacity = String(mapRange(progress, WASH_IN, WASH_FULL, 0, 1))
    }
    if (skipRef.current) {
      skipRef.current.style.opacity = String(mapRange(progress, -WASH_IN, -WASH_FULL, 0, 1))
    }

    // The stack rises to meet the thumb — the half of THE ONE THING that
    // happens before the throw has landed.
    const lift = Math.abs(progress)
    const tiers = [tier0Ref.current, tier1Ref.current]
    for (let tier = 0; tier < tiers.length; tier++) {
      const el = tiers[tier]
      if (!el) continue
      const y = mapRange(lift, 0, 1, STACK_OFFSET_Y[tier], STACK_OFFSET_Y_ADVANCED[tier])
      const scale = mapRange(lift, 0, 1, STACK_SCALE[tier], STACK_SCALE_ADVANCED[tier])
      el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
    }
  }, [reduced, sx, sy])

  const paintFlight = useCallback(() => {
    const el = flightRef.current
    if (!el) return
    // Rotation keeps building as the card travels, so it turns as it goes
    // instead of freezing at the angle it was released at.
    const p = clamp(
      fx.value / commitDistance.current,
      -FLIGHT_ROTATION_MULTIPLIER,
      FLIGHT_ROTATION_MULTIPLIER,
    )
    el.style.transform = `translate3d(${fx.value}px, ${fy.value}px, 0) rotate(${p * MAX_ROTATION_DEG}deg)`
  }, [fx, fy])

  /** Start the frame loop, or leave it running. Idempotent. */
  const run = useCallback(() => {
    if (stopLoop.current) return
    stopLoop.current = requestFrames((dt) => {
      // Both axes must step every frame — `||` would short-circuit the second.
      const cardMoving = [sx.step(dt), sy.step(dt)].includes(true)
      const flightMoving = [fx.step(dt), fy.step(dt)].includes(true)

      paint()
      paintFlight()

      if (!flightMoving && flightSettled.current) {
        const done = flightSettled.current
        flightSettled.current = null
        done()
      }
      if (cardMoving || flightMoving) return true
      stopLoop.current = null
      return false
    })
  }, [fx, fy, paint, paintFlight, sx, sy])

  useEffect(() => () => stopLoop.current?.(), [])

  // Repaint when the card changes, so a freshly mounted card starts centred.
  useLayoutEffect(() => {
    paint()
  }, [paint, index])

  /** Send the current card away carrying whatever speed it was thrown with. */
  const commit = useCallback(
    (dir: Dir, velocityPxPerSec = 0) => {
      const t = tiles[index]
      if (!t) return

      // Reduced motion collapses to a crossfade (Tier-1 law): no flight at all.
      if (!reduced) {
        setFlight({
          tile: t,
          dir,
          kept: dir === 1,
          fromX: sx.value,
          fromY: sy.value,
          velocity: velocityPxPerSec || dir * FALLBACK_THROW_VELOCITY,
        })
      }

      // Reset before the next card mounts, or it inherits the last drag.
      sx.set(0)
      sy.set(0)
      setFlipped(false)
      paint()

      if (dir === 1) {
        rec.add(t.id)
        setPulse((p) => p + 1)
        haptic('commit')
      } else {
        haptic('skip')
      }
      rec.markSeen(t.id)
      rec.setDeckIndex(index + 1)
    },
    [index, paint, rec, reduced, sx, sy, tiles],
  )

  // Launch the flight once its element exists, from where the card was released.
  useLayoutEffect(() => {
    if (!flight || reduced) return
    fx.set(flight.fromX)
    fy.set(flight.fromY)
    paintFlight()
    // Far enough that the card is fully gone before the spring rests.
    fx.to(flight.dir * (window.innerWidth + 420), flight.velocity)
    fy.to(flight.fromY + 48)
    flightSettled.current = () => setFlight(null)
    run()
  }, [flight, fx, fy, paintFlight, reduced, run])

  const bind = useDrag(
    ({ down, movement: [mx, my], velocity: [vx], direction: [dx], last, tap }) => {
      if (tap) {
        setFlipped((f) => !f)
        return
      }

      if (down) {
        // Direct manipulation is never sprung — the card tracks the thumb 1:1.
        sx.set(mx)
        sy.set(my * VERTICAL_FOLLOW)
        paint()
        return
      }

      if (!last) return

      // The rule itself lives in lib/motion.ts and is unit-tested there — the
      // component only obeys it.
      const verdict = judgeThrow({
        movementX: mx,
        speedX: vx,
        directionX: dx,
        commitDistance: commitDistance.current,
      })

      if (verdict.commit) {
        commit(verdict.dir, verdict.velocity)
      } else {
        // No commit: the card springs home carrying its release velocity, so a
        // rejected throw still feels like the same physical object.
        sx.to(0, verdict.dir * Math.abs(vx) * 1000)
        sy.to(0)
        run()
      }
    },
    {
      enabled: !flipped && !!tile,
      // A tap must flip the card, never fling it.
      filterTaps: true,
      // Horizontal intent only — a vertical drag should not steer a card.
      axis: 'x',
      // Pointer events (the default) cover mouse, touch and pen with one code
      // path. Do NOT set `pointer: { touch: true }` here: that switches to touch
      // events *instead of* pointer events and silently kills mouse dragging on
      // desktop — which no unit test catches, only a real browser does.
    },
  )

  // Keyboard parity is a launch gate (§QA-5): the deck is fully playable
  // without ever touching it, and the throw still has a speed.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        commit(1, KEYBOARD_THROW_VELOCITY)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        commit(-1, -KEYBOARD_THROW_VELOCITY)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commit])

  if (!rec.hydrated) {
    return <div className="min-h-dvh bg-deck-0" aria-busy="true" />
  }

  const behind0 = tiles[index + 1]
  const behind1 = tiles[index + 2]

  return (
    <div className="flex min-h-dvh flex-col bg-deck-0 text-deck-ink">
      {/* ── counter in the corner ─────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <div>
          <p className="stamp text-deck-ink-dim">La Escalera</p>
          <p className="stamp mt-1 text-deck-ink-dim">
            {Math.min(index + 1, tiles.length)} / {tiles.length}
          </p>
        </div>

        <Link
          href="/muestrario"
          className="flex items-center gap-3 rounded-pill bg-deck-2 py-2 pl-4 pr-2 no-underline"
        >
          <span className="stamp text-deck-ink">Muestrario</span>
          {/* keyed on the count so the tick replays on every keep */}
          <span
            key={pulse}
            className="tabular counter-tick flex h-8 min-w-8 items-center justify-center rounded-pill bg-gold px-2 font-mono text-t0 text-gold-ink"
          >
            {kept}
          </span>
        </Link>
      </header>

      {/* ── the card ──────────────────────────────────────────────────── */}
      <main className="relative mx-auto flex min-h-0 w-full max-w-[520px] flex-1 flex-col px-4">
        <div ref={areaRef} className="relative min-h-0 w-full flex-1">
          {/* The pile underneath is real cards, so the deck has a bottom. The
              entrance animation lives on the wrapper: the inner element's
              transform belongs to the frame loop and cannot be shared. */}
          {behind1 && (
            <div className="deck-enter deck-enter-2 absolute inset-0" aria-hidden>
              <StackFace innerRef={tier1Ref} tile={behind1} eager={false} />
            </div>
          )}
          {behind0 && (
            <div className="deck-enter deck-enter-1 absolute inset-0" aria-hidden>
              <StackFace innerRef={tier0Ref} tile={behind0} eager />
            </div>
          )}

          {/* ── the live card ─────────────────────────────────────────── */}
          {tile && (
            // The gesture binds to a static wrapper, not to the moving card:
            // pointer capture keeps the drag reporting even once the card has
            // travelled out from under the thumb.
            <div
              {...bind()}
              className="deck-enter absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{ touchAction: flipped ? 'auto' : 'none' }}
            >
              <div
                ref={cardRef}
                key={tile.id}
                className="card-pivot absolute inset-0 will-change-transform"
              >
                <TileCard
                  tile={tile}
                  flipped={flipped}
                  onFlip={() => setFlipped(false)}
                  kept={rec.has(tile.id)}
                  priority
                />

                {/* verdict wash — the answer reads before the card leaves the thumb */}
                <div
                  ref={keepRef}
                  aria-hidden
                  style={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-panel ring-4 ring-inset ring-gold"
                >
                  <span className="stamp absolute right-5 top-5 rounded-pill bg-gold px-4 py-2 text-gold-ink">
                    Guardar
                  </span>
                </div>
                <div
                  ref={skipRef}
                  aria-hidden
                  style={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-0 rounded-panel ring-4 ring-inset ring-deck-ink/60"
                >
                  <span className="stamp absolute left-5 top-5 rounded-pill bg-deck-2 px-4 py-2 text-deck-ink">
                    Siguiente
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── the flight layer ──────────────────────────────────────── */}
          {/* The committed card lives here and only here, so its exit can never
              be restarted from rest by a re-render of the deck beneath it. */}
          {flight && (
            <div
              ref={flightRef}
              aria-hidden
              className="card-pivot pointer-events-none absolute inset-0 z-10 will-change-transform"
            >
              <TileCard
                tile={flight.tile}
                flipped={false}
                onFlip={() => {}}
                kept={flight.kept}
                priority
              />
              {flight.kept && (
                <div className="pointer-events-none absolute inset-0 rounded-panel ring-4 ring-inset ring-gold" />
              )}
            </div>
          )}

          {!tile && !flight && <DeckEnd tiles={tiles} />}
        </div>
      </main>

      {/* ── the two actions, also as buttons: thumbs, gloves, keyboards ── */}
      {tile && (
        <div className="mx-auto flex w-full max-w-[520px] items-center gap-3 px-4 pb-6 pt-5">
          <button
            type="button"
            onClick={() => commit(-1, -KEYBOARD_THROW_VELOCITY)}
            className="flex-1 rounded-control border border-deck-ink/25 py-4 text-t1 text-deck-ink transition-transform duration-150 active:scale-[0.97]"
          >
            Siguiente
          </button>
          <button
            type="button"
            onClick={() => commit(1, KEYBOARD_THROW_VELOCITY)}
            className="flex-1 rounded-control bg-gold py-4 text-t1 font-medium text-gold-ink transition-transform duration-150 active:scale-[0.97]"
          >
            Guardar
          </button>
        </div>
      )}

      <UndoToast />
    </div>
  )
}

/** A card resting behind the live one. Scenery: the photo reads, chrome does not. */
function StackFace({
  innerRef,
  tile,
  eager,
}: {
  innerRef: React.RefObject<HTMLDivElement | null>
  tile: Tile
  eager: boolean
}) {
  return (
    <div ref={innerRef} className="h-full w-full origin-top will-change-transform">
      <div className="h-full w-full overflow-hidden rounded-panel bg-deck-1 shadow-elevation-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tile.image}
          alt=""
          className="h-full w-full select-none object-cover opacity-70"
          draggable={false}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
    </div>
  )
}

function DeckEnd({ tiles }: { tiles: Tile[] }) {
  const rec = useRecord()
  const byId = new Map(tiles.map((t) => [t.id, t]))
  const kept = rec.state.entries.map((e) => byId.get(e.tileId)).filter(Boolean) as Tile[]

  return (
    <div className="deck-enter absolute inset-0 flex flex-col overflow-y-auto rounded-panel bg-deck-1 p-6">
      <p className="stamp text-deck-ink-dim">Fin del mazo</p>
      <h2 className="mt-2 text-t3">
        {kept.length === 0 ? 'No guardaste ninguna pieza' : `Tu pila: ${kept.length} piezas`}
      </h2>

      {kept.length > 0 && (
        <ul className="mt-5 flex-1 space-y-2">
          {kept.map((t) => (
            <li
              key={t.id}
              className="tabular flex items-center justify-between gap-3 border-b border-deck-ink/10 pb-2 font-mono text-t0"
            >
              <span>{t.code}</span>
              <span className="text-deck-ink-dim">
                {t.format_mm[0]}×{t.format_mm[1]}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-3">
        {/* Even Rung 1 ends in a message, or it's a toy. */}
        <Link
          href="/muestrario"
          className="block rounded-control bg-gold px-5 py-4 text-center text-t1 font-medium text-gold-ink no-underline"
        >
          {kept.length > 0 ? 'Ir al muestrario' : 'Abrir el muestrario'}
        </Link>
        <button
          type="button"
          onClick={() => rec.setDeckIndex(0)}
          className="w-full rounded-control border border-deck-ink/25 py-3 text-t0 text-deck-ink"
        >
          Volver a empezar
        </button>
      </div>
    </div>
  )
}
