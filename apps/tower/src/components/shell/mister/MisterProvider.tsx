'use client'

// MisterProvider — the single owner of a Mister conversation (Phase E slice 1).
//
// The dock used to own thread/busy/pending/draft locally. The cockpit splits the
// conversation across three zones (spine · canvas · rail) that must read ONE
// conversation, and the ⌘J overlay and the /intelligence page must share it too
// (draft in the overlay, keep drafting after you navigate). So the state lifts
// here, wrapping the whole shell. The engine is unchanged: send() still calls the
// single-shot askMister() server action and appends its CopilotResult.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { askMister } from '@/lib/actions/mister-copilot'
import { textResult, type CopilotResult } from '@/lib/copilot/types'
import { MISTER_RENDERERS } from '../mister-renderers'

/** One turn in the thread — the operator's message, or Mister's result. */
export type MisterMsg = { who: 'op'; text: string; image?: string } | { who: 'mi'; result: CopilotResult }

/** A screenshot staged for the next turn — base64 for the wire, dataURL for preview. */
export type Pending = { mediaType: string; dataBase64: string; preview: string }

/** A renderable artifact produced this session, with a stable per-session seq. */
export interface ArtifactEntry {
  seq: number
  result: CopilotResult
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
  /** Canvas working memory — an editor's in-progress state, kept per artifact seq
   *  so a remount (switching artifacts) rehydrates instead of resetting to seed. */
  artifactDrafts: Record<number, unknown>
  saveArtifactDraft: (seq: number, value: unknown) => void
}

const MisterContext = createContext<MisterContextValue | null>(null)

export function MisterProvider({ locale = DEFAULT_LOCALE, children }: { locale?: Locale; children: ReactNode }) {
  const [thread, setThread] = useState<MisterMsg[]>([])
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [draft, setDraft] = useState('')

  const send = useCallback(async () => {
    const text = draft.trim()
    const attachment = pending
    if ((!text && !attachment) || busy) return
    setThread((prev) => [...prev, { who: 'op', text, image: attachment?.preview }])
    setDraft('')
    setPending(null)
    setBusy(true)
    try {
      const result = await askMister(
        text,
        attachment ? { mediaType: attachment.mediaType, dataBase64: attachment.dataBase64 } : undefined,
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
  }, [draft, pending, busy, locale])

  // Every renderable artifact (never the plain 'text' bubble), with a stable
  // per-session seq assigned by arrival order — the canvas switcher's model.
  const artifacts = useMemo<ArtifactEntry[]>(() => {
    const list: ArtifactEntry[] = []
    let seq = 0
    for (const m of thread) {
      if (m.who === 'mi' && m.result.renderer !== 'text' && m.result.renderer in MISTER_RENDERERS) {
        seq += 1
        list.push({ seq, result: m.result })
      }
    }
    return list
  }, [thread])

  const latestSeq = artifacts.length ? artifacts[artifacts.length - 1].seq : null
  const [selectedSeq, setSelectedSeq] = useState<number | null>(null)
  // A freshly-composed artifact always takes the canvas; the operator can flip back after.
  useEffect(() => {
    if (latestSeq !== null) setSelectedSeq(latestSeq)
  }, [latestSeq])

  const selectedArtifact = useMemo(
    () => artifacts.find((a) => a.seq === selectedSeq)?.result ?? artifacts.at(-1)?.result ?? null,
    [artifacts, selectedSeq],
  )
  const selectArtifact = useCallback((seq: number) => setSelectedSeq(seq), [])

  // Canvas working memory: each editor writes its latest state here (keyed by the
  // artifact seq) on unmount, so flipping the switcher and back — or a new artifact
  // stealing the canvas mid-edit — rehydrates instead of discarding the operator's
  // tuned numbers (closes the remount data-loss the review flagged).
  const [artifactDrafts, setArtifactDrafts] = useState<Record<number, unknown>>({})
  const saveArtifactDraft = useCallback((seq: number, value: unknown) => {
    setArtifactDrafts((prev) => ({ ...prev, [seq]: value }))
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
    }),
    [locale, thread, busy, pending, draft, send, artifacts, selectedSeq, selectArtifact, selectedArtifact, artifactDrafts, saveArtifactDraft],
  )

  return <MisterContext.Provider value={value}>{children}</MisterContext.Provider>
}

/** Read the shared Mister conversation. Throws if used outside the provider. */
export function useMister(): MisterContextValue {
  const ctx = useContext(MisterContext)
  if (!ctx) throw new Error('useMister must be used within a MisterProvider')
  return ctx
}

/** Read/write one artifact's canvas working memory (its editor's persisted state). */
export function useArtifactDraft<T>(seq: number): { draft: T | undefined; persist: (value: T) => void } {
  const { artifactDrafts, saveArtifactDraft } = useMister()
  const draft = artifactDrafts[seq] as T | undefined
  const persist = useCallback((value: T) => saveArtifactDraft(seq, value), [seq, saveArtifactDraft])
  return { draft, persist }
}
