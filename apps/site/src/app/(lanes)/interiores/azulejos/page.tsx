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
import { TourGate } from '@/pasillo/components/TourGate'
import { useRecord } from '@/pasillo/lib/record'

function Aisle() {
  const sheet = useSheet()
  // The tour waits on the record's own hydration signal rather than on mount.
  // Starting on mount is the classic tour bug: the spotlight measures targets
  // that have not been laid out yet and lands on the wrong coordinates.
  const rec = useRecord()
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
      {/* Only on the Lane. The Lista and the record screens are conventional
          and teach themselves; a tour that follows a buyer across four routes
          is a tour that has stopped being about a sequence. */}
      <TourGate ready={rec.hydrated} />
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
