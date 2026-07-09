// src/components/features/mister/MisterSiteWidget.tsx
// Self-contained Mister site widget: always mounted in layout.tsx.
// One MisterProvider wraps both the floating button and the fullscreen overlay,
// so session state persists across open/close — the conversation never resets.
// This provider and the /mister page's provider are separate instances, but
// both read the same 'wgt-mister-session' localStorage key and rehydrate from
// the DB, so a visitor keeps one conversation across the widget ↔ /mister
// hand-off and across reloads (MisterProvider handles this internally).
'use client'

import { MisterProvider } from '@/components/features/mister/MisterProvider'
import { MisterFloatingButton } from '@/components/features/mister/MisterFloatingButton'
import { MisterFullscreenOverlay } from '@/components/features/mister/MisterFullscreenOverlay'

export function MisterSiteWidget() {
  return (
    <MisterProvider locale="es-PE">
      {/* Floating entry point — visible on all pages except /mister */}
      <MisterFloatingButton />
      {/* Fullscreen overlay — renders above everything when isOpen */}
      <MisterFullscreenOverlay />
    </MisterProvider>
  )
}
