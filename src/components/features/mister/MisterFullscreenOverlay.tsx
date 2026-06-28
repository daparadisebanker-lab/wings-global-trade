// src/components/features/mister/MisterFullscreenOverlay.tsx
// Full-viewport Mister experience. Covers everything (z-100), owns the entire screen.
// Entry: backdrop fade + panel slide up. Exit: reverse. Body scroll locked while open.
// Law 2 (Scoped Experience): host page pixel-identical before/after.
// Law 3: feels like walking through a door — directional motion, clear "back" control.
'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { MisterBrandHeader } from '@/components/features/mister/MisterBrandHeader'
import { MisterMessageList } from '@/components/features/mister/MisterMessageList'
import { MisterComposer } from '@/components/features/mister/MisterComposer'
import { MisterProgressPanel } from '@/components/features/mister/MisterProgressPanel'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  overlayBackdropVariants,
  overlayPanelVariants,
} from '@/lib/mister/motion'

export function MisterFullscreenOverlay() {
  const { isOpen, close } = useMister()
  const reduced = useReducedMotion()

  // Body scroll lock — zero residue on close (Law 2)
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [isOpen])

  // ESC to exit
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mister-overlay-backdrop"
            variants={overlayBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[99] bg-[rgba(0,10,24,0.80)] backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />

          {/* Full-screen panel */}
          <motion.div
            key="mister-overlay-panel"
            variants={overlayPanelVariants}
            initial={reduced ? 'hiddenReduced' : 'hidden'}
            animate={reduced ? 'visibleReduced' : 'visible'}
            exit={reduced ? 'exitReduced' : 'exit'}
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[var(--mister-bg-window)]"
            role="dialog"
            aria-modal="true"
            aria-label="Mister — asesor de importación Wings Global Trade"
          >
            {/* Brand header with overlay-mode exit control */}
            <MisterBrandHeader mode="overlay" onClose={close} />

            {/* Two-column body — same as embedded */}
            <div className="flex flex-1 min-h-0">
              <div className="flex flex-1 flex-col min-h-0">
                <MisterMessageList />
                <MisterComposer />
              </div>
              <MisterProgressPanel />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
