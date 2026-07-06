// src/components/features/mister/MisterStreamingMessage.tsx
// Shows streaming (in-progress) assistant content with blinking cursor.
// Document Entry Format: 32px left margin with ghost turn index + 2px gold rule.
// Replaces the old ellipsis "typing..." indicator — stream or silence.
// Source: animator.md §8, designer.md §4 (MisterMessage — Assistant)
'use client'

import { motion } from 'framer-motion'
import { streamingContainerVariants } from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { linkifyContent } from '@/components/features/mister/MisterMessage'

interface Props {
  content: string
  /** Which assistant turn number is being generated (for left-margin index). */
  turnIndex: number
}

export function MisterStreamingMessage({ content, turnIndex }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={streamingContainerVariants}
      initial="hidden"
      animate={reduced ? 'streamingReduced' : 'streaming'}
      className="group relative w-full"
    >
      {/* Left margin column: turn index + 2px gold rule */}
      <div
        className="absolute left-0 top-0 w-[var(--mister-margin-column)] flex flex-col items-center"
        aria-hidden
      >
        <span className="mt-4 font-mono text-[11px] font-[300] leading-none tracking-[0.06em] text-[var(--mister-text-ghost)]">
          {String(turnIndex).padStart(2, '0')}
        </span>
        <div className="absolute left-6 top-0 h-full w-0.5 bg-[var(--mister-rule-assistant)]" />
      </div>

      {/* Message content */}
      <div className="min-w-0 pl-[var(--mister-margin-column)]">
        <div className="pb-3 pr-5 pt-4">
          <p className="font-body text-[14px] font-[400] leading-[1.65] text-[var(--mister-text-primary)] whitespace-pre-wrap">
            {linkifyContent(content)}
            {/* CSS-only blinking cursor — defined in globals.css */}
            <span className="mister-stream-cursor" aria-hidden />
          </p>
        </div>
      </div>
    </motion.div>
  )
}
