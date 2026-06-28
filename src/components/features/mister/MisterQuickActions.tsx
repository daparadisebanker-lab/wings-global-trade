// src/components/features/mister/MisterQuickActions.tsx
// Document-action tags, not chips. No icons, labels only.
// Positioned after assistant message content, aligned with message content zone.
// Source: designer.md §4 (MisterQuickActions), animator.md §9
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { MisterQuickAction, MisterActionId } from '@/types/mister'
import {
  quickActionsContainerVariants,
  quickActionItemVariants,
  quickActionTapTransition,
} from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { HAPTIC } from '@/lib/mister/haptics'

interface Props {
  actions: MisterQuickAction[]
  onAction: (label: string, actionId: MisterActionId) => void
  visible: boolean
}

export function MisterQuickActions({ actions, onAction, visible }: Props) {
  const reduced = useReducedMotion()

  if (actions.length === 0) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={quickActionsContainerVariants}
          initial="hidden"
          animate={reduced ? 'visibleReduced' : 'visible'}
          exit={reduced ? 'exitReduced' : 'exit'}
          className="flex flex-wrap gap-2 pb-3 pr-5"
          style={{ paddingLeft: 'var(--mister-margin-column)' } as React.CSSProperties}
        >
          {actions.map((qa) => (
            <motion.button
              key={qa.action}
              variants={quickActionItemVariants}
              {...(!reduced && {
                whileTap: {
                  scale: 0.97,
                  transition: quickActionTapTransition,
                },
              })}
              type="button"
              onClick={() => { HAPTIC.chip(); onAction(qa.label, qa.action) }}
              className="mister-qa-button h-7 rounded-[2px] border border-[var(--mister-qa-border)] bg-transparent px-[10px] font-body text-[12px] font-[500] tracking-[0.01em] text-[var(--mister-text-primary)] transition-colors duration-[150ms] hover:border-[var(--mister-qa-border-hover)] hover:bg-[var(--mister-qa-bg-hover)] active:bg-[var(--mister-gold-fill-active)]"
            >
              {qa.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
