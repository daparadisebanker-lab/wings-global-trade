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
import { SkuPanel } from '@/pasillo/components/SkuPanel'
import { TourGate } from '@/pasillo/components/TourGate'
import { SPLIT_QUERY, useMediaQuery } from '@/pasillo/hooks/useMediaQuery'
import { useRecord } from '@/pasillo/lib/record'

function Aisle() {
  const sheet = useSheet()
  // The tour waits on the record's own hydration signal rather than on mount.
  // Starting on mount is the classic tour bug: the spotlight measures targets
  // that have not been laid out yet and lands on the wrong coordinates.
  const rec = useRecord()

  // TWO PANELS ABOVE lg, ONE BELOW — and the frame is chosen here rather than
  // inside the dock, so exactly one of the two ever mounts. Rendering both and
  // hiding one with a media class would keep a vaul drawer, its overlay and its
  // scroll lock alive underneath the desktop panel.
  const wide = useMediaQuery(SPLIT_QUERY)
  const split = wide && !!sheet.sku

  return (
    // THE FIXED CHROME IS CONTAINED BY THE LEFT PANEL, ON PURPOSE.
    // transform-gpu makes this element the containing block for every
    // position:fixed descendant, so the exit stamp, the density switch, the
    // record tab and the edge scrubber all re-anchor to the booth's column the
    // moment the panel opens — instead of staying pinned to a window that is no
    // longer the thing they belong to. With no panel open the column IS the
    // window, so nothing moves and the phone layout is byte-identical.
    // (The vaul sheet portals to <body> and is unaffected either way.)
    <div
      className="group/aisle flex h-dvh overflow-hidden"
      data-panel={split ? 'open' : undefined}
    >
      <div className="relative min-w-0 flex-1 transform-gpu">
        {/* The Lane has no header of its own — its counter lives inside the
            draggable card and would travel with the drag — so the way out is a
            fixed stamp. Every other view carries the same exit in its header. */}
        <LaneExit variant="fixed" />
        <DensitySwitch />
        {/* The open SKU is passed only when the panel is what is showing it. On
            a phone the sheet covers the booth, so marking a face nobody can see
            is state with no reader. */}
        <Lane
          onOpenSku={sheet.open}
          openSkuUid={split ? sheet.sku?.sku_uid : null}
          onSeriesChange={sheet.close}
        />
        <RecordTab />
        {/* Only on the Lane. The Lista and the record screens are conventional
            and teach themselves; a tour that follows a buyer across four routes
            is a tour that has stopped being about a sequence. */}
        <TourGate ready={rec.hydrated} />
      </div>

      {split ? (
        <SkuPanel sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
      ) : (
        <SheetDock sku={sheet.sku} onClose={sheet.close} onOpenSku={sheet.open} />
      )}
    </div>
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
