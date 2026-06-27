// src/components/features/mister/MisterMessageList.tsx
// Renders the full conversation: entries + streaming + quick actions.
// Scrolls to bottom on new entries. No layout prop on motion items.
// Source: animator.md §7 (message appear), §9 (quick actions)
'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { MisterMessage } from '@/components/features/mister/MisterMessage'
import { MisterStreamingMessage } from '@/components/features/mister/MisterStreamingMessage'
import { MisterQuickActions } from '@/components/features/mister/MisterQuickActions'

export function MisterMessageList() {
  const { entries, isStreaming, inFlight, streamingContent, sendMessage } = useMister()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Next assistant turn index during streaming
  const nextTurnIndex = (entries.filter((e) => e.role === 'assistant').length) + 1

  // Scroll to bottom whenever entries or streaming content changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries, streamingContent])

  const lastEntryId = entries.at(-1)?.id

  return (
    <div
      className="flex flex-1 flex-col gap-[var(--mister-space-message-group)] overflow-y-auto px-0 py-[var(--mister-space-lg)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[rgba(248,246,240,0.08)]"
      role="log"
      aria-label="Conversación con Mister"
      aria-live="polite"
    >
      {/* Rendered entries */}
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <div key={entry.id} className="flex flex-col">
            <MisterMessage entry={entry} />

            {/* Quick actions — only on the last assistant entry, hidden when streaming */}
            {entry.role === 'assistant' &&
              entry.id === lastEntryId &&
              entry.quickActions.length > 0 && (
                <MisterQuickActions
                  actions={entry.quickActions}
                  visible={!isStreaming && !inFlight}
                  onAction={(label, actionId) => {
                    sendMessage(label, actionId)
                  }}
                />
              )}
          </div>
        ))}
      </AnimatePresence>

      {/* Streaming message — shows while response is being generated */}
      <AnimatePresence>
        {(isStreaming || (inFlight && streamingContent.length > 0)) && (
          <MisterStreamingMessage
            content={streamingContent}
            turnIndex={nextTurnIndex}
          />
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} aria-hidden />
    </div>
  )
}
