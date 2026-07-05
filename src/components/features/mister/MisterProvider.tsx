// src/components/features/mister/MisterProvider.tsx
// Mister v2 React context — session state, streaming, archetype/stage tracking.
// All components within <MisterProvider> consume this via useMister().
'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  MisterCollected,
} from '@/types/mister'
import { useMisterStream } from '@/hooks/useMisterStream'
import { HAPTIC } from '@/lib/mister/haptics'
import { WINGS_PUBLIC_WHATSAPP } from '@/lib/constants'

// WhatsApp deep-link prefill labels — mirrors ContactCard.tsx's ARCHETYPE_LABELS
// so the connect_whatsapp fast path produces an identical handoff message.
const ARCHETYPE_LABELS: Record<MisterArchetype, string> = {
  lead_buyer: 'Comprador Final',
  project_manager: 'Project Manager',
  logistics_manager: 'Gerencia de Logística',
  reseller: 'Distribuidor / Reseller',
  wholesale_partner: 'Socio Wholesale B2B',
  unresolved: '',
}

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

// ─── Session persistence ────────────────────────────────────────────────────
// A single localStorage key shared by every MisterProvider on the origin (the
// floating widget and the /mister page), so both surfaces converge on one
// session via the DB. See mister-intelligence-audit.md §7.
const SESSION_STORAGE_KEY = 'wgt-mister-session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
// Must match generateSessionId()'s output and the server-side Zod guard.
const SESSION_ID_PATTERN = /^WGT-\d{6}-[A-Z0-9]{6}$/
// POST /api/mister hard-caps a session at 40 turns; a restored session at or
// past the cap can never continue, so we start fresh instead.
const SESSION_TURN_CAP = 40

interface StoredSession {
  sessionId: string
  savedAt: number
}

/** Read the persisted session id. All access guarded (Safari private mode). */
function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as StoredSession).sessionId === 'string' &&
      typeof (parsed as StoredSession).savedAt === 'number'
    ) {
      return parsed as StoredSession
    }
    return null
  } catch {
    return null
  }
}

/** Persist the session id, stamping savedAt = now. No-op if storage is blocked. */
function writeStoredSession(sessionId: string): void {
  try {
    const payload: StoredSession = { sessionId, savedAt: Date.now() }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage disabled / quota / Safari private mode — persistence degrades
    // silently; the session still works for the current page life.
  }
}

/** Shape returned by GET /api/mister/session (sanitized rehydration fields). */
interface SessionRehydrationResponse {
  archetype?: MisterArchetype
  stage?: MisterStage
  locale?: MisterLocale
  collected?: MisterCollected
  turn_count?: number
  history?: { role: 'user' | 'assistant'; content: string }[]
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
  /** Merged collected data — updates after each assistant turn via SSE */
  collected: MisterCollected
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
  // sessionId + the opening message timestamp are generated client-side only.
  // /mister is statically rendered, so a value produced during SSR is baked into
  // the served HTML once and every client regenerates a different one on hydration
  // (React #418 text-content mismatch). Empty on first render (server + client
  // agree), then filled in a mount effect below.
  const [sessionId, setSessionId] = useState('')
  const [archetype, setArchetype] = useState<MisterArchetype>('unresolved')
  const [stage, setStage] = useState<MisterStage>('induction')
  const [collected, setCollected] = useState<MisterCollected>({})
  const [isOpen, setIsOpen] = useState(false)
  const [inFlight, setInFlight] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [entries, setEntries] = useState<MisterEntry[]>(() => [
    {
      id: 'opening',
      role: 'assistant',
      content: OPENING_MESSAGE,
      turnIndex: 1,
      timestamp: '',
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

  // Haptic coordination refs — no re-renders needed, pure side-effects
  const thinkingPulseRef = useRef<number | null>(null)
  const firstTokenRef = useRef(false)
  const prevArchetypeRef = useRef<MisterArchetype>('unresolved')
  const prevStageRef = useRef<MisterStage>('induction')
  const prevCollectedRef = useRef<MisterCollected>({})

  // Set when the in-flight turn was triggered by the open_quotation action id;
  // guarantees a quotation_form surface renders even if the model doesn't
  // surface one. Cleared in onDone/onError. See audit finding #4.
  const openQuotationPendingRef = useRef(false)

  // Client-only initialization of per-visit values — see sessionId note above.
  // Runs once after mount, before the user can interact. Either rehydrates a
  // stored session from the DB or starts fresh; sendMessage is gated by inFlight
  // until this resolves, so it always has a real sessionId to send.
  useEffect(() => {
    let cancelled = false

    // Stamp the opening message timestamp (fresh-session path only).
    const stampOpening = () => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === 'opening' && !e.timestamp
            ? { ...e, timestamp: new Date().toISOString() }
            : e,
        ),
      )
    }

    // Fresh session: new id, default opening (turn 1), persist. Used both on
    // first visit and whenever a stored session is stale/expired/capped/failed.
    const startFresh = () => {
      const id = generateSessionId()
      setSessionId(id)
      stampOpening()
      writeStoredSession(id)
      // entries keeps the default opening (turn 1); assistantTurnCountRef stays 1.
    }

    // Apply archetype/stage/collected from the server, keeping the prev* refs
    // used for haptic diffing in sync so a restore never mis-fires a haptic.
    const restoreState = (data: SessionRehydrationResponse) => {
      if (data.archetype) {
        setArchetype(data.archetype)
        prevArchetypeRef.current = data.archetype
      }
      if (data.stage) {
        setStage(data.stage)
        prevStageRef.current = data.stage
      }
      if (data.collected) {
        setCollected(data.collected)
        prevCollectedRef.current = { ...data.collected }
      }
    }

    const stored = readStoredSession()
    const storedIsUsable =
      stored !== null &&
      SESSION_ID_PATTERN.test(stored.sessionId) &&
      Date.now() - stored.savedAt < SESSION_TTL_MS

    if (!storedIsUsable) {
      startFresh()
      return
    }

    // Rehydrate. Block sends (inFlight) until the fetch resolves. A hung
    // request must not leave the composer disabled — abort after 5s and fall
    // back to a fresh session via the catch below.
    const storedId = stored.sessionId
    setInFlight(true)
    const abort = new AbortController()
    const abortTimer = window.setTimeout(() => abort.abort(), 5000)

    void (async () => {
      try {
        const res = await fetch(
          `/api/mister/session?id=${encodeURIComponent(storedId)}`,
          { method: 'GET', headers: { accept: 'application/json' }, signal: abort.signal },
        )
        window.clearTimeout(abortTimer)
        if (cancelled) return

        // 404 (stale id) or any non-OK → silent fresh session.
        if (!res.ok) {
          startFresh()
          setInFlight(false)
          return
        }

        const data = (await res.json()) as SessionRehydrationResponse
        if (cancelled) return

        const turnCount = typeof data.turn_count === 'number' ? data.turn_count : 0
        const history = Array.isArray(data.history) ? data.history : []

        // 40-turn hard cap: the POST endpoint refuses further turns — discard.
        if (turnCount >= SESSION_TURN_CAP) {
          startFresh()
          setInFlight(false)
          return
        }

        if (history.length === 0) {
          // Row exists but no turns persisted yet — reuse the id and keep the
          // default opening so numbering stays coherent for the first real turn.
          setSessionId(storedId)
          stampOpening()
          restoreState(data)
          writeStoredSession(storedId) // refresh savedAt after successful rehydrate
          setInFlight(false)
          return
        }

        // Rebuild the message list from stored history. User messages carry
        // turnIndex 0; assistant messages get a sequential 1-based index. The
        // hardcoded opening message is dropped for restored sessions (it counts
        // as turn 1 only in fresh ones) so the numbering stays coherent.
        let assistantCount = 0
        const rebuilt: MisterEntry[] = history.map((h) => {
          if (h.role === 'assistant') {
            assistantCount += 1
            return {
              id: makeId(),
              role: 'assistant',
              content: h.content,
              turnIndex: assistantCount,
              timestamp: '',
              surfaces: [],
              quickActions: [],
            }
          }
          return {
            id: makeId(),
            role: 'user',
            content: h.content,
            turnIndex: 0,
            timestamp: '',
            surfaces: [],
            quickActions: [],
          }
        })

        setEntries(rebuilt)
        assistantTurnCountRef.current = assistantCount
        restoreState(data)
        setSessionId(storedId)
        writeStoredSession(storedId) // refresh savedAt after successful rehydrate
        setInFlight(false)
      } catch {
        window.clearTimeout(abortTimer)
        if (cancelled) return
        // Network failure / timeout abort → silent fresh session.
        startFresh()
        setInFlight(false)
      }
    })()

    return () => {
      cancelled = true
      window.clearTimeout(abortTimer)
      abort.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; setters and refs are stable
  }, [])

  const { stream, isStreaming } = useMisterStream()

  const sendMessage = useCallback(
    (text: string, actionId?: MisterActionId): void => {
      if (inFlight || isStreaming) return

      // Fast path: open the WhatsApp handoff immediately on tap, matching
      // ContactCard's deep link exactly, rather than waiting on the model to
      // surface a contact card. The message still goes through the normal
      // stream below so the model logs the handoff and the DB records it.
      if (actionId === 'connect_whatsapp' && typeof window !== 'undefined') {
        const archetypeLabel = ARCHETYPE_LABELS[archetype] ?? ''
        const productIds = collected.productInterest ?? []
        const intent = productIds.length > 0 ? productIds.join(', ') : ''
        const waParts = [
          'Hola, vengo de Mister (Asesor Wings).',
          archetypeLabel ? `Perfil: ${archetypeLabel}.` : '',
          `Consulta #${sessionId}.`,
          intent ? `Interés: ${intent}.` : '',
        ].filter(Boolean)
        const waUrl = `https://wa.me/${WINGS_PUBLIC_WHATSAPP}?text=${encodeURIComponent(waParts.join(' '))}`
        window.open(waUrl, '_blank', 'noopener,noreferrer')
        HAPTIC.whatsapp()
      }

      // Fast path: guarantee a quotation_form surface renders for this turn
      // even if the model's control block omits one — cleared in onDone/onError.
      openQuotationPendingRef.current = actionId === 'open_quotation'

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

      // Thinking haptic — start pulse, stop on first token
      HAPTIC.thinkingStart()
      firstTokenRef.current = false
      if (thinkingPulseRef.current) clearInterval(thinkingPulseRef.current)
      thinkingPulseRef.current = window.setInterval(() => HAPTIC.thinkingPulse(), 1200)

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
            // Stop thinking pulse on first token arrival
            if (!firstTokenRef.current) {
              firstTokenRef.current = true
              if (thinkingPulseRef.current) {
                clearInterval(thinkingPulseRef.current)
                thinkingPulseRef.current = null
              }
              HAPTIC.thinkingEnd()
            }
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
            // Stage advance haptic
            if (prevStageRef.current !== newStage) {
              HAPTIC.stageAdvance()
            }
            // Profile lock-in haptic — fires once when archetype resolves
            if (prevArchetypeRef.current === 'unresolved' && newArchetype !== 'unresolved') {
              HAPTIC.confirm()
            }
            prevStageRef.current = newStage
            prevArchetypeRef.current = newArchetype
            setArchetype(newArchetype)
            setStage(newStage)
          },
          onCollected: (newCollected) => {
            const isFilled = (v: unknown): boolean => {
              if (v === undefined || v === null || v === '') return false
              return Array.isArray(v) ? v.length > 0 : true
            }
            const prev = prevCollectedRef.current
            const hasNewField = (Object.keys(newCollected) as (keyof MisterCollected)[]).some(
              (k) => !isFilled(prev[k]) && isFilled(newCollected[k]),
            )
            if (hasNewField) HAPTIC.fieldCapture()
            prevCollectedRef.current = { ...newCollected }
            setCollected(newCollected)
          },
          onDone: () => {
            // Clear pulse in case no tokens arrived (e.g. empty stream)
            if (thinkingPulseRef.current) {
              clearInterval(thinkingPulseRef.current)
              thinkingPulseRef.current = null
            }
            assistantTurnCountRef.current += 1
            const surfacesForEntry = [...pendingSurfacesRef.current]
            if (
              openQuotationPendingRef.current &&
              !surfacesForEntry.some((s) => s.type === 'quotation_form')
            ) {
              surfacesForEntry.push({ type: 'quotation_form', payload: { summaryFields: {} } })
            }
            openQuotationPendingRef.current = false
            const entry: MisterEntry = {
              id: makeId(),
              role: 'assistant',
              content: streamingContentRef.current,
              turnIndex: assistantTurnCountRef.current,
              timestamp: new Date().toISOString(),
              surfaces: surfacesForEntry,
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
            openQuotationPendingRef.current = false
            // Clear pulse on error
            if (thinkingPulseRef.current) {
              clearInterval(thinkingPulseRef.current)
              thinkingPulseRef.current = null
            }
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
    [inFlight, isStreaming, stream, sessionId, currentPage, currentProductId, locale, archetype, collected],
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
    collected,
    locale,
    sendMessage,
    toggle,
    close,
  }

  return (
    <MisterContext.Provider value={value}>{children}</MisterContext.Provider>
  )
}
