'use client'

// La Escalera · Rung 2 — THE ONE THING.
//
// Spec: "a buyer who leaves with a record has been served. Every later rung is
// judged by whether it feeds this record or distracts from it."
//
// So the record is local-first and account-free: it lives in IndexedDB on the
// buyer's phone and must survive airplane mode, a killed tab, and a week of
// indecision. Nothing here talks to a network.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { openDB, type IDBPDatabase } from 'idb'
import { DEFAULT_WASTE_PCT } from '@/lib/packing'

const DB_NAME = 'escalera'
const DB_VERSION = 1
const STORE = 'state'
const DOC_KEY = 'record:v1'

/** One tile the buyer kept. Rung 2 fields + the Rung 3 quantity fields. */
export interface RecordEntry {
  tileId: string
  addedAt: number
  /** buyer's own note; their private logic outranks ours */
  note: string
  /** checked items float to their own section */
  checked: boolean
  /** Rung 3 — m² to cover. null until they type one. */
  areaM2: number | null
  wastePct: number
  /** optional room label, e.g. "Baño 2" */
  room: string
}

/** Who the quote is from. Optional — the tool works without it. */
export interface Buyer {
  name: string
  company: string
  project: string
}

export interface RecordState {
  /** ordered — the order IS the buyer's logic; drag reorders it */
  entries: RecordEntry[]
  /** tiles the deck has already shown, so it can offer to skip them */
  seen: string[]
  /** deck cursor, so a returning buyer resumes where they stopped */
  deckIndex: number
  buyer: Buyer
}

const EMPTY_BUYER: Buyer = { name: '', company: '', project: '' }
const EMPTY: RecordState = { entries: [], seen: [], deckIndex: 0, buyer: EMPTY_BUYER }

type Action =
  | { type: 'hydrate'; state: RecordState }
  | { type: 'add'; tileId: string }
  | { type: 'remove'; tileId: string }
  | { type: 'restore'; entry: RecordEntry; at: number }
  | { type: 'patch'; tileId: string; patch: Partial<RecordEntry> }
  | { type: 'move'; from: number; to: number }
  | { type: 'reorder'; entries: RecordEntry[] }
  | { type: 'markSeen'; tileId: string }
  | { type: 'setDeckIndex'; index: number }
  | { type: 'setBuyer'; patch: Partial<Buyer> }
  | { type: 'clear' }

function newEntry(tileId: string): RecordEntry {
  return {
    tileId,
    addedAt: Date.now(),
    note: '',
    checked: false,
    areaM2: null,
    wastePct: DEFAULT_WASTE_PCT,
    room: '',
  }
}

function reducer(state: RecordState, action: Action): RecordState {
  switch (action.type) {
    case 'hydrate':
      return action.state

    case 'add': {
      if (state.entries.some((e) => e.tileId === action.tileId)) return state
      return { ...state, entries: [...state.entries, newEntry(action.tileId)] }
    }

    case 'remove':
      return { ...state, entries: state.entries.filter((e) => e.tileId !== action.tileId) }

    case 'restore': {
      if (state.entries.some((e) => e.tileId === action.entry.tileId)) return state
      const next = [...state.entries]
      // put it back where it was, not at the end — undo should be invisible
      next.splice(Math.max(0, Math.min(action.at, next.length)), 0, action.entry)
      return { ...state, entries: next }
    }

    case 'patch':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.tileId === action.tileId ? { ...e, ...action.patch } : e,
        ),
      }

    case 'move': {
      const { from, to } = action
      if (from === to || from < 0 || from >= state.entries.length) return state
      const next = [...state.entries]
      const [moved] = next.splice(from, 1)
      next.splice(Math.max(0, Math.min(to, next.length)), 0, moved)
      return { ...state, entries: next }
    }

    case 'reorder': {
      // Guard: a reorder must be a permutation, never a way to drop a line.
      if (action.entries.length !== state.entries.length) return state
      return { ...state, entries: action.entries }
    }

    case 'setBuyer':
      return { ...state, buyer: { ...state.buyer, ...action.patch } }

    case 'markSeen':
      return state.seen.includes(action.tileId)
        ? state
        : { ...state, seen: [...state.seen, action.tileId] }

    case 'setDeckIndex':
      return { ...state, deckIndex: Math.max(0, action.index) }

    case 'clear':
      return { ...EMPTY }

    default:
      return state
  }
}

// ── persistence ────────────────────────────────────────────────────────────

function db(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(d) {
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE)
    },
  })
}

/** Shape-check what came out of IndexedDB — a corrupt doc must not crash the deck. */
function sane(raw: unknown): RecordState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<RecordState>
  if (!Array.isArray(r.entries) || !Array.isArray(r.seen)) return null
  const entries = r.entries.filter(
    (e): e is RecordEntry => !!e && typeof (e as RecordEntry).tileId === 'string',
  )
  return {
    entries: entries.map((e) => ({
      ...newEntry(e.tileId),
      ...e,
      areaM2: typeof e.areaM2 === 'number' && Number.isFinite(e.areaM2) ? e.areaM2 : null,
    })),
    seen: r.seen.filter((s): s is string => typeof s === 'string'),
    deckIndex: typeof r.deckIndex === 'number' && r.deckIndex >= 0 ? r.deckIndex : 0,
    buyer: { ...EMPTY_BUYER, ...(r.buyer && typeof r.buyer === 'object' ? r.buyer : {}) },
  }
}

// ── undo ───────────────────────────────────────────────────────────────────

export interface UndoToast {
  entry: RecordEntry
  index: number
  label: string
}

interface RecordApi {
  state: RecordState
  /** false until IndexedDB has been read — render counters only after this */
  hydrated: boolean
  /** true when this browser refused persistence (private mode, quota) */
  degraded: boolean
  has: (tileId: string) => boolean
  add: (tileId: string) => void
  remove: (tileId: string, label?: string) => void
  patch: (tileId: string, patch: Partial<RecordEntry>) => void
  move: (from: number, to: number) => void
  reorder: (entries: RecordEntry[]) => void
  setBuyer: (patch: Partial<Buyer>) => void
  markSeen: (tileId: string) => void
  setDeckIndex: (index: number) => void
  clear: () => void
  undo: UndoToast | null
  runUndo: () => void
  dismissUndo: () => void
}

const Ctx = createContext<RecordApi | null>(null)

/** Rung 1 spec: "Undo = a 4-second toast. Nothing else." */
const UNDO_MS = 4000

export function RecordProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [degraded, setDegraded] = useState(false)
  const [undo, setUndo] = useState<UndoToast | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // read once on mount
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const d = await db()
        const raw = await d.get(STORE, DOC_KEY)
        const parsed = sane(raw)
        if (alive && parsed) dispatch({ type: 'hydrate', state: parsed })
      } catch {
        // Private mode / blocked storage: the tool still works for this session,
        // it just cannot promise the record survives. The UI says so.
        if (alive) setDegraded(true)
      } finally {
        if (alive) setHydrated(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // write on every change, debounced — typing m² must not thrash the disk
  useEffect(() => {
    if (!hydrated) return
    const t = setTimeout(() => {
      db()
        .then((d) => d.put(STORE, state, DOC_KEY))
        .catch(() => setDegraded(true))
    }, 250)
    return () => clearTimeout(t)
  }, [state, hydrated])

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current)
    },
    [],
  )

  const armUndo = useCallback((toast: UndoToast) => {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndo(toast)
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS)
  }, [])

  const api = useMemo<RecordApi>(() => {
    const byId = new Set(state.entries.map((e) => e.tileId))
    return {
      state,
      hydrated,
      degraded,
      has: (tileId) => byId.has(tileId),
      add: (tileId) => dispatch({ type: 'add', tileId }),
      remove: (tileId, label) => {
        const index = state.entries.findIndex((e) => e.tileId === tileId)
        const entry = state.entries[index]
        dispatch({ type: 'remove', tileId })
        if (entry) armUndo({ entry, index, label: label ?? entry.tileId })
      },
      patch: (tileId, patch) => dispatch({ type: 'patch', tileId, patch }),
      move: (from, to) => dispatch({ type: 'move', from, to }),
      reorder: (entries) => dispatch({ type: 'reorder', entries }),
      setBuyer: (patch) => dispatch({ type: 'setBuyer', patch }),
      markSeen: (tileId) => dispatch({ type: 'markSeen', tileId }),
      setDeckIndex: (index) => dispatch({ type: 'setDeckIndex', index }),
      clear: () => dispatch({ type: 'clear' }),
      undo,
      runUndo: () => {
        if (!undo) return
        dispatch({ type: 'restore', entry: undo.entry, at: undo.index })
        setUndo(null)
      },
      dismissUndo: () => setUndo(null),
    }
  }, [state, hydrated, degraded, undo, armUndo])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useRecord(): RecordApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useRecord must be used inside <RecordProvider>')
  return v
}
