'use client'

// The one control allowed above the thumb zone (§6 refuses top-corner controls
// with exactly this exception): the density switch. Three zoom levels on one
// content set — the Lane for presence, the Lista for comparison. Mosaico sits
// between them and is P2, gated on the pattern-family tagging the facet rail
// needs, so it is absent rather than half-built.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SheetDock } from '@/components/SheetDock'
import { useRecord } from '@/lib/record'
import type { Sku } from '@/types/catalogue'

const VIEWS = [
  { href: '/', label: 'Pasillo' },
  { href: '/lista', label: 'Lista' },
]

export function useSheet() {
  const [sku, setSku] = useState<Sku | null>(null)
  return { sku, open: setSku, close: () => setSku(null) }
}

export function DensitySwitch() {
  const path = usePathname()
  return (
    <nav className="fixed right-3 top-3 z-30 flex rounded-chrome border border-ink/20 bg-surface/90 p-1 backdrop-blur">
      {VIEWS.map((v) => (
        <Link
          key={v.href}
          href={v.href}
          aria-current={path === v.href ? 'page' : undefined}
          className={`stamp rounded-chrome px-3 py-1.5 no-underline ${
            path === v.href ? 'bg-ink text-surface' : 'opacity-resting'
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
  if (path.startsWith('/muestrario') || path.startsWith('/mesa')) return null
  const n = rec.state.folders.reduce((a, f) => a + f.selected.length, 0)
  return (
    <Link
      href="/muestrario"
      className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3
                 rounded-chrome bg-ink px-5 py-3 text-surface no-underline"
    >
      <span className="stamp">Muestrario</span>
      <span className="mono text-[13px]">{n}</span>
    </Link>
  )
}

export { SheetDock }
