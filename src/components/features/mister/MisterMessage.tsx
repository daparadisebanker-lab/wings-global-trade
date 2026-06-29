// src/components/features/mister/MisterMessage.tsx
// REBUILT v2 — Document Entry Format with turn indices + 2px gold left rule.
// Kills all chatbot conventions: no rounded bubbles, no avatar, no ellipsis.
// Source: ENRICHED_SPEC §2.3, designer.md §4, animator.md §7
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { MisterEntry } from '@/components/features/mister/MisterProvider'
import {
  assistantMessageVariants,
  userMessageVariants,
  surfaceCardVariants,
} from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SurfaceRenderer } from '@/components/features/mister/surfaces/SurfaceRenderer'

interface Props {
  entry: MisterEntry
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

export function MisterMessage({ entry }: Props) {
  const reduced = useReducedMotion()
  const isUser = entry.role === 'user'

  if (isUser) {
    return (
      <motion.div
        key={entry.id}
        variants={userMessageVariants}
        initial="hidden"
        animate={reduced ? 'visibleReduced' : 'visible'}
        className="group flex justify-end"
      >
        <div className="relative max-w-[72%] rounded-none bg-[var(--mister-bg-message-user)] px-4 py-2.5">
          <p className="font-body text-[14px] font-[400] leading-[1.50] text-[var(--mister-text-user)] whitespace-pre-wrap">
            {entry.content}
          </p>
          <p className="mt-1 text-right font-mono text-[9px] font-[300] tracking-[0.04em] text-[var(--mister-text-user-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {formatTime(entry.timestamp)}
          </p>
        </div>
      </motion.div>
    )
  }

  // Assistant message — Document Entry Format
  return (
    <motion.div
      key={entry.id}
      variants={assistantMessageVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="mister-message-assistant group relative w-full"
    >
      {/* Left margin column: 32px with turn index + 2px gold rule */}
      <div
        className="absolute left-0 top-0 w-[var(--mister-margin-column)] flex flex-col items-center"
        aria-hidden
      >
        {/* Turn index — margin note scale, not punctuation */}
        <span className="mt-4 font-mono text-[10px] font-[300] leading-none tracking-[0.06em] text-[var(--mister-text-ghost)] opacity-40">
          {String(entry.turnIndex).padStart(2, '0')}
        </span>
        {/* 2px gold left rule — runs full height of message, at x=24px */}
        <div
          className="mister-rule-left absolute left-6 top-0 h-full w-0.5 bg-[var(--mister-rule-assistant)]"
        />
      </div>

      {/* Message content — offset by margin column */}
      <div className="min-w-0 pl-[var(--mister-margin-column)]">
        <div className="pb-3 pr-5 pt-4">
          <p className="font-body text-[15px] font-[400] leading-[1.75] text-[var(--mister-text-primary)] whitespace-pre-wrap">
            {entry.content}
          </p>
          <p className="mt-1 text-right font-mono text-[9px] font-[300] tracking-[0.04em] text-[var(--mister-text-ghost)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {formatTime(entry.timestamp)}
          </p>
        </div>

        {/* Surface cards — appear after message content */}
        <AnimatePresence>
          {entry.surfaces.map((surface, i) => (
            <motion.div
              key={`${entry.id}-surface-${i}`}
              variants={surfaceCardVariants}
              initial="hidden"
              animate={reduced ? 'visibleReduced' : 'visible'}
              className="mb-3 pr-5"
            >
              <SurfaceRenderer surface={surface} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
