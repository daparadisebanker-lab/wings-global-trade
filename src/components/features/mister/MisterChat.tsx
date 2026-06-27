// src/components/features/mister/MisterChat.tsx
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useMisterChat } from '@/hooks/useMisterChat'
import { useCifEstimate } from '@/hooks/useCifEstimate'
import { MisterMessage } from '@/components/features/mister/MisterMessage'
import { MisterInput } from '@/components/features/mister/MisterInput'
import { TprSheet } from '@/components/features/mister/TprSheet'
import { MisterSubmitForm } from '@/components/features/mister/MisterSubmitForm'
import { MisterWaveform } from '@/components/features/mister/MisterWaveform'
import { MisterCanvas } from '@/components/features/mister/MisterCanvas'
import type { TprState } from '@/types/mister'
import type { ConversationTurn } from '@/types/database'

interface MisterChatProps {
  initialContext?: string
}

function detectCategory(context: string | null): string | undefined {
  if (!context) return undefined
  const lower = context.toLowerCase()
  if (lower.includes('maquinar') || lower.includes('agríc') || lower.includes('cosech')) return 'maquinaria-agricola'
  if (lower.includes('camion') || lower.includes('camión')) return 'camiones'
  if (lower.includes('bus') || lower.includes('autobús')) return 'buses'
  if (lower.includes('industrial') || lower.includes('equipo')) return 'equipo-industrial'
  if (lower.includes('repuest') || lower.includes('partes') || lower.includes('pieza')) return 'repuestos'
  return undefined
}

function countCapturedFields(tpr: TprState): number {
  return Object.values(tpr).filter((v) => {
    if (v === null || v === undefined) return false
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object') return Object.keys(v).length > 0
    return String(v).length > 0
  }).length
}

export function MisterChat({ initialContext }: MisterChatProps) {
  // Derive category from initialContext (already the ?context= value) — avoids useSearchParams Suspense boundary
  const category = detectCategory(initialContext ?? null)

  const {
    messages,
    tprState,
    completeness,
    isLoading,
    isStreaming,
    sessionId,
    sendMessage,
    editField,
  } = useMisterChat({ initialContext })
  const { estimate, isLoading: estimateLoading, generate } = useCifEstimate()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const autoEstimated = useRef(false)
  const exitTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Exit ceremony state
  const [ceremonyMessages, setCeremonyMessages] = useState<ConversationTurn[]>([])
  const [sheetStatus, setSheetStatus] = useState<'active' | 'sent'>('active')
  const [sentTimestamp, setSentTimestamp] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const allMessages = useMemo(() => [...messages, ...ceremonyMessages], [messages, ceremonyMessages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [allMessages])

  useEffect(() => {
    if (initialContext && messages.length === 1) {
      void sendMessage(initialContext)
    }
  }, [initialContext, messages.length, sendMessage])

  useEffect(() => {
    if (autoEstimated.current) return
    if ((completeness === 'minimum' || completeness === 'complete') && !estimate && !isLoading) {
      autoEstimated.current = true
      void generate(tprState)
    }
  }, [completeness, estimate, isLoading, generate, tprState])

  useEffect(() => {
    return () => { exitTimersRef.current.forEach(clearTimeout) }
  }, [])

  useEffect(() => {
    if (sheetStatus === 'sent') setDrawerOpen(false)
  }, [sheetStatus])

  const triggerExitCeremony = useCallback(() => {
    const ts = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    // Beat 1: perforated edge glow (immediate)
    setSubmitted(true)
    // Beats 2–4: staggered ceremony — timers stored for unmount cleanup
    exitTimersRef.current = [
      setTimeout(() => {
        setCeremonyMessages([
          {
            role: 'assistant',
            content: `Su consulta ha sido registrada bajo la referencia ${sessionId}.\nEl equipo de Wings se comunicará dentro de las próximas 24 horas con un análisis preliminar. Puede cerrar esta sesión.`,
            timestamp: new Date().toISOString(),
          },
        ])
      }, 400),
      setTimeout(() => setSheetStatus('sent'), 900),
      setTimeout(() => setSentTimestamp(ts), 1200),
    ]
  }, [sessionId])

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
      sessionId={sessionId}
      sheetStatus={sheetStatus}
      sentTimestamp={sentTimestamp}
      submitted={submitted}
    />
  )

  return (
    <div className="mister relative flex h-[100dvh] overflow-hidden bg-navy-900 pt-14 md:pt-16">
      {/* Ambient particle field — absolute behind all content */}
      <MisterCanvas isLoading={isLoading} messageCount={allMessages.length} category={category} />

      {/* Chat column wrapper — z-[1] ensures content paints above the canvas */}
      <div className="relative z-[1] flex min-w-0 flex-1">
        <motion.div
          className="flex min-w-0 flex-1 flex-col border-r border-[#C4933F]/20 bg-navy"
          style={{ boxShadow: '0 0 60px rgba(196,147,63,0.04) inset' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.1 }}
        >
          {/* Consultation header */}
          <div className="relative flex-shrink-0 border-b border-[#C4933F]/20 px-6 pb-4 pt-5" aria-label="Sala de consulta">
            {/* Eyebrow */}
            <motion.p
              className="font-mono text-[10px] text-gold"
              initial={{ opacity: 0, letterSpacing: '0.05em' }}
              animate={{ opacity: 1, letterSpacing: '0.2em' }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            >
              ASESOR DE IMPORTACIÓN · WINGS GLOBAL TRADE
            </motion.p>

            {/* Mark + MISTER row */}
            <div className="mt-2 flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.35 }}
                aria-hidden
              >
                <Image
                  src="/images/mister-mark.svg"
                  alt=""
                  width={28}
                  height={28}
                  priority
                />
              </motion.div>
              <motion.h1
                className="font-display text-[48px] leading-none text-[#F8F6F0]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.2 }}
              >
                MISTER
              </motion.h1>
            </div>

            {/* Gold rule */}
            <motion.div
              className="mt-3 h-px w-full origin-left bg-[#C4933F]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: 'easeInOut', delay: 0.28 }}
              aria-hidden
            />

            {/* Session ref */}
            <motion.p
              className="mt-2 font-mono text-xs text-[#F8F6F0]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.35 }}
            >
              CONSULTA #{sessionId}
            </motion.p>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-6 py-6"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              <AnimatePresence initial={false}>
                {allMessages.map((m, i) => (
                  <MisterMessage
                    key={`${m.role}-${m.timestamp}-${i}`}
                    message={m}
                    isFirstMessage={m.isEntryMessage ?? false}
                  />
                ))}
                {isLoading && (
                  <motion.div
                    key="loading-waveform"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <MisterWaveform isStreaming={isStreaming} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile TPR toggle */}
          {sheetStatus === 'active' && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={`flex-shrink-0 border-t border-[#C4933F]/15 px-6 py-3 text-left font-mono text-sm font-medium transition-colors lg:hidden ${
                atMinimum ? 'bg-gold/[0.06] text-gold' : 'text-gold/60'
              }`}
            >
              {drawerLabel} →
            </button>
          )}

          <MisterInput
            onSend={sendMessage}
            disabled={isLoading || sheetStatus === 'sent'}
            autoFocus={typeof window !== 'undefined' && window.innerWidth >= 1024}
            messageCount={allMessages.length}
          />
        </motion.div>
      </div>

      {/* Desktop TprSheet */}
      <motion.aside
        className="relative z-[1] hidden w-[380px] flex-shrink-0 border-l border-[#C4933F]/15 lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
      >
        {sheet}
      </motion.aside>

      {/* Mobile TPR drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-navy-900/60 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 h-[85dvh] overflow-hidden rounded-t-sm"
            >
              {sheet}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MisterSubmitForm
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSuccess={() => {
          triggerExitCeremony()
        }}
        tpr={tprState}
        estimate={estimate}
        conversation={messages}
        sessionId={sessionId}
      />
    </div>
  )
}
