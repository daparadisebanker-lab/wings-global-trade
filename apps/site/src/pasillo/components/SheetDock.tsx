'use client'

// El Pasillo · §4.5 — the sheet-dock. THE PHONE FRAME.
//
// Soft chrome over a hard record: the corners a thumb touches are rounded, the
// table inside is ruled key/value with no cards, no chips and no icons. A ruled
// row does a card's work for one hairline.
//
// Peek carries the 3×3 repeat, the code and the collect action — enough to judge
// the field and collect without leaving the view. Full adds the spec table and
// the sibling strip, so a buyer who likes this pattern sees its family without
// navigating away.
//
// The frame never moves when the SKU changes; only the contents cross-fade.
//
// The body it wraps lives in SkuDetail, shared with the desktop side panel. A
// bottom sheet is the right answer at 390px and the wrong one at 1440, where it
// covers the aisle it was opened from — see SkuPanel.

import { Drawer } from 'vaul'
import { useEffect, useState } from 'react'
import { SkuDetail } from '@/pasillo/components/SkuDetail'
import type { Sku } from '@/pasillo/types/catalogue'

export function SheetDock({
  sku,
  onClose,
  onOpenSku,
}: {
  sku: Sku | null
  onClose: () => void
  onOpenSku: (sku: Sku) => void
}) {
  const [shown, setShown] = useState<Sku | null>(sku)

  // Cross-fade the contents when the SKU changes; the frame stays put.
  useEffect(() => {
    if (!sku) return
    if (!shown || shown.sku_uid === sku.sku_uid) {
      setShown(sku)
      return
    }
    const t = setTimeout(() => setShown(sku), 90)
    return () => clearTimeout(t)
  }, [sku, shown])

  const active = shown ?? sku

  return (
    <Drawer.Root open={!!sku} onOpenChange={(o) => !o && onClose()} snapPoints={[0.35, 0.92]}>
      <Drawer.Portal>
        {/* data-app is REQUIRED on both portal children and is not decoration.
            vaul portals to <body>, which is outside the [data-app='pasillo']
            wrapper the route layout stamps — so every --pas-* token, every
            scoped selector (.pas-mono, .pas-stamp, .pas-rule, the focus ring)
            and the Archivo/Geist Mono faces silently fail inside the portal.
            The drawer rendered transparent, in the site's body face, with SKU
            codes NOT in mono — breaking the one doctrine that matters most on
            the one surface where the buyer studies the code. It only looked
            plausible on the dark Lane, where white-on-blur reads by accident.
            Re-stamping the attribute brings the token layer through the portal. */}
        <Drawer.Overlay
          data-app="pasillo"
          className="fixed inset-0 z-40 bg-pas-lane-ground/55 backdrop-blur-[var(--pas-blur-scrim)]"
        />
        <Drawer.Content
          data-app="pasillo"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[92dvh] max-w-2xl flex-col
                     rounded-t-pas-chrome bg-pas-surface outline-none"
        >
          <Drawer.Handle className="mx-auto my-3 h-1 w-10 shrink-0 rounded-full bg-pas-ink/20" />

          {active && (
            <div
              key={active.sku_uid}
              className="flex-1 overflow-y-auto px-pas-5 pb-pas-8 transition-opacity duration-pas-cross"
            >
              <Drawer.Title className="sr-only">{active.code}</Drawer.Title>
              <SkuDetail sku={active} onOpenSku={onOpenSku} />
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
