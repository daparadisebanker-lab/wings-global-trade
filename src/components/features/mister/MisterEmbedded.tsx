// src/components/features/mister/MisterEmbedded.tsx
// Full-page embedded Mister layout. Two columns on desktop (chat + progress panel).
// Does NOT use MisterWindow — that's for floating mode only.
// Brand identity via MisterBrandHeader; floating uses the compact MisterHeader.
'use client'

import { MisterProvider } from '@/components/features/mister/MisterProvider'
import { MisterBrandHeader } from '@/components/features/mister/MisterBrandHeader'
import { MisterMessageList } from '@/components/features/mister/MisterMessageList'
import { MisterComposer } from '@/components/features/mister/MisterComposer'
import { MisterProgressPanel } from '@/components/features/mister/MisterProgressPanel'

interface Props {
  currentPage?: string
  currentProductId?: string | null
}

export function MisterEmbedded({ currentPage = '/mister', currentProductId = null }: Props) {
  return (
    <MisterProvider
      locale="es-PE"
      currentPage={currentPage}
      currentProductId={currentProductId}
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--mister-bg-window)]">
        {/* Brand header — full identity, embedded only */}
        <MisterBrandHeader />

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: chat column */}
          <div className="flex flex-1 flex-col min-h-0 border-[var(--mister-border-window)]">
            <MisterMessageList />
            <MisterComposer />
          </div>

          {/* Right: progress panel (lg+ only, hidden on mobile) */}
          <MisterProgressPanel />
        </div>
      </div>
    </MisterProvider>
  )
}
