'use client'

// The one control allowed above the thumb zone (§6 refuses top-corner controls
// with exactly this exception): the density switch. Three zoom levels on one
// content set — the Lane for presence, the Lista for comparison. Mosaico sits
// between them and is P2, gated on the pattern-family tagging the facet rail
// needs, so it is absent rather than half-built.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  return { sku, open: setSku, close: () => setSku(null) }
}

export function DensitySwitch() {
  const path = usePathname()
  return (
    <nav className="fixed right-3 top-3 z-30 flex rounded-pas-chrome border border-pas-ink/20 bg-pas-surface/90 p-1 backdrop-blur">
      {VIEWS.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          aria-current={path === v.href ? 'page' : undefined}
          className={`pas-stamp rounded-pas-chrome px-3 py-1.5 no-underline ${
            path === v.href ? 'bg-pas-ink text-pas-surface' : 'opacity-pas-resting'
          }`}
        >
          {v.label}
        </Link>
      ))}
    </nav>
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
      className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3
                 rounded-pas-chrome bg-pas-ink px-pas-5 py-3 text-pas-surface no-underline"
    >
      <span className="pas-stamp">Muestrario</span>
      <span className="pas-mono text-pas-dense">{n}</span>
    </Link>
  )
}

export { SheetDock }
