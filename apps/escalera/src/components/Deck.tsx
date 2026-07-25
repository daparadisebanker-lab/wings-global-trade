'use client'

// La Escalera · Rung 1 — THE DECK.
//
// "One tile card, full bleed. Swipe right = add. Swipe left = next. Counter in
// the corner. That's it."  The incumbent is a 60-page PDF pinched and zoomed on
// a phone; a deck you can thumb at two tiles per second, one-handed, in a
// warehouse, is a category upgrade on day one.
//
// The enemy at this rung is adding anything else. Everything below is either a
// gesture, the counter, the undo toast, or the way out to the record.

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion'
import { TileCard } from '@/components/TileCard'
import { useRecord } from '@/lib/record'
import type { Tile } from '@/types/tile'

/** Commit threshold in "swipe power" — travel plus a slice of the throw. */
const COMMIT = 110
const VELOCITY_WEIGHT = 0.22

type Dir = 1 | -1

function haptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(8)
    } catch {
      /* vibration is a nicety, never a failure */
    }
  }
}

function SwipeCard({
  tile,
  kept,
  onCommit,
  dir,
}: {
  tile: Tile
  kept: boolean
  onCommit: (d: Dir) => void
  dir: Dir
}) {
  const [flipped, setFlipped] = useState(false)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)

  // The card leans into the throw — the whole "physical chip" read comes from
  // rotation tracking travel, not from the translation itself.
  const rotate = useTransform(x, [-320, 0, 320], [-9, 0, 9])
  const addGlow = useTransform(x, [30, 150], [0, 1])
  const skipGlow = useTransform(x, [-150, -30], [1, 0])

  const handleEnd = useCallback(
    (_e: unknown, info: PanInfo) => {
      const power = info.offset.x + info.velocity.x * VELOCITY_WEIGHT
      if (power > COMMIT) onCommit(1)
      else if (power < -COMMIT) onCommit(-1)
      // else: framer springs it home on its own
    },
    [onCommit],
  )

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ x, rotate }}
      drag={flipped ? false : 'x'}
      dragElastic={0.7}
      dragSnapToOrigin
      dragMomentum={false}
      onDragEnd={handleEnd}
      onTap={() => setFlipped((f) => !f)}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={
        reduced
          ? { opacity: 0, transition: { duration: 0.15 } }
          : {
              x: dir * 620,
              opacity: 0,
              rotate: dir * 14,
              transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
            }
      }
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
    >
      <TileCard
        tile={tile}
        flipped={flipped}
        onFlip={() => setFlipped(false)}
        kept={kept}
        priority
      />

      {/* verdict wash — reads before the card has left the thumb */}
      <motion.div
        aria-hidden
        style={{ opacity: addGlow }}
        className="pointer-events-none absolute inset-0 rounded-panel ring-4 ring-inset ring-gold"
      >
        <span className="stamp absolute right-5 top-5 rounded-pill bg-gold px-4 py-2 text-gold-ink">
          Guardar
        </span>
      </motion.div>
      <motion.div
        aria-hidden
        style={{ opacity: skipGlow }}
        className="pointer-events-none absolute inset-0 rounded-panel ring-4 ring-inset ring-deck-ink/60"
      >
        <span className="stamp absolute left-5 top-5 rounded-pill bg-deck-2 px-4 py-2 text-deck-ink">
          Siguiente
        </span>
      </motion.div>
    </motion.div>
  )
}

export function Deck({ tiles }: { tiles: Tile[] }) {
  const rec = useRecord()
  const [dir, setDir] = useState<Dir>(1)
  const [pulse, setPulse] = useState(0)

  const index = Math.min(rec.state.deckIndex, tiles.length)
  const tile = tiles[index]
  const kept = rec.state.entries.length

  const commit = useCallback(
    (d: Dir) => {
      const t = tiles[index]
      if (!t) return
      setDir(d)
      if (d === 1) {
        rec.add(t.id)
        setPulse((p) => p + 1)
        haptic()
      }
      rec.markSeen(t.id)
      rec.setDeckIndex(index + 1)
    },
    [index, rec, tiles],
  )

  // Keyboard parity is a launch gate (§QA-5): the deck is fully playable
  // without ever touching it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        commit(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        commit(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [commit])

  if (!rec.hydrated) {
    return <div className="min-h-dvh bg-deck-0" aria-busy="true" />
  }

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
          <motion.span
            key={pulse}
            initial={pulse ? { scale: 1.35 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="tabular flex h-8 min-w-8 items-center justify-center rounded-pill bg-gold px-2 font-mono text-t0 text-gold-ink"
          >
            {kept}
          </motion.span>
        </Link>
      </header>

      {/* ── the card ──────────────────────────────────────────────────── */}
      {/* min-h-0 lets the card actually take the leftover height instead of
          being pinned to its content — the photo is the argument, so it gets
          every pixel between the counter and the two buttons. */}
      {/* The card takes every pixel between the counter and the two buttons —
          the photo is the argument. `main` must itself be a flex column and
          `min-h-0` must be on both: a percentage height cannot resolve against
          a flex-basis:0 parent, which silently collapses the card to nothing. */}
      <main className="relative mx-auto flex min-h-0 w-full max-w-[520px] flex-1 flex-col px-4">
        <div className="relative min-h-0 w-full flex-1">
          {/* the pile underneath, so the deck reads as a stack of chips */}
          {tile && (
            <>
              <div className="absolute inset-x-3 -bottom-2 top-3 rounded-panel bg-deck-2" />
              <div className="absolute inset-x-1.5 -bottom-1 top-1.5 rounded-panel bg-deck-1" />
            </>
          )}

          <AnimatePresence mode="popLayout" custom={dir}>
            {tile ? (
              <SwipeCard
                key={tile.id}
                tile={tile}
                dir={dir}
                kept={rec.has(tile.id)}
                onCommit={commit}
              />
            ) : (
              <DeckEnd key="end" tiles={tiles} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── the two actions, also as buttons: thumbs, gloves, keyboards ── */}
      {tile && (
        <div className="mx-auto flex w-full max-w-[520px] items-center gap-3 px-4 pb-6 pt-5">
          <button
            type="button"
            onClick={() => commit(-1)}
            className="flex-1 rounded-control border border-deck-ink/25 py-4 text-t1 text-deck-ink"
          >
            Siguiente
          </button>
          <button
            type="button"
            onClick={() => commit(1)}
            className="flex-1 rounded-control bg-gold py-4 text-t1 font-medium text-gold-ink"
          >
            Guardar
          </button>
        </div>
      )}

      <UndoToast />
    </div>
  )
}

function DeckEnd({ tiles }: { tiles: Tile[] }) {
  const rec = useRecord()
  const byId = new Map(tiles.map((t) => [t.id, t]))
  const kept = rec.state.entries.map((e) => byId.get(e.tileId)).filter(Boolean) as Tile[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col overflow-y-auto rounded-panel bg-deck-1 p-6"
    >
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
              <span className="text-deck-ink-dim">{t.format_mm[0]}×{t.format_mm[1]}</span>
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
    </motion.div>
  )
}

/** Rung 1 spec: "Undo = a 4-second toast. Nothing else." */
export function UndoToast() {
  const rec = useRecord()
  return (
    <AnimatePresence>
      {rec.undo && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          role="status"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-[520px] items-center justify-between gap-4 rounded-dock bg-deck-2 px-5 py-4 shadow-elevation-3"
        >
          <span className="text-t0 text-deck-ink">
            <span className="font-mono">{rec.undo.label}</span> fuera del muestrario
          </span>
          <button
            type="button"
            onClick={rec.runUndo}
            className="stamp rounded-pill bg-gold px-4 py-2 text-gold-ink"
          >
            Deshacer
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
