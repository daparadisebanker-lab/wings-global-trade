// src/components/features/mister/MisterFloatingButton.tsx
// Persistent site-wide entry point to the Mister fullscreen overlay.
// Fixed bottom-right. Structural, not a chat bubble — a door, not a widget.
// Visible on all pages via layout.tsx. Hidden on /mister (embedded mode there).
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { launcherVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function MisterFloatingButton() {
  const { toggle, isOpen, entries, inFlight, isStreaming } = useMister()
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Hide on the /mister page — embedded mode handles it there
  if (!mounted || pathname === '/mister') return null

  const hasActiveSession = entries.length > 1
  const isPulsing = inFlight || isStreaming

  return (
    <motion.div
      variants={launcherVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="fixed bottom-8 right-8 z-[60]"
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? 'Cerrar Mister' : 'Abrir Mister — asesor de importación'}
        aria-expanded={isOpen}
        className="group relative flex h-12 items-center gap-3 border border-[var(--mister-gold-rule)] bg-[var(--mister-bg-window)] px-5 transition-all duration-200 hover:border-[var(--mister-gold)] hover:bg-[rgba(196,147,63,0.06)]"
      >
        {/* Active session pulse indicator */}
        {hasActiveSession && (
          <span
            className={`block h-1.5 w-1.5 flex-shrink-0 rounded-none bg-[var(--mister-gold)] ${
              isPulsing ? 'animate-pulse' : ''
            }`}
            aria-hidden
          />
        )}

        {/* Label */}
        <span className="font-mono text-[11px] font-[600] uppercase tracking-[0.18em] text-[var(--mister-text-primary)] transition-colors duration-200 group-hover:text-[var(--mister-gold)]">
          {isOpen ? 'CERRAR' : 'MISTER IA'}
        </span>

        {/* Arrow indicator */}
        <span
          className={`font-mono text-[11px] text-[var(--mister-text-ghost)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 group-hover:translate-x-0' : 'group-hover:translate-x-0.5'
          }`}
          aria-hidden
        >
          {isOpen ? '↓' : '↑'}
        </span>
      </button>
    </motion.div>
  )
}
