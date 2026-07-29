'use client'

import { Suspense } from 'react'
import { Lane } from '@/pasillo/components/Lane'
import {
  DensitySwitch,
  LaneExit,
  RecordTab,
  SheetDock,
  useSheet,
} from '@/pasillo/components/PasilloShell'

function Aisle() {
  const sheet = useSheet()
  return (
    <>
      {/* The Lane has no header of its own — its counter lives inside the
          draggable card and would travel with the drag — so the way out is a
          fixed stamp. Every other view carries the same exit in its header. */}
      <LaneExit variant="fixed" />
      <DensitySwitch />
      <Lane onOpenSku={sheet.open} />
      <RecordTab />
      <SheetDock sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
    </>
  )
}

export default function AzulejosPage() {
  // The Lane reads ?serie= / ?sku= so a shortlist can be shared as a link rather
  // than a screenshot. useSearchParams needs a boundary or the whole route drops
  // out of static prerendering — and on this route the speed IS the product.
  return (
    <Suspense>
      <Aisle />
    </Suspense>
  )
}
