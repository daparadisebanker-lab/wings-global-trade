// src/components/features/mister/MisterWindow.tsx
// The document shell. Two modes: floating (420×680, right-anchored above launcher)
// and embedded (full-width of parent, natural height).
// Zero border-radius everywhere. No backdrop blur. No decorative chrome.
// Source: designer.md §4 (MisterWindow), animator.md §6
'use client'

import { motion } from 'framer-motion'
import {
  windowFloatingVariants,
  windowEmbeddedVariants,
} from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MisterHeader } from '@/components/features/mister/MisterHeader'
import { MisterMessageList } from '@/components/features/mister/MisterMessageList'
import { MisterComposer } from '@/components/features/mister/MisterComposer'

interface Props {
  mode: 'floating' | 'embedded'
  isOpen?: boolean // floating mode only
}

export function MisterWindow({ mode, isOpen = true }: Props) {
  const reduced = useReducedMotion()

  if (mode === 'floating') {
    return (
      <motion.div
        variants={windowFloatingVariants}
        initial="closed"
        animate={isOpen ? (reduced ? 'openReduced' : 'open') : (reduced ? 'closedReduced' : 'closed')}
        exit={reduced ? 'exitReduced' : 'exit'}
        className="fixed bottom-[calc(var(--mister-launcher-height)+32px)] right-6 z-50 flex w-[var(--mister-window-width)] h-[var(--mister-window-height)] flex-col overflow-hidden rounded-none border border-[var(--mister-border-window)] bg-[var(--mister-bg-window)] mister-shadow-window"
        role="complementary"
        aria-label="Mister — inteligencia comercial Wings"
        aria-hidden={!isOpen}
      >
        <MisterHeader mode="floating" />
        <MisterMessageList />
        <MisterComposer />
      </motion.div>
    )
  }

  // Embedded mode — height expands to content
  return (
    <motion.div
      variants={windowEmbeddedVariants}
      initial="collapsed"
      animate={reduced ? 'expandedReduced' : 'expanded'}
      className="flex w-full min-h-[var(--mister-window-height)] flex-col overflow-hidden rounded-none border border-[var(--mister-border-window)] bg-[var(--mister-bg-window)]"
      role="main"
      aria-label="Mister — inteligencia comercial Wings"
    >
      <MisterHeader mode="embedded" />
      <MisterMessageList />
      <MisterComposer />
    </motion.div>
  )
}
