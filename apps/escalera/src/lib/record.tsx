'use client'

// El Pasillo — the record.
//
// Two-speed collect: a swipe in the Lane takes the whole SERIES as a folder
// with every SKU pre-checked; the folder view and the Lista refine down to the
// six patterns the buyer actually wants. Collecting is broad and fast, refining
// is precise and deliberate — which is how buyers shortlist, and it keeps a
// full-lane pass at one gesture per series instead of 236 per catalogue.
//
// Local-first: IndexedDB, no account. The record survives airplane mode, a
// killed tab and a week of indecision.
//
// One thing here is deliberately NOT persisted. A pass is not a reject: the
// series stays in position, stays on the scrubber, and re-lights on scroll-back
// or filter clear. Passes expire when the session does, because tile stock and
// series availability change, and a remembered pass could permanently hide a
// supplier whose situation improved.

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
import { skusOf } from '@/lib/catalogue'
import type { Basis, Quantity } from '@/lib/packing'

const DB_NAME = 'pasillo'
const DB_VERSION = 1
const STORE = 'state'
const DOC_KEY = 'record:v1'

/** A collected series — a folder, not a leaf. */
export interface Folder {
  series_uid: string
  addedAt: number
  /** sku_uids kept. Collecting pre-checks every SKU in the series. */
  selected: string[]
  note: string
}

export interface Buyer {
  name: string
  company: string
  project: string
  port: string
  incoterm: string
  target: string
}

export interface RecordState {
  /** ordered — the buyer's logic outranks ours, so drag reorders this */
  folders: Folder[]
  /** sku_uid → quantity, stored in the basis it was entered in */
  qty: Record<string, Quantity>
  /** sku_uid → note */
  notes: Record<string, string>
  basis: Basis
  buyer: Buyer
}

const EMPTY_BUYER: Buyer = {
  name: '',
  company: '',
  project: '',
  port: '',
  incoterm: 'FOB',
  target: '',
}

const EMPTY: RecordState = {
  folders: [],
  qty: {},
  notes: {},
  basis: 'm2',
  buyer: EMPTY_BUYER,
}

export type Tri = 'none' | 'partial' | 'all'

type Action =
  | { type: 'hydrate'; state: RecordState }
  | { type: 'collectSeries'; series_uid: string }
  | { type: 'removeSeries'; series_uid: string }
  | { type: 'restoreFolder'; folder: Folder; at: number }
  | { type: 'toggleSku'; series_uid: string; sku_uid: string }
  | { type: 'setSeriesAll'; series_uid: string; on: boolean }
  | { type: 'collectSku'; series_uid: string; sku_uid: string }
  | { type: 'setQty'; sku_uid: string; qty: Quantity | null }
  | { type: 'setNote'; sku_uid: string; note: string }
  | { type: 'setFolderNote'; series_uid: string; note: string }
  | { type: 'reorder'; folders: Folder[] }
  | { type: 'setBasis'; basis: Basis }
  | { type: 'setBuyer'; patch: Partial<Buyer> }
  | { type: 'clear' }

function reducer(state: RecordState, a: Action): RecordState {
  switch (a.type) {
    case 'hydrate':
      return a.state

    case 'collectSeries': {
      if (state.folders.some((f) => f.series_uid === a.series_uid)) return state
      return {
        ...state,
        folders: [
          ...state.folders,
          {
            series_uid: a.series_uid,
            addedAt: Date.now(),
            selected: skusOf(a.series_uid).map((s) => s.sku_uid),
            note: '',
          },
        ],
      }
    }

    case 'collectSku': {
      // Long-press in a grid, or a tap in the sibling strip: collect one SKU,
      // creating its folder if the series is not in the record yet.
      const existing = state.folders.find((f) => f.series_uid === a.series_uid)
      if (!existing) {
        return {
          ...state,
          folders: [
            ...state.folders,
            { series_uid: a.series_uid, addedAt: Date.now(), selected: [a.sku_uid], note: '' },
          ],
        }
      }
      if (existing.selected.includes(a.sku_uid)) return state
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.series_uid === a.series_uid ? { ...f, selected: [...f.selected, a.sku_uid] } : f,
        ),
      }
    }

    case 'removeSeries':
      return { ...state, folders: state.folders.filter((f) => f.series_uid !== a.series_uid) }

    case 'restoreFolder': {
      if (state.folders.some((f) => f.series_uid === a.folder.series_uid)) return state
      const next = [...state.folders]
      next.splice(Math.max(0, Math.min(a.at, next.length)), 0, a.folder)
      return { ...state, folders: next }
    }

    case 'toggleSku':
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.series_uid !== a.series_uid
            ? f
            : {
                ...f,
                selected: f.selected.includes(a.sku_uid)
                  ? f.selected.filter((s) => s !== a.sku_uid)
                  : [...f.selected, a.sku_uid],
              },
        ),
      }

    case 'setSeriesAll':
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.series_uid !== a.series_uid
            ? f
            : { ...f, selected: a.on ? skusOf(a.series_uid).map((s) => s.sku_uid) : [] },
        ),
      }

    case 'setQty': {
      const qty = { ...state.qty }
      if (a.qty == null) delete qty[a.sku_uid]
      else qty[a.sku_uid] = a.qty
      return { ...state, qty }
    }

    case 'setNote': {
      const notes = { ...state.notes }
      if (!a.note) delete notes[a.sku_uid]
      else notes[a.sku_uid] = a.note
      return { ...state, notes }
    }

    case 'setFolderNote':
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.series_uid === a.series_uid ? { ...f, note: a.note } : f,
        ),
      }

    case 'reorder':
      // A reorder must be a permutation, never a way to drop a folder.
      if (a.folders.length !== state.folders.length) return state
      return { ...state, folders: a.folders }

    case 'setBasis':
      return { ...state, basis: a.basis }

    case 'setBuyer':
      return { ...state, buyer: { ...state.buyer, ...a.patch } }

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

/** Shape-check what came out of storage — a corrupt doc must not blank the lane. */
function sane(raw: unknown): RecordState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<RecordState>
  if (!Array.isArray(r.folders)) return null
  return {
    folders: r.folders
      .filter((f): f is Folder => !!f && typeof f.series_uid === 'string')
      .map((f) => ({
        series_uid: f.series_uid,
        addedAt: typeof f.addedAt === 'number' ? f.addedAt : Date.now(),
        selected: Array.isArray(f.selected) ? f.selected.filter((s) => typeof s === 'string') : [],
        note: typeof f.note === 'string' ? f.note : '',
      })),
    qty:
      r.qty && typeof r.qty === 'object'
        ? Object.fromEntries(
            Object.entries(r.qty).filter(
              ([, v]) => v && typeof (v as Quantity).value === 'number',
            ),
          )
        : {},
    notes: r.notes && typeof r.notes === 'object' ? (r.notes as Record<string, string>) : {},
    basis: r.basis === 'ctn' || r.basis === 'pcs' ? r.basis : 'm2',
    buyer: { ...EMPTY_BUYER, ...(r.buyer && typeof r.buyer === 'object' ? r.buyer : {}) },
  }
}

// ── undo ───────────────────────────────────────────────────────────────────

export interface UndoState {
  folder: Folder
  index: number
  label: string
}

const UNDO_MS = 4000

interface RecordApi {
  state: RecordState
  hydrated: boolean
  degraded: boolean
  /** session-only: a passed series dims but is never removed or reordered */
  passed: ReadonlySet<string>
  pass: (series_uid: string) => void
  unpass: (series_uid: string) => void
  clearPasses: () => void
  folderOf: (series_uid: string) => Folder | undefined
  isCollected: (series_uid: string) => boolean
  triState: (series_uid: string) => Tri
  selectedCount: (series_uid: string) => number
  isSkuSelected: (series_uid: string, sku_uid: string) => boolean
  collectSeries: (series_uid: string) => void
  collectSku: (series_uid: string, sku_uid: string) => void
  removeSeries: (series_uid: string, label?: string) => void
  toggleSku: (series_uid: string, sku_uid: string) => void
  setSeriesAll: (series_uid: string, on: boolean) => void
  setQty: (sku_uid: string, qty: Quantity | null) => void
  setNote: (sku_uid: string, note: string) => void
  setFolderNote: (series_uid: string, note: string) => void
  reorder: (folders: Folder[]) => void
  setBasis: (basis: Basis) => void
  setBuyer: (patch: Partial<Buyer>) => void
  clear: () => void
  undo: UndoState | null
  runUndo: () => void
}

const Ctx = createContext<RecordApi | null>(null)

export function RecordProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY)
  const [hydrated, setHydrated] = useState(false)
  const [degraded, setDegraded] = useState(false)
  const [undo, setUndo] = useState<UndoState | null>(null)
  // Deliberately React state, never IndexedDB: passes expire with the session.
  const [passed, setPassed] = useState<Set<string>>(() => new Set())
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const d = await db()
        const parsed = sane(await d.get(STORE, DOC_KEY))
        if (alive && parsed) dispatch({ type: 'hydrate', state: parsed })
      } catch {
        if (alive) setDegraded(true)
      } finally {
        if (alive) setHydrated(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

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

  const api = useMemo<RecordApi>(() => {
    const byUid = new Map(state.folders.map((f) => [f.series_uid, f]))
    const armUndo = (u: UndoState) => {
      if (undoTimer.current) clearTimeout(undoTimer.current)
      setUndo(u)
      undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS)
    }
    return {
      state,
      hydrated,
      degraded,
      passed,
      pass: (uid) =>
        setPassed((p) => {
          const n = new Set(p)
          n.add(uid)
          return n
        }),
      unpass: (uid) =>
        setPassed((p) => {
          const n = new Set(p)
          n.delete(uid)
          return n
        }),
      clearPasses: () => setPassed(new Set()),
      folderOf: (uid) => byUid.get(uid),
      isCollected: (uid) => byUid.has(uid),
      selectedCount: (uid) => byUid.get(uid)?.selected.length ?? 0,
      triState: (uid) => {
        const f = byUid.get(uid)
        if (!f || f.selected.length === 0) return 'none'
        return f.selected.length >= skusOf(uid).length ? 'all' : 'partial'
      },
      isSkuSelected: (series_uid, sku_uid) =>
        byUid.get(series_uid)?.selected.includes(sku_uid) ?? false,
      collectSeries: (series_uid) => dispatch({ type: 'collectSeries', series_uid }),
      collectSku: (series_uid, sku_uid) => dispatch({ type: 'collectSku', series_uid, sku_uid }),
      removeSeries: (series_uid, label) => {
        const index = state.folders.findIndex((f) => f.series_uid === series_uid)
        const folder = state.folders[index]
        dispatch({ type: 'removeSeries', series_uid })
        if (folder) armUndo({ folder, index, label: label ?? series_uid })
      },
      toggleSku: (series_uid, sku_uid) => dispatch({ type: 'toggleSku', series_uid, sku_uid }),
      setSeriesAll: (series_uid, on) => dispatch({ type: 'setSeriesAll', series_uid, on }),
      setQty: (sku_uid, qty) => dispatch({ type: 'setQty', sku_uid, qty }),
      setNote: (sku_uid, note) => dispatch({ type: 'setNote', sku_uid, note }),
      setFolderNote: (series_uid, note) => dispatch({ type: 'setFolderNote', series_uid, note }),
      reorder: (folders) => dispatch({ type: 'reorder', folders }),
      setBasis: (basis) => dispatch({ type: 'setBasis', basis }),
      setBuyer: (patch) => dispatch({ type: 'setBuyer', patch }),
      clear: () => dispatch({ type: 'clear' }),
      undo,
      runUndo: () => {
        if (!undo) return
        dispatch({ type: 'restoreFolder', folder: undo.folder, at: undo.index })
        setUndo(null)
      },
    }
  }, [state, hydrated, degraded, undo, passed])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useRecord(): RecordApi {
  const v = useContext(Ctx)
  if (!v) throw new Error('useRecord must be used inside <RecordProvider>')
  return v
}

/** Haptic vocabulary. A phone in a warehouse is held, not listened to. */
export function haptic(kind: 'collect' | 'pass' | 'check'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  const p = { collect: [7, 22, 11], pass: 4, check: 6 }[kind]
  try {
    navigator.vibrate(p as number | number[])
  } catch {
    /* a nicety, never a failure */
  }
}
