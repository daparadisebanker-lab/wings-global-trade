'use client'

// El Pasillo · §4.5-bis — the sheet-dock's desktop frame. THE SECOND PANEL.
//
// A bottom sheet is the correct answer at 390px and the wrong one at 1440. It
// covered the booth it was opened from: the buyer asked to see one tile closely
// and the aisle they were judging it against disappeared behind it. On a phone
// that is unavoidable and the swipe-to-dismiss makes it cheap. On a desktop
// there is a whole second column of empty ground beside the booth, and hiding
// the product in order to describe it is a straight loss.
//
// So above lg the aisle becomes two panels: the booth narrows and keeps walking,
// the spec stands beside it, and tapping a face swaps the panel's contents
// without closing anything. The comparison a buyer actually makes — this face,
// against the rest of the series, against these figures — happens on one screen.
//
// IT IS NOT A DIALOG, and that is the whole design. There is no overlay, no
// focus trap and no aria-modal: the buyer keeps swiping the aisle, keeps
// scrubbing the rail and keeps opening faces with the panel open. A modal would
// have re-created the bottom sheet's problem with better manners.
//
// Escape still closes it, because a panel that can only be dismissed with a
// mouse is a panel a keyboard buyer is stuck with.

import { useEffect, useState } from 'react'
import { SkuDetail } from '@/pasillo/components/SkuDetail'
import type { Sku } from '@/pasillo/types/catalogue'

export function SkuPanel({
  sku,
  onClose,
  onOpenSku,
}: {
  sku: Sku | null
  onClose: () => void
  onOpenSku: (sku: Sku) => void
}) {
  const [shown, setShown] = useState<Sku | null>(sku)

  // Same cross-fade contract as the sheet: the frame never moves when the SKU
  // changes, only the contents. On this frame that matters more, because the
  // sibling strip is inside the panel — clicking it must not make the panel
  // itself flinch.
  useEffect(() => {
    if (!sku) return
    if (!shown || shown.sku_uid === sku.sku_uid) {
      setShown(sku)
      return
    }
    const t = setTimeout(() => setShown(sku), 90)
    return () => clearTimeout(t)
  }, [sku, shown])

  useEffect(() => {
    if (!sku) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sku, onClose])

  const active = shown ?? sku
  if (!sku || !active) return null

  return (
    <aside
      aria-label={`Ficha de ${active.code}`}
      // Its own scroll, so the spec table can be long without the booth beside
      // it ever moving. The rule is the seam between the aisle's ground and the
      // record's — the same hairline every other surface here is divided by.
      className="flex h-full w-[26rem] shrink-0 flex-col overflow-y-auto border-l pas-rule
                 bg-pas-surface px-pas-5 py-pas-5 xl:w-[30rem]"
    >
      <div key={active.sku_uid} className="transition-opacity duration-pas-cross">
        <SkuDetail sku={active} onOpenSku={onOpenSku} onClose={onClose} />
      </div>
    </aside>
  )
}
