// Mister's conversation across page loads.
//
// The dock's thread lived in React state only: a reload — a navigation that
// remounted the shell, a deploy, a closed tab — erased it. That made the
// conversation memory the router now depends on (history.ts) last exactly as long
// as one page view, which is not how an operator works: they read a supplier
// screenshot, go check a client in the CRM, come back, and expect Mister to still
// know what they were costing.
//
// Storage is the browser's, not the database's, on purpose: the thread is a
// working surface, not a record. Anything that must survive as a record already
// goes through an ai_draft (Directive 7 — propose, then dispose), and a
// server-side store would need a migration, RLS and a retention answer for a
// scratchpad. What is here instead: scoped per operator, capped, expiring, and
// discarded whole on any doubt.
//
// Everything below is pure — `Storage` is injected — so the whole contract is
// unit-tested without a browser.

import type { CopilotResult } from './types'

/** One turn in the thread — the operator's message, or Mister's result. Defined
 *  here (rather than in the provider) because persistence is what fixes its
 *  shape; MisterProvider re-exports it, so consumers are unchanged. */
export type MisterMsg = { who: 'op'; text: string; image?: string } | { who: 'mi'; result: CopilotResult }

/** Envelope version. BUMP THIS whenever a renderer's `data` shape changes
 *  incompatibly: a stored artifact is rendered by the NEW code, so a stale
 *  payload from an older deploy must be discarded rather than handed to a
 *  renderer that no longer understands it. A bump costs operators one
 *  conversation; not bumping costs them a broken cockpit. */
export const THREAD_STORE_VERSION = 1

/** A conversation is a working context, not a record — a day-old one is noise. */
export const THREAD_TTL_MS = 12 * 60 * 60 * 1000
/** Turns kept. Well past the 8 the router reads (history.ts) so the operator can
 *  still scroll back, but bounded. */
export const MAX_STORED_TURNS = 40
/** Serialized ceiling. localStorage gives ~5 MB for the whole origin, which TOWER
 *  also uses for dock/rail/theme prefs — the thread never gets to crowd them out. */
export const MAX_STORED_BYTES = 200_000

const KEY_PREFIX = 'tower-mister-thread'

/** Short, stable, non-reversible-at-a-glance key suffix (FNV-1a). The point is
 *  scoping, not secrecy — anything with script access can read the value itself;
 *  this just keeps one operator's conversation from loading into another's
 *  session on a shared workstation, and keeps the address out of the key list. */
function fingerprint(identity: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < identity.length; i += 1) {
    h ^= identity.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}

/** The storage key for one operator. A null identity (unresolved session) gets
 *  its own slot rather than sharing the anonymous one with a signed-in thread. */
export function threadStorageKey(identity: string | null): string {
  return `${KEY_PREFIX}:${identity ? fingerprint(identity.trim().toLowerCase()) : 'anon'}`
}

/** Strip a turn to what is safe and worth storing. Returns null to drop it.
 *  The pasted-screenshot dataURL never travels: it is megabytes of base64 for a
 *  thumbnail, so an image turn persists as its caption (the same marker the
 *  router's transcript uses) and rehydrates without the preview. */
function toStorable(msg: unknown): MisterMsg | null {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) return null
  const m = msg as { who?: unknown; text?: unknown; image?: unknown; result?: unknown }
  if (m.who === 'op') {
    if (typeof m.text !== 'string') return null
    const text = m.text.trim() || (m.image ? '[captura adjunta]' : '')
    return text ? { who: 'op', text } : null
  }
  if (m.who !== 'mi') return null
  const r = m.result
  if (!r || typeof r !== 'object' || Array.isArray(r)) return null
  const result = r as { renderer?: unknown; note?: unknown; text?: unknown; data?: unknown }
  if (typeof result.renderer !== 'string' || !result.renderer) return null
  return {
    who: 'mi',
    result: {
      renderer: result.renderer,
      ...(typeof result.note === 'string' ? { note: result.note } : {}),
      ...(typeof result.text === 'string' ? { text: result.text } : {}),
      ...(result.data !== undefined ? { data: result.data } : {}),
    },
  }
}

/** Serialize the tail of a thread under both caps. Oldest turns are dropped
 *  first — a follow-up refers to the recent ones. Returns null when there is
 *  nothing worth storing. */
export function serializeThread(thread: MisterMsg[], now: number = Date.now()): string | null {
  let turns = thread.map(toStorable).filter((m): m is MisterMsg => m !== null).slice(-MAX_STORED_TURNS)
  while (turns.length) {
    const payload = JSON.stringify({ v: THREAD_STORE_VERSION, savedAt: now, turns })
    if (payload.length <= MAX_STORED_BYTES) return payload
    turns = turns.slice(1) // shed the oldest turn and re-measure
  }
  return null
}

/** Parse a stored envelope back into a thread. Returns [] for anything wrong —
 *  a wrong version, an expired or malformed envelope, a turn that no longer
 *  parses. A lost conversation is a nuisance; a cockpit that throws on a stale
 *  payload is an outage. */
export function deserializeThread(raw: string | null, now: number = Date.now()): MisterMsg[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as { v?: unknown; savedAt?: unknown; turns?: unknown }
    if (parsed?.v !== THREAD_STORE_VERSION) return []
    if (typeof parsed.savedAt !== 'number' || !Number.isFinite(parsed.savedAt)) return []
    // Reject the future too — a clock change must not pin a thread forever.
    if (now - parsed.savedAt > THREAD_TTL_MS || parsed.savedAt > now + THREAD_TTL_MS) return []
    if (!Array.isArray(parsed.turns)) return []
    return parsed.turns.map(toStorable).filter((m): m is MisterMsg => m !== null).slice(-MAX_STORED_TURNS)
  } catch {
    return []
  }
}

/** Read one operator's thread. Never throws — private mode, a disabled store, a
 *  full quota and a corrupt value all degrade to "no conversation yet". */
export function loadThread(storage: Storage | undefined, key: string, now: number = Date.now()): MisterMsg[] {
  try {
    return deserializeThread(storage?.getItem(key) ?? null, now)
  } catch {
    return []
  }
}

/** Write one operator's thread (removing the key when there is nothing to keep).
 *  Never throws — a failed save must never break a working conversation. */
export function saveThread(
  storage: Storage | undefined,
  key: string,
  thread: MisterMsg[],
  now: number = Date.now(),
): void {
  try {
    if (!storage) return
    const payload = serializeThread(thread, now)
    if (payload) storage.setItem(key, payload)
    else storage.removeItem(key)
  } catch {
    /* quota exceeded / private mode / storage disabled */
  }
}
