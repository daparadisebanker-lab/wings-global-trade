'use client'

// El Pasillo · §4.3 — the SKU tile.
//
// Square always: the product is square, and framing it otherwise misrepresents
// it. No stroke, no radius, no gap-fill — the grid is the structure, and a card
// around a tile would be a second frame competing with the one the tile already
// has. The caption is the supplier's own three lines, at three opacities and one
// type size.
//
// The collected mark is achromatic (§5). A coloured tick would vanish on some
// tiles in this catalogue and clash with others, so state is carried by form and
// value: a double-stroke inset, paper then ink, plus a filled ink corner
// triangle with a paper check. It reads the same on a white tile, a navy tile
// and a pink one.

import { useCallback, useRef } from 'react'
import { finishLabel, patternLabel } from '@/pasillo/lib/catalogue'
import { haptic } from '@/pasillo/lib/record'
import type { Sku } from '@/pasillo/types/catalogue'

const LONG_PRESS_MS = 420

export function SkuTile({
  sku,
  collected,
  dimmed = false,
  onOpen,
  onCollect,
  showCaption = true,
}: {
  sku: Sku
  collected: boolean
  /** filter non-match: dims in place, never unmounts */
  dimmed?: boolean
  onOpen: (sku: Sku) => void
  onCollect: (sku: Sku) => void
  showCaption?: boolean
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fired = useRef(false)

  const start = useCallback(() => {
    fired.current = false
    timer.current = setTimeout(() => {
      fired.current = true
      haptic('collect')
      onCollect(sku)
    }, LONG_PRESS_MS)
  }, [onCollect, sku])

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }, [])

  return (
    <figure
      className={`m-0 transition-opacity duration-pas-light ${dimmed ? 'opacity-pas-dimmed' : 'opacity-pas-lit'}`}
    >
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          // a long-press already acted; the release must not also open the sheet
          if (fired.current) return
          onOpen(sku)
        }}
        aria-label={`${sku.code}, ${finishLabel(sku)}${collected ? ', en el muestrario' : ''}`}
        className="relative block aspect-square w-full select-none overflow-hidden rounded-pas-record bg-pas-surface-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sku.thumb}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        {collected && (
          <>
            <span aria-hidden className="pas-collected-mark pointer-events-none absolute inset-0" />
            <span aria-hidden className="pas-collected-corner" />
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="absolute bottom-[3px] left-[3px] h-[11px] w-[11px]"
              fill="none"
              stroke="rgb(var(--pas-surface))"
              strokeWidth="1.6"
              strokeLinecap="square"
            >
              <path d="M1 5.2 L3.6 7.8 L9 2.4" />
            </svg>
          </>
        )}
      </button>

      {showCaption && (
        <figcaption className="pt-1.5">
          {/* the code is what a buyer pastes into WhatsApp at 11pm — pas-mono, always */}
          <p className="pas-mono text-pas-label leading-tight opacity-pas-lit">{sku.code}</p>
          <p className="text-pas-label leading-tight opacity-pas-resting">{finishLabel(sku)}</p>
          <p className="text-pas-label leading-tight opacity-pas-dimmed">{patternLabel(sku)}</p>
        </figcaption>
      )}
    </figure>
  )
}
