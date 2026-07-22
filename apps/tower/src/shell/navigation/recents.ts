// Palette "Recientes" — recently visited record detail routes, in localStorage.
// Bounded, deduped by href, newest-first. No network, no server dependency: the
// shell records an entry on navigation to a detail route (ShellChrome), the
// palette reads the list when it opens. rbac is applied at read time by the
// palette (filter on the operator's `visible` module set).
import type { ModuleId } from '@/lib/nav'

const KEY = 'tower-recents'
const MAX = 8

export interface RecentEntry {
  /** The detail-route href to jump back to. Also the dedupe key. */
  href: string
  /** Human label (module name + short id today; real record names are a follow-up). */
  label: string
  /** Module tag for the leading chip. */
  tag: string
  /** Owning module — the palette gates recents on `visible.has(moduleId)`. */
  moduleId: ModuleId
}

export function readRecents(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // Defensive: only keep well-formed entries (a stale/foreign shape is dropped,
    // never rendered as a broken row).
    return (parsed as RecentEntry[])
      .filter((e) => e && typeof e.href === 'string' && typeof e.label === 'string')
      .slice(0, MAX)
  } catch {
    return []
  }
}

export function recordRecent(entry: RecentEntry): void {
  try {
    const next = [entry, ...readRecents().filter((r) => r.href !== entry.href)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* private mode / quota — recents are best-effort */
  }
}
