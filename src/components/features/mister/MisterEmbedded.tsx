// src/components/features/mister/MisterEmbedded.tsx
// Full-viewport Mister embedded experience — covers everything (z-100), including SiteNav.
// Uses fixed positioning identical to MisterFullscreenOverlay so the experience is the same
// whether the user arrives via /mister URL or opens the site-wide overlay.
// Body scroll is locked while active; restored on unmount (back navigation / SPA route change).
'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MisterProvider } from '@/components/features/mister/MisterProvider'
import { MisterBrandHeader } from '@/components/features/mister/MisterBrandHeader'
import { MisterMessageList } from '@/components/features/mister/MisterMessageList'
import { MisterComposer } from '@/components/features/mister/MisterComposer'
import { MisterProgressPanel } from '@/components/features/mister/MisterProgressPanel'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { overlayPanelVariants } from '@/lib/mister/motion'

interface Props {
  currentPage?: string
  currentProductId?: string | null
}

export function MisterEmbedded({ currentPage = '/mister', currentProductId = null }: Props) {
  const reduced = useReducedMotion()

  // Body scroll lock — same technique as MisterFullscreenOverlay.
  // position:fixed prevents iOS Safari from scrolling the Wings catalog
  // behind the Mister world. Scroll position is restored on unmount.
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
      {/* Fixed fullscreen takeover — covers SiteNav (z≈50) and all site chrome */}
      <motion.div
        variants={overlayPanelVariants}
        initial={reduced ? 'hiddenReduced' : 'hidden'}
        animate={reduced ? 'visibleReduced' : 'visible'}
        className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[var(--mister-bg-window)] touch-manipulation"
      >
        {/* Brand header — full identity, embedded mode (back link on desktop) */}
        <MisterBrandHeader mode="embedded" />

        {/* Two-column body */}
        <div className="flex flex-1 min-h-0">
          {/* Left: chat column */}
          <div className="flex flex-1 flex-col min-h-0">
            <MisterMessageList />
            <MisterComposer />
          </div>

          {/* Right: progress panel (lg+ only, hidden on mobile) */}
          <MisterProgressPanel />
        </div>
      </motion.div>
    </MisterProvider>
  )
}
