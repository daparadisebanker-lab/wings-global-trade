// src/components/features/accio/AccioMessage.tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ConversationTurn } from '@/types/database'
import { cn } from '@/lib/utils'

interface AccioMessageProps {
  message: ConversationTurn
  isStreaming?: boolean
}

export function AccioMessage({ message, isStreaming }: AccioMessageProps) {
  const isUser = message.role === 'user'
  const prefersReducedMotion = useReducedMotion()

  // User messages slide in from the right; AI messages fade up from slight offset.
  // If the user prefers reduced motion, use a simple fade only.
  const initial = prefersReducedMotion
    ? { opacity: 0 }
    : isUser
      ? { opacity: 0, x: 20 }
      : { opacity: 0, y: 8 }

  const animate = prefersReducedMotion
    ? { opacity: 1 }
    : isUser
      ? { opacity: 1, x: 0 }
      : { opacity: 1, y: 0 }

  const transition = prefersReducedMotion
    ? { duration: 0.15 }
    : isUser
      ? { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
      : { duration: 0.35, ease: [0, 0, 0.2, 1] as [number, number, number, number] }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 font-body text-base text-navy',
          isUser
            ? 'rounded-[4px_4px_0_4px] border-l-[3px] border-l-gold bg-surface-chat-user'
            : 'rounded-[4px_4px_4px_0] border border-border-default bg-surface-chat-ai',
        )}
      >
        <span className={cn(isStreaming && !message.content && 'accio-cursor')}>
          {message.content}
          {isStreaming && message.content && <span className="accio-cursor" />}
        </span>
      </div>
      <time className="mt-1 px-1 font-mono text-[11px] text-text-muted">
        {new Date(message.timestamp).toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </time>
    </motion.div>
  )
}
