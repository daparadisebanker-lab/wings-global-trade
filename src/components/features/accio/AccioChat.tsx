// src/components/features/accio/AccioChat.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccioChat } from '@/hooks/useAccioChat'
import { useCifEstimate } from '@/hooks/useCifEstimate'
import { AccioMessage } from '@/components/features/accio/AccioMessage'
import { AccioInput } from '@/components/features/accio/AccioInput'
import { TprSheet } from '@/components/features/accio/TprSheet'
import { AccioSubmitForm } from '@/components/features/accio/AccioSubmitForm'
import type { TprState } from '@/types/accio'

interface AccioChatProps {
  initialContext?: string
}

/** Count number of non-null top-level TPR fields. */
function countCapturedFields(tpr: TprState): number {
  return Object.values(tpr).filter((v) => {
    if (v === null || v === undefined) return false
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object') return Object.keys(v).length > 0
    return String(v).length > 0
  }).length
}

export function AccioChat({ initialContext }: AccioChatProps) {
  const {
    messages,
    tprState,
    completeness,
    isLoading,
    isStreaming,
    sessionId,
    sendMessage,
    editField,
  } = useAccioChat({ initialContext })
  const { estimate, isLoading: estimateLoading, generate } = useCifEstimate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contextSent = useRef(false)
  const autoEstimated = useRef(false)

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Seed the conversation from ?context= once the greeting exists.
  useEffect(() => {
    if (contextSent.current) return
    if (initialContext && messages.length === 1) {
      contextSent.current = true
      void sendMessage(initialContext)
    }
  }, [initialContext, messages.length, sendMessage])

  // Auto-generate the estimate once minimum completeness is reached.
  useEffect(() => {
    if (autoEstimated.current) return
    if ((completeness === 'minimum' || completeness === 'complete') && !estimate && !isLoading) {
      autoEstimated.current = true
      void generate(tprState)
    }
  }, [completeness, estimate, isLoading, generate, tprState])

  // Mobile drawer toggle label — per game-designer.md §Risk4 + ENRICHED_SPEC §4.3
  const capturedCount = countCapturedFields(tprState)
  const atMinimum = completeness === 'minimum' || completeness === 'complete'
  const drawerLabel = atMinimum
    ? `Ver estimado CIF · ${capturedCount}/10`
    : `Ver resumen · ${capturedCount}/10`

  const sheet = (
    <TprSheet
      tprState={tprState}
      completeness={completeness}
      estimate={estimate}
      estimateLoading={estimateLoading}
      onEditField={editField}
      onGenerateEstimate={() => generate(tprState)}
      onSubmit={() => {
        setDrawerOpen(false)
        setSubmitOpen(true)
      }}
    />
  )

  return (
    <div className="flex h-[100dvh] flex-col pt-14 md:pt-16 lg:flex-row">
      {/* Chat panel */}
      <div className="flex min-h-0 flex-1 flex-col bg-warm-white">
        <div className="border-b border-border-default bg-white px-6 py-4">
          <h1 className="font-display text-xl font-semibold text-navy">Mister</h1>
          <p className="font-body text-sm text-text-muted">
            Asesor de importación Wings · NH · JD · MF · Kubota · KAMA · CIF · Zona franca
          </p>
        </div>

        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          className="no-scrollbar flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <AccioMessage
                  key={`${m.role}-${m.timestamp}-${i}`}
                  message={m}
                  isStreaming={isStreaming && i === messages.length - 1 && m.role === 'assistant'}
                />
              ))}
              {isLoading && !isStreaming && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                  className="flex items-center gap-1.5 px-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-navy/40"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: TPR toggle with live field-count badge — per game-designer.md §Risk4 */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`border-t border-border-default px-6 py-3 text-left font-mono text-sm font-medium transition-colors lg:hidden ${
            atMinimum ? 'bg-gold/[0.08] text-gold' : 'bg-white text-gold'
          }`}
        >
          {drawerLabel} →
        </button>

        <AccioInput
          onSend={sendMessage}
          disabled={isLoading}
          autoFocus
          messageCount={messages.length}
        />
      </div>

      {/* Desktop TPR sheet */}
      <aside className="hidden w-96 border-l border-border-default lg:block">{sheet}</aside>

      {/* Mobile TPR drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-navy/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 h-[85vh] overflow-hidden rounded-t-wings-card"
            >
              {sheet}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AccioSubmitForm
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        tpr={tprState}
        estimate={estimate}
        conversation={messages}
        sessionId={sessionId}
      />
    </div>
  )
}
