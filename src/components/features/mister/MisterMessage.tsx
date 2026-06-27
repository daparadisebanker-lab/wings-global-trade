// src/components/features/mister/MisterMessage.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ConversationTurn } from '@/types/database'

interface MisterMessageProps {
  message: ConversationTurn
  isFirstMessage?: boolean
}

export function MisterMessage({ message, isFirstMessage }: MisterMessageProps) {
  const isUser = message.role === 'user'
  const prefersReducedMotion = useReducedMotion()

  const delay = prefersReducedMotion ? 0 : isFirstMessage ? 0.5 : 0
  const duration = prefersReducedMotion ? 0.1 : 0.2

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, ease: [0, 0, 0.2, 1], delay }}
      className={isUser ? 'flex justify-end' : 'w-full'}
    >
      {isUser ? (
        <p className="max-w-[72%] border-r-2 border-[#C4933F]/40 pr-3 text-right font-mono text-sm font-normal text-[#F8F6F0]/65">
          {message.content}
        </p>
      ) : (
        <p className="font-body text-base font-normal leading-[1.75] text-[#F8F6F0] whitespace-pre-wrap">
          {message.content}
        </p>
      )}
    </motion.div>
  )
}
