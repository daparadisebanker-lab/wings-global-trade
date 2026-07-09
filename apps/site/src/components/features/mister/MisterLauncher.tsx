// src/components/features/mister/MisterLauncher.tsx
// The anti-bubble. 96×36px rectangular manifold tab. Fixed position, bottom-right.
// State indicator: 4px square in gold after archetype resolved.
// CSS-only hover transitions (not Framer). Framer only for mount entrance.
// Source: designer.md §4 (MisterLauncher), animator.md §5
'use client'

import { motion } from 'framer-motion'
import { launcherVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useMister } from '@/components/features/mister/MisterProvider'

export function MisterLauncher() {
  const reduced = useReducedMotion()
  const { toggle, isResolved } = useMister()

  return (
    <motion.button
      type="button"
      variants={launcherVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      onClick={toggle}
      aria-label="Abrir Mister — inteligencia comercial Wings"
      className="mister-launcher fixed bottom-6 right-6 z-50 flex w-[var(--mister-launcher-width)] h-[var(--mister-launcher-height)] items-center justify-center rounded-[2px] border border-[var(--mister-launcher-border)] bg-[var(--mister-launcher-bg)] transition-colors duration-[150ms] hover:border-[var(--mister-launcher-border-hover)] hover:border-t-[var(--mister-gold-rule-strong)]"
    >
      <span className="relative">
        <span className="font-mono text-[13px] font-[500] uppercase leading-none tracking-[0.12em] text-[var(--mister-text-primary)]">
          MISTER
        </span>
        {/* 4px × 4px state indicator square — top-right of text, only visible after archetype resolved */}
        <span
          className={`mister-status-dot absolute -right-3 -top-1.5 block h-1 w-1 rounded-none ${
            isResolved
              ? 'bg-[var(--mister-gold)] opacity-100'
              : 'bg-[var(--mister-status-unresolved)] opacity-0'
          }`}
          aria-hidden
        />
      </span>
    </motion.button>
  )
}
