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
import { textResult, type CanvasContext, type CopilotResult, type LineageBaseline, type SeededFrom } from '@/lib/copilot/types'
import { MISTER_RENDERERS } from '../mister-renderers'
import { deriveParentSeq } from './lineage'

// Register the canvas getter BEFORE paint so the composer chip never renders a frame
// without its context (the editor mounts in the same commit the selection changes).
// Isomorphic so an SSR pass (provider wraps the shell) doesn't warn.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** One turn in the thread — the operator's message, or Mister's result. */
export type MisterMsg = { who: 'op'; text: string; image?: string } | { who: 'mi'; result: CopilotResult }

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
  /** The artifact pinned as the session baseline (Scenario Ledger Stage 3), or null. */
  pinnedSeq: number | null
  /** Its headline captured AT PIN TIME from the live canvas, so a base tuned before
   *  pinning compares truthfully; null when the pinned artifact had no live editor. */
  pinnedBaseline: LineageBaseline | null
  /** Toggle the pin on an artifact — must be the mounted one to snapshot its baseline. */
  pinBaseline: (seq: number) => void
}

const MisterContext = createContext<MisterContextValue | null>(null)

export function MisterProvider({ locale = DEFAULT_LOCALE, children }: { locale?: Locale; children: ReactNode }) {
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
  // The session baseline (Stage 3): which artifact is pinned, and its headline
  // snapshot captured at pin time from the live canvas getter (so a base tuned
  // before pinning still compares against what the operator actually pinned).
  const [pinnedSeq, setPinnedSeq] = useState<number | null>(null)
  const [pinnedBaseline, setPinnedBaseline] = useState<LineageBaseline | null>(null)

  const send = useCallback(async () => {
    const text = draft.trim()
    const attachment = pending
    if ((!text && !attachment) || busy) return
    setThread((prev) => [...prev, { who: 'op', text, image: attachment?.preview }])
    setDraft('')
    setPending(null)
    setBusy(true)
    // Carry the canvas the operator was on into a chained ask — unless they ✕'d it.
    const seq = selectedSeqRef.current
    const context = skipCanvasContext ? undefined : (seq != null ? canvasGetters.current.get(seq)?.() : null) ?? undefined
    if (skipCanvasContext) setSkipCanvasContext(false) // one-shot
    try {
      const result = await askMister(
        text,
        attachment ? { mediaType: attachment.mediaType, dataBase64: attachment.dataBase64 } : undefined,
        context,
      )
      setThread((prev) => [...prev, { who: 'mi', result: result.error ? textResult(result.error.message) : result.data }])
    } catch {
      setThread((prev) => [
        ...prev,
        { who: 'mi', result: textResult(t({ es: 'No pude procesarlo ahora.', en: 'Could not process that.' }, locale)) },
      ])
    } finally {
      setBusy(false)
    }
  }, [draft, pending, busy, locale, skipCanvasContext])

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

  // Toggle the session baseline. Snapshot the pinned artifact's LIVE headline from its
  // canvas getter (it must be the mounted artifact to pin), so the "vs base" deltas
  // reflect what the operator pinned even if they tuned it first.
  const pinBaseline = useCallback(
    (seq: number) => {
      if (pinnedSeq === seq) {
        setPinnedSeq(null)
        setPinnedBaseline(null)
        return
      }
      setPinnedSeq(seq)
      setPinnedBaseline(canvasGetters.current.get(seq)?.()?.baseline ?? null)
    },
    [pinnedSeq],
  )

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
      pinnedSeq,
      pinnedBaseline,
      pinBaseline,
    }),
    [
      locale,
      thread,
      busy,
      pending,
      draft,
      send,
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
      pinnedSeq,
      pinnedBaseline,
      pinBaseline,
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
