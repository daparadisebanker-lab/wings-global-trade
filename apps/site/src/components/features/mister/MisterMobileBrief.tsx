// src/components/features/mister/MisterMobileBrief.tsx
// Mobile counterpart to MisterProgressPanel (which is `hidden … lg:flex`).
// Collapsed: a slim strip above the composer — stage, fields-filled count,
// archetype. Expanded: a bottom sheet reusing ProgressBriefContent so mobile
// visitors get the same qualification-progress "expediente" desktop has.
'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ProgressBriefContent,
  useProgressBriefData,
  STAGE_LABELS,
  ARCHETYPE_LABELS,
} from '@/components/features/mister/MisterProgressPanel'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { HAPTIC } from '@/lib/mister/haptics'
import { overlayBackdropVariants, mobileBriefSheetVariants } from '@/lib/mister/motion'

export function MisterMobileBrief() {
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()
  const { stage, archetype, isResolved, definedCount, totalCount } = useProgressBriefData()

  const handleStripTap = () => {
    HAPTIC.stageExpand()
    setExpanded((prev) => !prev)
  }

  const handleCollapse = () => setExpanded(false)

  return (
    <div className="flex-shrink-0 lg:hidden">
      {/* Collapsed strip — sits directly above the composer */}
      <button
        type="button"
        onClick={handleStripTap}
        aria-expanded={expanded}
        aria-label="Ver resumen de sesión"
        className="flex min-h-[44px] w-full items-center gap-3 border-t border-[rgba(248,246,240,0.08)] bg-[var(--mister-bg-header)] px-4 touch-manipulation"
      >
        <span className="flex flex-shrink-0 items-center gap-1.5">
          <span className="h-1.5 w-1.5 flex-shrink-0 bg-[var(--mister-gold)]" aria-hidden />
          <span className="font-mono text-[10px] font-[600] uppercase tracking-[0.10em] text-[var(--mister-gold)]">
            {STAGE_LABELS[stage]}
          </span>
        </span>
        <span className="flex-shrink-0 font-mono text-[10px] font-[300] uppercase tracking-[0.08em] text-[var(--mister-text-muted)]">
          {definedCount} de {totalCount}
        </span>
        <span className="min-w-0 flex-1 truncate text-right font-mono text-[10px] font-[500] uppercase tracking-[0.06em] text-[var(--mister-text-ghost)]">
          {isResolved ? (ARCHETYPE_LABELS[archetype] ?? '') : 'Identificando…'}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop — reuses the fullscreen overlay's fade, opacity-only so
                it's exempt from reduced-motion the same way the overlay is. */}
            <motion.div
              key="mister-mobile-brief-backdrop"
              variants={overlayBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleCollapse}
              aria-hidden
              className="fixed inset-0 z-40 bg-[rgba(0,10,24,0.55)]"
            />

            {/* Sheet — fixed positioning binds to the nearest transformed
                ancestor (the overlay/embedded panel, which framer-motion keeps
                on a transform), not the true viewport, so this docks to the
                bottom of the Mister window rather than the browser chrome. */}
            <motion.div
              key="mister-mobile-brief-sheet"
              variants={mobileBriefSheetVariants}
              initial={reduced ? 'hiddenReduced' : 'hidden'}
              animate={reduced ? 'visibleReduced' : 'visible'}
              exit={reduced ? 'exitReduced' : 'exit'}
              role="dialog"
              aria-label="Resumen de sesión"
              className="fixed inset-x-0 bottom-0 z-40 flex max-h-[70%] flex-col overflow-hidden border-t border-[rgba(248,246,240,0.08)] bg-[var(--mister-bg-header)] shadow-[0_-8px_32px_rgba(0,10,24,0.45)]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2.5 pb-1" aria-hidden>
                <div className="h-1 w-9 bg-[rgba(248,246,240,0.20)]" />
              </div>

              {/* Header row */}
              <div className="flex items-center justify-between border-b border-[rgba(248,246,240,0.08)] px-5 pb-3">
                <p className="font-mono text-[9px] font-[400] uppercase tracking-[0.16em] text-[var(--mister-text-ghost)]">
                  RESUMEN DE SESIÓN
                </p>
                <button
                  type="button"
                  onClick={handleCollapse}
                  aria-label="Cerrar resumen"
                  className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--mister-text-ghost)]"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1" />
                    <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ProgressBriefContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
