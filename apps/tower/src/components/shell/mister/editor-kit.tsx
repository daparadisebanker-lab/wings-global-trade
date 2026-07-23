'use client'

// editor-kit — the shared building blocks for the canvas editors (Fable review
// finding 18). Four editors had pasted-and-diverged copies of parseNum + the
// navy field styles + a <Field> wrapper; the copies had already drifted (one
// rejected zero, others didn't) and one carried a locale bug. Consolidated here
// so a fix lands once for every editor.
import { useEffect, useRef, type ReactNode } from 'react'
import { MISTER_ARTIFACT } from '../mister-theme'

/** Shallow per-field equality for the flat editor snapshots (arrays compared by
 *  reference — setState always produces a fresh reference on a real edit). */
function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  const ka = Object.keys(a as Record<string, unknown>)
  const kb = Object.keys(b as Record<string, unknown>)
  if (ka.length !== kb.length) return false
  return ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

/**
 * Persist an editor's latest snapshot to its artifact draft ON UNMOUNT — exactly
 * when switching artifacts would otherwise discard in-progress edits (Fable review
 * finding 5). Writing only on unmount (not per keystroke) keeps the provider from
 * re-rendering the whole shell on every character. DIRTY-GATED: a snapshot equal
 * to the mount-time one is never written, so merely viewing an artifact (or a
 * pristine second instance) can't clobber a real draft or churn the provider. The
 * editor seeds its initial state from `draft` (via useArtifactDraft) so a remount
 * rehydrates.
 */
export function usePersistOnUnmount<T>(snapshot: T, persist: (value: T) => void): void {
  const ref = useRef(snapshot)
  ref.current = snapshot
  const initial = useRef(snapshot) // mount-time snapshot, captured once
  useEffect(
    () => () => {
      if (!shallowEqual(ref.current, initial.current)) persist(ref.current)
    },
    [persist],
  )
}

const { text: TEXT, muted: MUTED, fieldBg: FIELD_BG, border: BORDER, mono: MONO } = MISTER_ARTIFACT

/**
 * Parse a numeric field, locale-hardened (finding 1). The app is ES-first, where
 * an operator types a decimal COMMA — the old strip-everything-but-digits-and-dot
 * turned '22,5' into 225 (a 10× money error that then COMMITTED). Here:
 *  · a leading/any '-' returns null (visible fallback, never a silent sign-flip);
 *  · a trailing decimal comma ('22,5') becomes a dot;
 *  · remaining commas are thousands separators and are dropped ('78,400' → 78400).
 * `allowZero` gates the container-fit dimensions (which must be > 0).
 */
export function parseNum(raw: string, { allowZero = true }: { allowZero?: boolean } = {}): number | null {
  if (raw.includes('-')) return null
  const normalized = raw.replace(/,(\d{1,2})\s*$/, '.$1').replace(/,/g, '')
  const cleaned = normalized.replace(/[^0-9.]/g, '')
  if (cleaned === '' || cleaned === '.') return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 0) return null
  if (n === 0 && !allowZero) return null
  return n
}

/** Base field style — navy World-B, right-aligned tabular mono (selects override to left). */
export const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: FIELD_BG,
  color: TEXT,
  border: BORDER,
  borderRadius: 8,
  padding: '7px 9px',
  fontFamily: MONO,
  fontSize: 13,
  textAlign: 'right',
  WebkitAppearance: 'none',
  appearance: 'none',
}

export const labelStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 9.5,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: MUTED,
}

/** A labelled control — the <label> wraps its input, so the control is named for AT. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}
