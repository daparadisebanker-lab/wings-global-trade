// Pure logic for client media (WhatsApp-import attachments). The path shape is
// the security boundary — an EXACT `<owner-uuid>/<file-uuid>.<ext>` (mirrors the
// trial-products IDOR fix: no traversal, no cross-owner write). Split from the
// 'use server' action so it's unit-testable without Supabase.

export type ClientMediaKind = 'image' | 'audio'

export interface ClientMediaItem {
  path: string
  kind: ClientMediaKind
  name: string
}

export const CLIENT_MEDIA_BUCKET = 'client-media'

/** Accepted upload extensions → their kind + the content-type to PUT. Also the
 *  set the bucket's allowed_mime_types (tower_59) enforces. */
export const CLIENT_MEDIA_EXT: Record<string, { kind: ClientMediaKind; mime: string }> = {
  jpg: { kind: 'image', mime: 'image/jpeg' },
  jpeg: { kind: 'image', mime: 'image/jpeg' },
  png: { kind: 'image', mime: 'image/png' },
  webp: { kind: 'image', mime: 'image/webp' },
  gif: { kind: 'image', mime: 'image/gif' },
  heic: { kind: 'image', mime: 'image/heic' },
  opus: { kind: 'audio', mime: 'audio/ogg' },
  ogg: { kind: 'audio', mime: 'audio/ogg' },
  mp3: { kind: 'audio', mime: 'audio/mpeg' },
  m4a: { kind: 'audio', mime: 'audio/mp4' },
  aac: { kind: 'audio', mime: 'audio/aac' },
  wav: { kind: 'audio', mime: 'audio/wav' },
}

export type ClientMediaExt = keyof typeof CLIENT_MEDIA_EXT
export const CLIENT_MEDIA_EXTS = Object.keys(CLIENT_MEDIA_EXT)
const EXT_ALT = CLIENT_MEDIA_EXTS.join('|')

export function isClientMediaExt(ext: string): ext is ClientMediaExt {
  return Object.prototype.hasOwnProperty.call(CLIENT_MEDIA_EXT, ext.toLowerCase())
}

/** `<owner-uuid>/<file-uuid>.<ext>` — owner-scoped by construction. */
export function buildClientMediaPath(ownerId: string, fileId: string, ext: string): string {
  return `${ownerId}/${fileId}.${ext.toLowerCase()}`
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** EXACT own-prefix match — the caller's uid, one uuid segment, an allowed ext,
 *  and nothing else (no extra slashes, no `..`). Defense-in-depth beyond RLS. */
export function isOwnClientMediaPath(ownerId: string, path: string): boolean {
  if (typeof path !== 'string' || typeof ownerId !== 'string' || !ownerId) return false
  const re = new RegExp(`^${escapeRe(ownerId)}/[0-9a-fA-F-]{36}\\.(?:${EXT_ALT})$`)
  return re.test(path)
}

// ── Parse a stored media array (jsonb) → typed items ─────────────────────────
function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v : null
}

export function parseMediaArray(raw: unknown): ClientMediaItem[] {
  if (!Array.isArray(raw)) return []
  const out: ClientMediaItem[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    const path = str(o.path, 300)
    const kind = o.kind === 'image' || o.kind === 'audio' ? o.kind : null
    if (!path || !kind) continue
    out.push({ path, kind, name: str(o.name, 200) ?? path.split('/').pop() ?? 'archivo' })
  }
  return out.slice(0, 30)
}
