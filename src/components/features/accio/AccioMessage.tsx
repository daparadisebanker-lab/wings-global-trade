// src/components/features/accio/AccioMessage.tsx
'use client'

import { motion } from 'framer-motion'
import type { ConversationTurn } from '@/types/database'
import { cn } from '@/lib/utils'

interface AccioMessageProps {
  message: ConversationTurn
  isStreaming?: boolean
}

export function AccioMessage({ message, isStreaming }: AccioMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
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
