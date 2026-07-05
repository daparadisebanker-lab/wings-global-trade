// src/components/features/mister/MisterEmbedded.tsx
// Full-viewport Mister embedded experience on the /mister page.
// SiteNav hides itself on /mister (world boundary established without z-index fighting).
// Body scroll is locked on mount so the Footer below is unreachable.
// Entrance animation matches MisterFullscreenOverlay for experience parity.
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MisterProvider } from '@/components/features/mister/MisterProvider'
import { MisterBrandHeader } from '@/components/features/mister/MisterBrandHeader'
import { MisterMessageList } from '@/components/features/mister/MisterMessageList'
import { MisterComposer } from '@/components/features/mister/MisterComposer'
import { MisterProgressPanel } from '@/components/features/mister/MisterProgressPanel'
import { MisterMobileBrief } from '@/components/features/mister/MisterMobileBrief'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { overlayPanelVariants } from '@/lib/mister/motion'

interface Props {
  currentPage?: string
  currentProductId?: string | null
}

export function MisterEmbedded({ currentPage = '/mister', currentProductId = null }: Props) {
  const reduced = useReducedMotion()

  // Body scroll lock — prevents scrolling to the Footer below.
  // Uses position:fixed (same as overlay) so it works on iOS Safari too.
  useEffect(() => {
    const scrollY = window.scrollY
    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${scrollY}px`,
      left: '0',
      right: '0',
      overflow: 'hidden',
    })
    return () => {
      Object.assign(document.body.style, {
        position: '',
        top: '',
        left: '',
        right: '',
        overflow: '',
      })
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <MisterProvider
      locale="es-PE"
      currentPage={currentPage}
      currentProductId={currentProductId}
    >
      {/* Normal flow layout — SiteNav is already hidden on /mister, so this
          fills 100dvh naturally. overflow-x-clip on <main> would trap fixed
          children, so we use a regular block instead. */}
      <motion.div
        variants={overlayPanelVariants}
        initial={reduced ? 'hiddenReduced' : 'hidden'}
        animate={reduced ? 'visibleReduced' : 'visible'}
        className="flex h-full w-full flex-col overflow-hidden bg-[var(--mister-bg-window)] touch-manipulation"
      >
        {/* Brand header — full identity, embedded mode (back link on desktop) */}
        <MisterBrandHeader mode="embedded" />

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: chat column */}
          <div className="flex flex-1 flex-col min-h-0">
            <MisterMessageList />
            <MisterMobileBrief />
            <MisterComposer />
          </div>

          {/* Right: progress panel (lg+ only, hidden on mobile) */}
          <MisterProgressPanel />
        </div>
      </motion.div>
    </MisterProvider>
  )
}
