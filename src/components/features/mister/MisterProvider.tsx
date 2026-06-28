// src/components/features/mister/MisterProvider.tsx
// Mister v2 React context — session state, streaming, archetype/stage tracking.
// All components within <MisterProvider> consume this via useMister().
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type {
  MisterArchetype,
  MisterStage,
  MisterQuickAction,
  MisterActionId,
  MisterLocale,
  MisterSurface,
} from '@/types/mister'
import { useMisterStream } from '@/hooks/useMisterStream'

// Q0+Q1 opening message — copywriter.md §1 (es-PE primary)
const OPENING_MESSAGE =
  'Soy Mister — manejo la inteligencia comercial de Wings. Para orientarte con precisión: ¿esta mercancía es para tu propia operación, o la vas a mover o revender a terceros?'

function makeId(): string {
  const arr = new Uint8Array(8)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSessionId(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const buf = new Uint8Array(4)
  crypto.getRandomValues(buf)
  const n =
    (((buf[0] ?? 0) << 24) |
      ((buf[1] ?? 0) << 16) |
      ((buf[2] ?? 0) << 8) |
      (buf[3] ?? 0)) >>>
    0
  const suffix = (n % 2176782336).toString(36).toUpperCase().padStart(6, '0')
  return `WGT-${y}${m}-${suffix}`
}

// ─── Public types ─────────────────────────────────────────────────────────────

/** A single entry in the message list (user or assistant). */
export interface MisterEntry {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** 1-based turn index for assistant messages; 0 for user messages. */
  turnIndex: number
  timestamp: string
  surfaces: MisterSurface[]
  quickActions: MisterQuickAction[]
}

export interface MisterContextValue {
  sessionId: string
  archetype: MisterArchetype
  stage: MisterStage
  /** true when archetype has been resolved from 'unresolved' */
  isResolved: boolean
  /** floating-mode open/close state */
  isOpen: boolean
  isStreaming: boolean
  inFlight: boolean
  entries: MisterEntry[]
  /** Current accumulated streaming text (shown in MisterStreamingMessage) */
  streamingContent: string
  locale: MisterLocale
  sendMessage: (text: string, actionId?: MisterActionId) => void
  toggle: () => void
  close: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MisterContext = createContext<MisterContextValue | null>(null)

export function useMister(): MisterContextValue {
  const ctx = useContext(MisterContext)
  if (!ctx) throw new Error('useMister must be used within a MisterProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface MisterProviderProps {
  children: ReactNode
  locale?: MisterLocale
  currentPage?: string
  currentProductId?: string | null
}

export function MisterProvider({
  children,
  locale = 'es-PE',
  currentPage,
  currentProductId,
}: MisterProviderProps) {
  const [sessionId] = useState(() => generateSessionId())
  const [archetype, setArchetype] = useState<MisterArchetype>('unresolved')
  const [stage, setStage] = useState<MisterStage>('induction')
  const [isOpen, setIsOpen] = useState(false)
  const [inFlight, setInFlight] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [entries, setEntries] = useState<MisterEntry[]>(() => [
    {
      id: 'opening',
      role: 'assistant',
      content: OPENING_MESSAGE,
      turnIndex: 1,
      timestamp: new Date().toISOString(),
      surfaces: [],
      quickActions: [
        { label: 'Para mi propia operación', action: 'ask_followup' as MisterActionId },
        { label: 'Para revender / distribuir', action: 'ask_followup' as MisterActionId },
        { label: 'Para un proyecto específico', action: 'ask_followup' as MisterActionId },
      ],
    },
  ])

  // Use refs to accumulate data during streaming without stale closures
  const streamingContentRef = useRef('')
  const pendingSurfacesRef = useRef<MisterSurface[]>([])
  const pendingActionsRef = useRef<MisterQuickAction[]>([])
  const assistantTurnCountRef = useRef(1) // opening message is turn 1

  const { stream, isStreaming } = useMisterStream()

  const sendMessage = useCallback(
    (text: string, actionId?: MisterActionId): void => {
      if (inFlight || isStreaming) return

      const userEntry: MisterEntry = {
        id: makeId(),
        role: 'user',
        content: text,
        turnIndex: 0,
        timestamp: new Date().toISOString(),
        surfaces: [],
        quickActions: [],
      }

      setEntries((prev) => [...prev, userEntry])
      setInFlight(true)
      streamingContentRef.current = ''
      pendingSurfacesRef.current = []
      pendingActionsRef.current = []
      setStreamingContent('')

      void stream(
        {
          sessionId,
          message: text,
          actionId,
          currentPage,
          currentProductId,
          locale,
        },
        {
          onToken: (delta) => {
            streamingContentRef.current += delta
            setStreamingContent(streamingContentRef.current)
          },
          onSurface: (surface) => {
            pendingSurfacesRef.current = [...pendingSurfacesRef.current, surface]
          },
          onActions: (quickActions) => {
            pendingActionsRef.current = quickActions
          },
          onState: (newArchetype, newStage) => {
            setArchetype(newArchetype)
            setStage(newStage)
          },
          onDone: () => {
            assistantTurnCountRef.current += 1
            const entry: MisterEntry = {
              id: makeId(),
              role: 'assistant',
              content: streamingContentRef.current,
              turnIndex: assistantTurnCountRef.current,
              timestamp: new Date().toISOString(),
              surfaces: [...pendingSurfacesRef.current],
              quickActions: [...pendingActionsRef.current],
            }
            setEntries((prev) => [...prev, entry])
            streamingContentRef.current = ''
            pendingSurfacesRef.current = []
            pendingActionsRef.current = []
            setStreamingContent('')
            setInFlight(false)
          },
          onError: (_code, message, fallback) => {
            const content =
              fallback ??
              message ??
              'Se perdió la conexión. Reconectando — no se perdieron datos de sesión.'
            assistantTurnCountRef.current += 1
            const errEntry: MisterEntry = {
              id: makeId(),
              role: 'assistant',
              content,
              turnIndex: assistantTurnCountRef.current,
              timestamp: new Date().toISOString(),
              surfaces: [],
              quickActions: [],
            }
            setEntries((prev) => [...prev, errEntry])
            streamingContentRef.current = ''
            setStreamingContent('')
            setInFlight(false)
          },
        },
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stream is stable; refs are mutable
    [inFlight, isStreaming, stream, sessionId, currentPage, currentProductId, locale],
  )

  const toggle = useCallback(() => setIsOpen((o) => !o), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value: MisterContextValue = {
    sessionId,
    archetype,
    stage,
    isResolved: archetype !== 'unresolved',
    isOpen,
    isStreaming,
    inFlight,
    entries,
    streamingContent,
    locale,
    sendMessage,
    toggle,
    close,
  }

  return (
    <MisterContext.Provider value={value}>{children}</MisterContext.Provider>
  )
}
