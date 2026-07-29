'use client'

// MisterProvider — the single owner of a Mister conversation (Phase E slice 1).
//
// The dock used to own thread/busy/pending/draft locally. The cockpit splits the
// conversation across three zones (spine · canvas · rail) that must read ONE
// conversation, and the ⌘J overlay and the /intelligence page must share it too
// (draft in the overlay, keep drafting after you navigate). So the state lifts
// here, wrapping the whole shell. The engine is unchanged: send() still calls the
// single-shot askMister() server action and appends its CopilotResult.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { askMister } from '@/lib/actions/mister-copilot'
import { textResult, type CanvasContext, type CopilotResult, type SeededFrom } from '@/lib/copilot/types'
import { artifactDigest, MAX_HISTORY_TURNS, type Turn } from '@/lib/copilot/history'
import { loadThread, saveThread, threadStorageKey, type MisterMsg } from '@/lib/copilot/thread-store'
import { MISTER_RENDERERS } from '../mister-renderers'
import { deriveParentSeq } from './lineage'

// Register the canvas getter BEFORE paint so the composer chip never renders a frame
// without its context (the editor mounts in the same commit the selection changes).
// Isomorphic so an SSR pass (provider wraps the shell) doesn't warn.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** One turn in the thread — the operator's message, or Mister's result. Its shape
 *  is fixed by what persists across page loads, so it is declared with the store
 *  (lib/copilot/thread-store.ts) and re-exported here where consumers expect it. */
export type { MisterMsg }

/** Watchdog for a single ask. A server action can't be aborted from the client, so
 *  if the model hangs we stop waiting after this and free the dock (the in-flight
 *  call is abandoned; the server-side timeout in lib/ai/client.ts bounds its cost). */
const MISTER_TIMEOUT_MS = 45_000

/** Never render a blank Mister bubble: an empty/whitespace text result becomes an
 *  explicit "try again" message (the silent-empty-answer failure class). */
function coerceResult(result: CopilotResult, locale: Locale): CopilotResult {
  if (result.renderer === 'text' && !(result.text ?? '').trim()) {
    return textResult(
      t({ es: 'No pude generar una respuesta. Reformula la pregunta.', en: 'I could not produce an answer — try rephrasing.' }, locale),
    )
  }
  return result
}

/** Compact the thread into the conversation the server routes against. The dock
 *  owns the thread, so without this the server saw only the current message and a
 *  follow-up ("El precio es 25,000") classified as off-topic. An artifact turn
 *  travels as its digest — the headline facts a follow-up refers to, not the whole
 *  payload. The preview dataURL of a pasted screenshot never travels. */
export function threadToHistory(thread: MisterMsg[]): Turn[] {
  return thread.slice(-MAX_HISTORY_TURNS).map((m) => {
    if (m.who === 'op') return { who: 'op' as const, text: m.text || (m.image ? '[captura adjunta]' : '') }
    const r = m.result
    return {
      who: 'mi' as const,
      text: r.renderer === 'text' ? (r.text ?? '') : artifactDigest(r.renderer, r.note, r.data),
    }
  })
}

/** A screenshot staged for the next turn — base64 for the wire, dataURL for preview. */
export type Pending = { mediaType: string; dataBase64: string; preview: string }

/** A renderable artifact produced this session, with a stable per-session seq. */
export interface ArtifactEntry {
  seq: number
  result: CopilotResult
  /** The seq of the artifact this one chained off (Scenario Ledger Stage 2), when its
   *  payload carries provenance pointing at an earlier artifact this session — else null. */
  parentSeq: number | null
}

interface MisterContextValue {
  locale: Locale
  thread: MisterMsg[]
  busy: boolean
  pending: Pending | null
  draft: string
  setDraft: (value: string) => void
  setPending: (value: Pending | null) => void
  send: () => Promise<void>
  /** Bail out of the in-flight ask and free the dock (a live "Detener" control). */
  stop: () => void
  /** Every renderable artifact produced this session, in order — the canvas switcher. */
  artifacts: ArtifactEntry[]
  /** The seq currently held on the canvas (the newest, unless the operator flipped back). */
  selectedSeq: number | null
  /** Pin an earlier artifact to the canvas. */
  selectArtifact: (seq: number) => void
  /** The artifact the canvas is showing (selected, else newest, else none). */
  selectedArtifact: CopilotResult | null
  /** Canvas working memory — an editor's (or its commit panel's) in-progress state,
   *  kept per string key so a remount (switching artifacts) rehydrates instead of
   *  resetting to seed. Editors key on String(seq); their commit panels on
   *  `${seq}:commit` so a "saved ✓" latch + deep-link survive a flip (no re-submit). */
  artifactDrafts: Record<string, unknown>
  saveArtifactDraft: (key: string, value: unknown) => void
  /** The mounted canvas editor registers a getter for its live inputs here (Part B);
   *  send() reads the selected artifact's getter to pass canvas context into a
   *  chained ask. A ref registry, so per-keystroke updates never re-render. */
  registerCanvasGetter: (seq: number, getter: () => CanvasContext | null) => () => void
  /** An editor reports whether its context is currently non-null (computable). The
   *  chip must reflect what send() will actually attach, not merely that an editor is
   *  mounted — an editor with blanked/invalid inputs registers but yields null. */
  setContextLive: (seq: number, live: boolean) => void
  /** True when the selected artifact has a LIVE (non-null) editor context that the
   *  next ask would inherit — drives the composer's disclosure chip (Scenario Ledger). */
  hasCanvasContext: boolean
  /** The operator ✕'d the chip: skip inheritance for the next send (one-shot). */
  skipCanvasContext: boolean
  setSkipCanvasContext: (skip: boolean) => void
}

const MisterContext = createContext<MisterContextValue | null>(null)

export function MisterProvider({
  locale = DEFAULT_LOCALE,
  identity = null,
  children,
}: {
  locale?: Locale
  /** Who this conversation belongs to (the operator's email) — scopes the stored
   *  thread so a shared workstation never loads someone else's. */
  identity?: string | null
  children: ReactNode
}) {
  const [thread, setThread] = useState<MisterMsg[]>([])
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [draft, setDraft] = useState('')

  // Live canvas-context registry (Part B). Refs so a mounted editor can update its
  // getter every render without re-rendering the shell; send() reads them at call time.
  const canvasGetters = useRef(new Map<number, () => CanvasContext | null>())
  // Seqs whose editor currently yields a non-null context (computable inputs). The
  // chip keys off THIS, not mere registration, so it never promises an inheritance
  // that send() won't carry.
  const liveSeqs = useRef(new Set<number>())
  const selectedSeqRef = useRef<number | null>(null)
  // Bumped when editors register/unregister or their context flips null↔non-null,
  // so `hasCanvasContext` is reactive.
  const [getterVersion, setGetterVersion] = useState(0)
  // One-shot: the operator ✕'d the context chip, so the NEXT send skips inheritance.
  const [skipCanvasContext, setSkipCanvasContext] = useState(false)
  // The current ask's resolver (set while a send is in flight) so `stop()` and the
  // watchdog can settle the turn from outside the send() closure.
  const activeFinish = useRef<((result: CopilotResult) => void) | null>(null)

  // ── Persistence (lib/copilot/thread-store.ts) ────────────────────────────
  // Hydrate AFTER mount, never in the useState initializer: the provider wraps the
  // shell and renders on the server, so reading storage during render would make
  // the first client paint disagree with the SSR HTML. Until the load lands,
  // `hydrated` holds back the save effect — otherwise the initial empty thread
  // would overwrite the stored conversation before it was ever read.
  const storageKey = threadStorageKey(identity)
  const hydrated = useRef(false)
  useEffect(() => {
    hydrated.current = false
    const stored = loadThread(typeof window === 'undefined' ? undefined : window.localStorage, storageKey)
    // Never clobber a conversation already under way (an operator who typed while
    // the effect was pending) — the live thread wins.
    setThread((prev) => (prev.length ? prev : stored))
    hydrated.current = true
  }, [storageKey])

  useEffect(() => {
    if (!hydrated.current) return
    saveThread(typeof window === 'undefined' ? undefined : window.localStorage, storageKey, thread)
  }, [thread, storageKey])

  const send = useCallback(async () => {
    const text = draft.trim()
    const attachment = pending
    if ((!text && !attachment) || busy) return
    // Snapshot the conversation BEFORE this message joins it — the ask carries the
    // turns that precede it, and `text` travels on its own.
    const history = threadToHistory(thread)
    setThread((prev) => [...prev, { who: 'op', text, image: attachment?.preview }])
    setDraft('')
    setPending(null)
    setBusy(true)
    // Carry the canvas the operator was on into a chained ask — unless they ✕'d it.
    const seq = selectedSeqRef.current
    const context = skipCanvasContext ? undefined : (seq != null ? canvasGetters.current.get(seq)?.() : null) ?? undefined
    if (skipCanvasContext) setSkipCanvasContext(false) // one-shot

    // The turn resolves EXACTLY once — whichever of the model result, an error, or
    // the watchdog lands first — and always clears `busy`. This is the safety net
    // for the "frozen Mister" failure: a hung model can no longer strand the dock.
    let settled = false
    const finish = (result: CopilotResult) => {
      if (settled) return
      settled = true
      activeFinish.current = null
      setThread((prev) => [...prev, { who: 'mi', result }])
      setBusy(false)
    }
    activeFinish.current = finish
    const watchdog = setTimeout(
      () => finish(textResult(t({ es: 'Mister tardó demasiado. Intenta de nuevo.', en: 'Mister took too long — try again.' }, locale))),
      MISTER_TIMEOUT_MS,
    )
    try {
      const result = await askMister(
        text,
        attachment ? { mediaType: attachment.mediaType, dataBase64: attachment.dataBase64 } : undefined,
        context,
        history,
      )
      clearTimeout(watchdog)
      finish(coerceResult(result.error ? textResult(result.error.message) : result.data, locale))
    } catch {
      // The server action itself failed to run — the request never reached
      // askMister, so its own graceful catch never fired. In production the
      // overwhelming cause is DEPLOYMENT SKEW: server-action ids change with each
      // build, so a tab loaded from the previous deploy posts an id the new one
      // rejects ("Failed to find Server Action"). The old message said only "no
      // pude procesarlo", which reads as a model failure and invites a retry that
      // cannot work. Name the fix instead — and say the conversation survives it,
      // because it now does (thread-store.ts).
      clearTimeout(watchdog)
      finish(
        textResult(
          t(
            {
              es: 'No pude procesarlo. Si la app se actualizó, recarga la página — tu conversación se conserva.',
              en: 'Could not process that. If the app was updated, reload the page — your conversation is kept.',
            },
            locale,
          ),
        ),
      )
    }
  }, [draft, pending, busy, locale, skipCanvasContext, thread])

  /** Bail out of the current ask (a live "Detener" control). Server-side the call
   *  keeps running (a server action can't be client-aborted), but the dock frees
   *  immediately so the operator is never stuck waiting — key for a live demo. */
  const stop = useCallback(() => {
    activeFinish.current?.(textResult(t({ es: 'Cancelado.', en: 'Cancelled.' }, locale)))
  }, [locale])

  // Every renderable artifact (never the plain 'text' bubble), with a stable
  // per-session seq assigned by arrival order — the canvas switcher's model.
  const artifacts = useMemo<ArtifactEntry[]>(() => {
    const list: ArtifactEntry[] = []
    let seq = 0
    for (const m of thread) {
      if (m.who === 'mi' && m.result.renderer !== 'text' && m.result.renderer in MISTER_RENDERERS) {
        seq += 1
        const parentRaw = (m.result.data as { seededFrom?: SeededFrom } | undefined)?.seededFrom?.seq
        list.push({ seq, result: m.result, parentSeq: deriveParentSeq(parentRaw, seq) })
      }
    }
    return list
  }, [thread])

  const latestSeq = artifacts.length ? artifacts[artifacts.length - 1].seq : null
  const [selectedSeq, setSelectedSeq] = useState<number | null>(null)
  // A freshly-composed artifact takes the canvas — UNLESS the operator is actively
  // editing the current one (focus inside the canvas), in which case stealing it
  // would remount the editor and yank focus mid-keystroke. The new artifact still
  // appears in the switcher for a deliberate flip.
  useEffect(() => {
    if (latestSeq === null) return
    const active = typeof document !== 'undefined' ? document.activeElement : null
    if (active && active.closest?.('.ck-canvas-art')) return
    setSelectedSeq(latestSeq)
  }, [latestSeq])

  const selectedArtifact = useMemo(
    () => artifacts.find((a) => a.seq === selectedSeq)?.result ?? artifacts.at(-1)?.result ?? null,
    [artifacts, selectedSeq],
  )
  const selectArtifact = useCallback((seq: number) => setSelectedSeq(seq), [])

  // Mirror the current selection into a ref for send() (an event handler that runs
  // after commit) — via an effect, not a write-during-render (concurrent-safe).
  useEffect(() => {
    selectedSeqRef.current = selectedSeq
  }, [selectedSeq])
  const registerCanvasGetter = useCallback((seq: number, getter: () => CanvasContext | null) => {
    canvasGetters.current.set(seq, getter)
    setGetterVersion((v) => v + 1)
    return () => {
      if (canvasGetters.current.get(seq) === getter) {
        canvasGetters.current.delete(seq)
        liveSeqs.current.delete(seq)
        setGetterVersion((v) => v + 1)
      }
    }
  }, [])

  // An editor reports its context liveness (non-null); only a real transition bumps
  // the version, so a per-keystroke re-render of a still-live editor is a no-op here.
  const setContextLive = useCallback((seq: number, live: boolean) => {
    const set = liveSeqs.current
    if (live === set.has(seq)) return
    if (live) set.add(seq)
    else set.delete(seq)
    setGetterVersion((v) => v + 1)
  }, [])

  // Reactive: does the artifact on the canvas have a LIVE (non-null) editor context
  // the next ask would actually inherit?
  const hasCanvasContext = useMemo(
    () => selectedSeq != null && liveSeqs.current.has(selectedSeq),
    [selectedSeq, getterVersion],
  )

  // The ✕-skip is a one-shot about the artifact that was on the canvas when it was
  // clicked; a switcher flip changes the target, so clear it — never let a skip
  // decided for #2 silently drop #1's inheritance.
  useEffect(() => {
    setSkipCanvasContext(false)
  }, [selectedSeq])

  // Canvas working memory: each editor writes its latest state here (keyed by the
  // artifact seq) on unmount, so flipping the switcher and back — or a new artifact
  // stealing the canvas mid-edit — rehydrates instead of discarding the operator's
  // tuned numbers (closes the remount data-loss the review flagged).
  const [artifactDrafts, setArtifactDrafts] = useState<Record<string, unknown>>({})
  const saveArtifactDraft = useCallback((key: string, value: unknown) => {
    setArtifactDrafts((prev) => ({ ...prev, [key]: value }))
  }, [])

  const value = useMemo<MisterContextValue>(
    () => ({
      locale,
      thread,
      busy,
      pending,
      draft,
      setDraft,
      setPending,
      send,
      stop,
      artifacts,
      selectedSeq,
      selectArtifact,
      selectedArtifact,
      artifactDrafts,
      saveArtifactDraft,
      registerCanvasGetter,
      setContextLive,
      hasCanvasContext,
      skipCanvasContext,
      setSkipCanvasContext,
    }),
    [
      locale,
      thread,
      busy,
      pending,
      draft,
      send,
      stop,
      artifacts,
      selectedSeq,
      selectArtifact,
      selectedArtifact,
      artifactDrafts,
      saveArtifactDraft,
      registerCanvasGetter,
      setContextLive,
      hasCanvasContext,
      skipCanvasContext,
    ],
  )

  return <MisterContext.Provider value={value}>{children}</MisterContext.Provider>
}

/** Read the shared Mister conversation. Throws if used outside the provider. */
export function useMister(): MisterContextValue {
  const ctx = useContext(MisterContext)
  if (!ctx) throw new Error('useMister must be used within a MisterProvider')
  return ctx
}

/** Register the mounted editor's LIVE canvas context (its normalized inputs) so a
 *  chained ask inherits it (Part B). The getter returns the latest via a ref, so
 *  editing never re-renders the shell; it unregisters on unmount. Liveness (context
 *  non-null) is reported separately so the composer chip reflects what send() will
 *  actually attach — an editor with blanked inputs is registered but not live. */
export function useCanvasContext(seq: number, context: CanvasContext | null): void {
  const { registerCanvasGetter, setContextLive } = useMister()
  const ref = useRef(context)
  ref.current = context
  useIsoLayoutEffect(() => registerCanvasGetter(seq, () => ref.current), [seq, registerCanvasGetter])
  const live = context != null
  useIsoLayoutEffect(() => {
    setContextLive(seq, live)
    return () => setContextLive(seq, false)
  }, [seq, live, setContextLive])
}

/** Read/write one slot of canvas working memory. `key` undefined (e.g. a commit
 *  panel used in a read-only thread artifact, not the canvas) → no-op, so the
 *  consumer behaves as if there were no working memory. */
export function useArtifactDraft<T>(key: string | undefined): { draft: T | undefined; persist: (value: T) => void } {
  const { artifactDrafts, saveArtifactDraft } = useMister()
  const draft = key !== undefined ? (artifactDrafts[key] as T | undefined) : undefined
  const persist = useCallback(
    (value: T) => {
      if (key !== undefined) saveArtifactDraft(key, value)
    },
    [key, saveArtifactDraft],
  )
  return { draft, persist }
}
