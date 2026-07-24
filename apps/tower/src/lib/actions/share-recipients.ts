'use server'

// src/lib/actions/share-recipients.ts
// The WhatsApp-share recipient list (root CLAUDE.md §5-bis, WS5). Reads the
// client contacts the caller can reach — RLS on tower.contacts scopes it to
// accounts whose brand the rep has access to (contacts_read = has_brand_access),
// so this NEVER widens the boundary. Pure mapping + reachability live in
// share-recipients-logic.ts ('use server' may only export async functions).
//
// This action does NOT send anything. The share is the rep's own WhatsApp
// workflow: the client picker builds a wa.me deep-link the rep opens (D2 — no
// Meta/Cloud API, no server-side send). The DB is read-only here.
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import { SHARE_CONTACT_SELECT, toRecipients, type RawContactRow, type ShareRecipient } from './share-recipients-logic'

/**
 * Client contacts the caller can reach on WhatsApp, A→Z by account then contact.
 * Contacts with no usable WhatsApp number are dropped in the pure mapper, so the
 * picker only ever lists people the rep can actually message. RLS is the scope.
 */
export async function listShareRecipients(): Promise<ActionResult<ShareRecipient[]>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  // Filter out null-WhatsApp contacts at the DB and order before the limit, so a
  // tenant with >1000 contacts gets a deterministic, reachable-first slice (an
  // unordered limit would drop reachable clients arbitrarily on each load). The
  // pure toRecipients still applies the final reachability gate + display sort.
  const { data, error } = await supabase
    .schema('tower')
    .from('contacts')
    .select(SHARE_CONTACT_SELECT)
    .not('whatsapp', 'is', null)
    .order('full_name', { ascending: true })
    .limit(1000)

  if (error) return fail('VALIDATION', 'No se pudieron listar los contactos / Could not list contacts')

  return ok(toRecipients((data ?? []) as unknown as RawContactRow[]))
}
