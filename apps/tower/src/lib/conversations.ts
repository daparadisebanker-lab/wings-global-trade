// src/lib/conversations.ts
// The read-only contract behind Pipeline's <ConversationPane> (COMPONENT_TREE
// "Mister transcript + WhatsApp thread inline — the record IS the conversation").
// Merges two sources into one time-ordered thread for a single RFQ:
//   - MISTER  → public.mister_projects.history (existing Mister v2 session table)
//   - WHATSAPP → tower.whatsapp_messages (new table, see
//     programs/tower/migration/wave3-hooks.sql — proposed, not yet applied)
//
// PUBLIC CONTRACT: `getConversation(rfqId)` → `Conversation` is what W3.A's
// <ConversationPane> renders. Do not rename the export or reshape
// `ConversationEntry` without checking that caller.
//
// AUTHORIZATION SHAPE (resolves an API_MAP gap): the brief for this module
// says "RLS-scoped via the caller's server client" — but `mister_projects` is
// service-role-only by design (no anon/user policies at all, per
// supabase/migrations/20260627000001_mister_system.sql: "No public policies:
// service role only"). A plain RLS-scoped read of that table always returns
// nothing, which would silently blank half of every conversation.
//
// Resolution: authorize first, then read privileged. `getConversation` opens
// the RLS-scoped client and reads the `rfqs` row for `rfqId` — that read IS
// the permission check (CLAUDE.md Directive 1: RLS is the permission system).
// If Postgres won't return that row (wrong lane, no membership, bad id), we
// stop and return an empty conversation. Only once that row is confirmed
// visible to the caller do we switch to the service-role client to fetch the
// two privileged sources — scoped strictly to the ids found on that one
// authorized row (its `mister_session_id`, its own `id` for the WhatsApp
// join). This is not a general RLS bypass; it is a narrow, id-scoped read
// gated by an RLS check that already ran.
//
// Never throws: any failure (missing env, bad id, no access, empty history)
// degrades to `{ rfqId, entries: [] }` so <ConversationPane> always has
// something safe to render (same "degrade to empty" posture as
// lib/lanes/memberships.ts).
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'

export type ConversationSource = 'MISTER' | 'WHATSAPP'
export type ConversationRole = 'buyer' | 'advisor' | 'system'

export interface ConversationEntry {
  source: ConversationSource
  /** ISO 8601. */
  at: string
  role: ConversationRole
  text: string
}

export interface Conversation {
  rfqId: string
  entries: ConversationEntry[]
}

const rfqIdSchema = z.string().uuid()

// ── Mister side ──────────────────────────────────────────────────────────────

interface MisterHistoryTurn {
  role: 'user' | 'assistant'
  content: string
}

interface MisterSessionForConversation {
  history: MisterHistoryTurn[]
  createdAt: string
  updatedAt: string
}

/**
 * `mister_projects.history` (see @wings/mister `MisterProjectRow`) is an
 * ordered array of `{ role, content }` turns with NO per-turn timestamp — only
 * the session's `created_at`/`updated_at`. To interleave Mister turns with
 * WhatsApp messages (which do have real per-message timestamps) on one
 * timeline, we interpolate a synthetic `at` for each turn evenly across the
 * session's [created_at, updated_at] span, preserving turn order. This is an
 * approximation, not a real timestamp — documented ambiguity resolution
 * (Mister v2 has no per-turn time to read).
 */
export function misterHistoryToEntries(session: MisterSessionForConversation): ConversationEntry[] {
  const { history } = session
  if (history.length === 0) return []

  const start = new Date(session.createdAt).getTime()
  const end = new Date(session.updatedAt).getTime()
  const validSpan = Number.isFinite(start) && Number.isFinite(end) && end > start
  const anchor = Number.isFinite(start) ? start : Date.now()

  return history.map((turn, i) => {
    const frac = history.length === 1 ? 1 : i / (history.length - 1)
    const at = validSpan ? new Date(start + frac * (end - start)) : new Date(anchor)
    return {
      source: 'MISTER',
      at: at.toISOString(),
      role: turn.role === 'user' ? 'buyer' : 'advisor',
      text: turn.content,
    }
  })
}

async function fetchMisterEntries(
  service: SupabaseClient,
  misterSessionId: string | null,
): Promise<ConversationEntry[]> {
  if (!misterSessionId) return []

  const { data, error } = await service
    .from('mister_projects')
    .select('history, created_at, updated_at')
    .eq('id', misterSessionId)
    .maybeSingle()

  if (error || !data) return []

  const row = data as { history: MisterHistoryTurn[] | null; created_at: string; updated_at: string }
  return misterHistoryToEntries({
    history: row.history ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

// ── WhatsApp side ────────────────────────────────────────────────────────────

interface WhatsappMessageForConversation {
  direction: 'INBOUND' | 'OUTBOUND'
  body: string
  occurredAt: string
}

export function whatsappMessagesToEntries(messages: WhatsappMessageForConversation[]): ConversationEntry[] {
  return messages.map((m) => ({
    source: 'WHATSAPP',
    at: m.occurredAt,
    role: m.direction === 'INBOUND' ? 'buyer' : 'advisor',
    text: m.body,
  }))
}

async function fetchWhatsappEntries(service: SupabaseClient, rfqId: string): Promise<ConversationEntry[]> {
  const { data, error } = await service
    .schema('tower')
    .from('whatsapp_messages')
    .select('direction, body, occurred_at')
    .eq('rfq_id', rfqId)
    .order('occurred_at', { ascending: true })

  if (error || !data) return []

  return whatsappMessagesToEntries(
    (data as { direction: 'INBOUND' | 'OUTBOUND'; body: string; occurred_at: string }[]).map((m) => ({
      direction: m.direction,
      body: m.body,
      occurredAt: m.occurred_at,
    })),
  )
}

// ── Merge ────────────────────────────────────────────────────────────────────

/** Time-order entries from any number of sources. Stable on tied timestamps. */
export function mergeConversationEntries(entryGroups: ConversationEntry[][]): ConversationEntry[] {
  return entryGroups
    .flat()
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const diff = new Date(a.entry.at).getTime() - new Date(b.entry.at).getTime()
      return diff !== 0 ? diff : a.index - b.index
    })
    .map(({ entry }) => entry)
}

// ── Public contract ──────────────────────────────────────────────────────────

export async function getConversation(rfqId: string): Promise<Conversation> {
  const empty: Conversation = { rfqId, entries: [] }

  const parsedId = rfqIdSchema.safeParse(rfqId)
  if (!parsedId.success) return empty

  const scoped = await createServerSupabase()
  if (!scoped) return empty

  // Authorization gate — see header note. If RLS won't hand back this rfq
  // row, the caller has no business seeing its conversation either.
  const { data: rfq, error: rfqError } = await scoped
    .schema('tower')
    .from('rfqs')
    .select('id, mister_session_id')
    .eq('id', parsedId.data)
    .maybeSingle()

  if (rfqError || !rfq) return empty

  const authorized = rfq as { id: string; mister_session_id: string | null }

  const service = createServiceClient()
  if (!service) return empty

  const [misterEntries, whatsappEntries] = await Promise.all([
    fetchMisterEntries(service, authorized.mister_session_id),
    fetchWhatsappEntries(service, authorized.id),
  ])

  return { rfqId, entries: mergeConversationEntries([misterEntries, whatsappEntries]) }
}
