// src/lib/actions/team-space-logic.ts
// Pure logic for the team space (WS6) — the ORG-WIDE internal note stream with
// @mentions that raise IN-SYSTEM notifications (D3, no email). Kept out of the
// 'use server' file so it is unit-testable and importable by the client: the
// display shapes, the row mappers, the @-token splitter (for highlighting), the
// mention-id normalizer, and the excerpt used in the notification list.

/** A note in the stream. `authorName` is the denormalized snapshot stored on the
 *  row (profiles_read is self/admin-only), so the stream renders without reading
 *  other users' profiles. `body` is rendered with @-tokens highlighted. */
export interface TeamNote {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

/** A mention = the notification the mentioned teammate sees. */
export interface TeamMention {
  id: string
  noteId: string
  authorName: string
  body: string
  createdAt: string
  read: boolean
}

/** A teammate that can be @mentioned (from tower.team_roster()). */
export interface Teammate {
  id: string
  name: string
}

const MAX_MENTIONS = 20

// A mention token in the body: @ then letters/digits/._- (no spaces), and only
// at a word boundary — start of string or after whitespace (the boundary is a
// capture, NOT a lookbehind: lookbehind would be a parse-time SyntaxError on old
// Safari and take down the whole client bundle). So an email fragment like "a@b"
// or a trailing "@gmail.com" is NOT highlighted. Highlighting only — the
// authoritative recipients are the explicit id list the composer submits.
const MENTION_RE = /(^|\s)(@[\p{L}\p{N}._-]+)/gu

/** PURE: split a body into text / mention segments for rendering. A segment is a
 *  mention iff it was the captured @token (never inferred from a leading '@'). */
export function splitBodyMentions(body: string): { text: string; mention: boolean }[] {
  if (!body) return []
  const out: { text: string; mention: boolean }[] = []
  let last = 0
  for (const m of body.matchAll(MENTION_RE)) {
    const boundary = m[1] ?? ''
    const token = m[2] ?? ''
    const tokenStart = (m.index ?? 0) + boundary.length // keep the boundary char in the text run
    if (tokenStart > last) out.push({ text: body.slice(last, tokenStart), mention: false })
    out.push({ text: token, mention: true })
    last = tokenStart + token.length
  }
  if (last < body.length) out.push({ text: body.slice(last), mention: false })
  return out.filter((s) => s.text.length > 0)
}

/** PURE: normalize a submitted mention-id list — trim, drop blanks, dedupe, cap.
 *  Order-preserving. The cap is a guard, not a product limit. */
export function normalizeMentionIds(ids: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of ids) {
    const id = (raw ?? '').trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (out.length >= MAX_MENTIONS) break
  }
  return out
}

/** PURE: a one-line excerpt for the notification list. */
export function excerpt(body: string, max = 120): string {
  const clean = body.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

/** PURE: case/diacritic-insensitive teammate filter for the @mention picker. */
export function filterTeammates(list: Teammate[], query: string): Teammate[] {
  const q = fold(query)
  if (!q) return list
  return list.filter((tm) => fold(tm.name).includes(q))
}

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// ── Row mappers (snake_case DB → camelCase app) ──────────────────────────────
export interface RawNoteRow {
  id: string
  author_id: string
  author_name: string
  body: string
  created_at: string
}
export function mapNoteRow(row: RawNoteRow): TeamNote {
  return { id: row.id, authorId: row.author_id, authorName: row.author_name, body: row.body, createdAt: row.created_at }
}

type Nested<T> = T | T[] | null
export interface RawMentionRow {
  id: string
  read_at: string | null
  created_at: string
  team_notes: Nested<{ id: string; author_name: string; body: string }>
}
function one<T>(v: Nested<T>): T | null {
  if (Array.isArray(v)) return v.length > 0 ? v[0] : null
  return v ?? null
}
export function mapMentionRow(row: RawMentionRow): TeamMention {
  const note = one(row.team_notes)
  return {
    id: row.id,
    noteId: note?.id ?? '',
    authorName: note?.author_name ?? '',
    body: note?.body ?? '',
    createdAt: row.created_at,
    read: row.read_at != null,
  }
}
