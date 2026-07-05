// src/components/features/mister/MisterMessageList.tsx
// Renders the full conversation: entries + streaming + quick actions.
// Scrolls to bottom on new entries, but only when the user is already near
// the bottom (or the new entry is their own message) — otherwise a long
// streamed answer would yank someone back down mid-read.
// Source: animator.md §7 (message appear), §9 (quick actions)
'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMister } from '@/components/features/mister/MisterProvider'
import { MisterMessage } from '@/components/features/mister/MisterMessage'
import { MisterStreamingMessage } from '@/components/features/mister/MisterStreamingMessage'
import { MisterQuickActions } from '@/components/features/mister/MisterQuickActions'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// How close to the bottom (px) counts as "already there" for auto-scroll purposes.
const NEAR_BOTTOM_THRESHOLD = 120

export function MisterMessageList() {
  const { entries, isStreaming, inFlight, streamingContent, sendMessage } = useMister()
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const reduced = useReducedMotion()

  // Next assistant turn index during streaming
  const nextTurnIndex = (entries.filter((e) => e.role === 'assistant').length) + 1

  // Track proximity to bottom so streaming updates don't hijack scroll position
  // when the user has scrolled up to re-read earlier turns.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      nearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // New entries: force-scroll only when the newest entry is the user's own
  // message (their send always snaps down); otherwise respect proximity.
  useEffect(() => {
    const lastEntry = entries.at(-1)
    const shouldAutoScroll = nearBottomRef.current || lastEntry?.role === 'user'
    if (!shouldAutoScroll) return
    bottomRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
    nearBottomRef.current = true
  }, [entries, reduced])

  // Streaming tokens: follow the stream ONLY while the user is near the bottom.
  // The user entry stays last in `entries` for the whole turn, so it must not
  // count here — otherwise scrolling up mid-stream gets yanked back down.
  useEffect(() => {
    if (!nearBottomRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
  }, [streamingContent, reduced])

  const lastEntryId = entries.at(-1)?.id

  return (
    <div
      ref={containerRef}
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
