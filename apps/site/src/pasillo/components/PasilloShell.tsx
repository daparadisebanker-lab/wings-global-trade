'use client'

// The one control allowed above the thumb zone (§6 refuses top-corner controls
// with exactly this exception): the density switch. Three zoom levels on one
// content set — the Lane for presence, the Lista for comparison. Mosaico sits
// between them and is P2, gated on the pattern-family tagging the facet rail
// needs, so it is absent rather than half-built.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SheetDock } from '@/pasillo/components/SheetDock'
import { useRecord } from '@/pasillo/lib/record'
import { PASILLO_ROUTES } from '@/pasillo/lib/routes'
import type { Sku } from '@/pasillo/types/catalogue'

const VIEWS = [
  { href: PASILLO_ROUTES.lane, label: 'Recorrido' },
  { href: PASILLO_ROUTES.lista, label: 'Lista' },
]

export function useSheet() {
  const [sku, setSku] = useState<Sku | null>(null)
  // Both handles are stable. `close` used to be a fresh closure every render,
  // which was harmless while only a button called it and is not once the Lane
  // takes it as a dependency — an unstable callback there rebuilds the whole
  // advance/collect/pass chain on every render of a route that owns a drag loop.
  const close = useCallback(() => setSku(null), [])
  return { sku, open: setSku, close }
}

export function DensitySwitch() {
  const path = usePathname()
  return (
    // THE FIXED CHROME RIDES THE MEASURE, NOT THE WINDOW.
    // Pinned to the viewport's right edge this pill sat ~145px outside the
    // content column at 1440 and ~330px at 1920 — floating in empty ground,
    // reading as browser furniture rather than as this catalogue's own switch.
    // The wrapper only positions and takes no pointer events, so a full-width
    // band cannot swallow taps; the nav itself keeps its target.
    <div className="pas-measure pointer-events-none fixed inset-x-0 top-3 z-30 flex justify-end px-3">
      {/* Opaque, not translucent. The blur sat on a 163×38 pill over a near-black
          ground where it was invisible, while keeping a compositing layer alive
          through the drag loop — and the spec's own refusal list names blur
          stacks as the battery line item. */}
      <nav className="pointer-events-auto flex rounded-pas-chrome border border-pas-ink/20 bg-pas-surface p-1">
        {VIEWS.map((v) => (
          <Link
            key={v.href}
            href={v.href}
            aria-current={path === v.href ? 'page' : undefined}
            // before:-inset-2 extends the hit area to a thumb's worth without
            // inflating the chrome — density is the point; the target is not.
            className={`pas-stamp relative rounded-pas-chrome px-3 py-2 no-underline before:absolute before:-inset-2 before:content-[''] ${
              path === v.href ? 'bg-pas-ink text-pas-surface' : 'opacity-pas-resting'
            }`}
          >
            {v.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

/**
 * The exit. The aisle drops the site header — correctly, it is a viewport tool
 * and a fixed header would take the bottom bar the muestrario tab lives in — but
 * it replaced the header's three functions (identity, location, way up) with
 * nothing. A buyer arriving on a shared link, which is this tool's own export
 * channel, landed on a dark full-viewport surface with no Wings mark and no way
 * back except leaving the site.
 *
 * One stamp does all three, in the top-left zone the view switch already
 * concedes, and stays achromatic so the colour doctrine holds.
 */
export function LaneExit({ variant = 'inline' }: { variant?: 'inline' | 'fixed' }) {
  const link = (
    <Link
      href={PASILLO_ROUTES.parent}
      // border-current, not a token: this renders on the dark aisle AND on the
      // light record ground, so the rule must be whatever the ink is here. The
      // element's own resting opacity softens it — achromatic on both.
      // The fixed variant is used ONLY on the Lane, and it sits outside the
      // Lane's own colour context — as a sibling it inherits [data-app]'s ink
      // (#141414) onto the #0D0D0D aisle ground, i.e. invisible. It has to name
      // the paper explicitly. The inline variant lives inside a record-ground
      // header and correctly inherits ink there.
      className={`pas-stamp inline-flex items-center gap-2 no-underline opacity-pas-resting
                  transition-opacity duration-pas-light hover:opacity-pas-lit focus-visible:opacity-pas-lit ${
                    variant === 'fixed'
                      ? 'pointer-events-auto rounded-pas-chrome border border-pas-surface/30 px-3 py-2 text-pas-surface'
                      : ''
                  }`}
    >
      <span aria-hidden>←</span>
      <span>WGT/02 · Interiores</span>
    </Link>
  )

  if (variant !== 'fixed') return link

  // Same law as the density switch opposite it: the fixed chrome rides the
  // measure, not the window, or the two stamps that frame the booth end up
  // 330px outside it on a wide screen while the booth sits centred between them.
  return (
    <div className="pas-measure pointer-events-none fixed inset-x-0 top-3 z-30 flex px-3">
      {link}
    </div>
  )
}

/** The muestrario is a persistent tab, not a route transition — the record must
 *  be reachable in under 200ms from anywhere. */
export function RecordTab() {
  const rec = useRecord()
  const path = usePathname()
  if (path.startsWith(PASILLO_ROUTES.muestrario) || path.startsWith(PASILLO_ROUTES.mesa)) return null
  const n = rec.state.folders.reduce((a, f) => a + f.selected.length, 0)
  return (
    <Link
      href={PASILLO_ROUTES.muestrario}
      data-tour="record-tab"
      className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3
                 rounded-pas-chrome bg-pas-ink px-pas-5 py-3 text-pas-surface no-underline"
    >
      <span className="pas-stamp">Muestrario</span>
      <span className="pas-mono text-pas-dense">{n}</span>
    </Link>
  )
}

export { SheetDock }
