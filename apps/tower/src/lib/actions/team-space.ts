'use server'

// src/lib/actions/team-space.ts
// The team space's data layer (WS6) — the ORG-WIDE internal note stream with
// @mentions raising IN-SYSTEM notifications (D3, no email). Mutation law, same as
// the rest of TOWER: auth → Zod → RLS-scoped query. RLS is the whole boundary:
// team_notes/team_note_mentions policies (tower_55) gate every read and write; a
// rep only ever posts as themselves and marks their OWN mentions read.
//
// Dormant-safe: until tower_55 is applied, every query errors (relation missing)
// and these return a typed failure — the UI reads that as "coming soon" and hides
// the composer, rather than crashing or lying that the stream is empty.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import {
  mapNoteRow,
  mapMentionRow,
  normalizeMentionIds,
  type TeamNote,
  type TeamMention,
  type Teammate,
  type RawNoteRow,
  type RawMentionRow,
} from './team-space-logic'

const NOTE_COLUMNS = 'id,author_id,author_name,body,created_at'
const MENTION_COLUMNS = 'id,read_at,created_at,team_notes(id,author_name,body)'

const postSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  mentionedUserIds: z.array(z.string().uuid()).max(50).optional(),
})
export type PostTeamNoteInput = z.input<typeof postSchema>

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase, tower: supabase.schema('tower'), user }
}

/** Teammates that can be @mentioned (id + name), A→Z. Sourced from the
 *  SECURITY DEFINER tower.team_roster() so a non-admin rep can see the roster
 *  (profiles_read is self/admin-only). Errors → dormant/coming-soon. */
export async function listTeamRoster(): Promise<ActionResult<Teammate[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { data, error } = await gate.tower.rpc('team_roster')
  if (error) return fail('VALIDATION', 'Directorio no disponible / Roster unavailable')
  const rows = (data ?? []) as { id: string; full_name: string }[]
  return ok(rows.map((r) => ({ id: r.id, name: r.full_name })))
}

/** The recent stream, newest first (org-wide). Error → dormant/coming-soon. */
export async function listTeamNotes(limit = 50): Promise<ActionResult<TeamNote[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const cap = Math.min(Math.max(1, limit), 100)
  const { data, error } = await gate.tower
    .from('team_notes')
    .select(NOTE_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(cap)
  if (error) return fail('VALIDATION', 'Espacio de equipo no disponible / Team space unavailable')
  return ok(((data ?? []) as RawNoteRow[]).map(mapNoteRow))
}

/** The caller's own mentions (notifications), newest first. RLS scopes to
 *  mentioned_user_id = auth.uid(). Error → dormant/coming-soon. */
export async function listMyMentions(limit = 50): Promise<ActionResult<TeamMention[]>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const cap = Math.min(Math.max(1, limit), 100)
  const { data, error } = await gate.tower
    .from('team_note_mentions')
    .select(MENTION_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(cap)
  if (error) return fail('VALIDATION', 'Notificaciones no disponibles / Notifications unavailable')
  return ok(((data ?? []) as unknown as RawMentionRow[]).map(mapMentionRow))
}

/**
 * Team-space status for the shell rail — availability + the caller's unread
 * mention count, from ONE query. `available` is false when the query errors
 * (tower_55 unapplied) so the rail shows the Equipo entry ONLY when the feature
 * is live (no dead-end to a coming-soon page). Never throws — runs in the shell
 * layout on every page.
 */
export async function getMentionStatus(): Promise<{ available: boolean; unread: number }> {
  const gate = await requireUser()
  if (!gate.ok) return { available: false, unread: 0 }
  const { count, error } = await gate.tower
    .from('team_note_mentions')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) return { available: false, unread: 0 }
  return { available: true, unread: count ?? 0 }
}

/**
 * Post a note and notify the mentioned teammates. The note carries a denormalized
 * author_name (the caller's own profile full_name) so the stream renders without
 * cross-profile reads. Mentions are the EXPLICIT id list the composer submits
 * (never a re-parse of the body); RLS on the mentions insert re-checks authorship.
 * A rep never mentions themselves (dropped) — a self-notification is noise.
 */
export async function postTeamNote(input: PostTeamNoteInput): Promise<ActionResult<TeamNote>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { tower, user } = gate

  const parsed = postSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors)

  // The caller's display name (self-read is always allowed by profiles_read).
  const { data: profile } = await tower.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
  const authorName = ((profile as { full_name?: string } | null)?.full_name ?? '').trim() || 'Equipo'

  const { data: noteRow, error: noteError } = await tower
    .from('team_notes')
    .insert({ author_id: user.id, author_name: authorName, body: parsed.data.body })
    .select(NOTE_COLUMNS)
    .single()
  if (noteError || !noteRow) return fail('VALIDATION', 'No se pudo publicar / Could not post')
  const note = mapNoteRow(noteRow as RawNoteRow)

  const mentionIds = normalizeMentionIds(parsed.data.mentionedUserIds ?? []).filter((id) => id !== user.id)
  if (mentionIds.length > 0) {
    const rows = mentionIds.map((mentioned_user_id) => ({ note_id: note.id, mentioned_user_id }))
    // Best-effort: a failed mention insert must not lose the posted note. The
    // note is already saved; a mention that references a non-existent user (FK)
    // simply doesn't notify. Surface nothing — the post itself succeeded.
    await tower.from('team_note_mentions').insert(rows)
  }

  return ok(note)
}

/** Mark one of the caller's own mentions read. RLS (mentioned_user_id =
 *  auth.uid()) is the gate; this never widens it. */
export async function markMentionRead(mentionId: string): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const idParsed = z.string().uuid().safeParse(mentionId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const { error } = await gate.tower
    .from('team_note_mentions')
    .update({ read_at: new Date().toISOString() })
    .eq('id', idParsed.data)
    .is('read_at', null)
  if (error) return fail('VALIDATION', 'No se pudo marcar / Could not mark read')
  return ok(true)
}

/** Mark ALL of the caller's unread mentions read (the "marcar todo" action). */
export async function markAllMentionsRead(): Promise<ActionResult<true>> {
  const gate = await requireUser()
  if (!gate.ok) return gate.error
  const { error } = await gate.tower
    .from('team_note_mentions')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
  if (error) return fail('VALIDATION', 'No se pudo marcar / Could not mark read')
  return ok(true)
}
