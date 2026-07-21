'use server'

// The Clients window's data layer — every client (account) the caller can see,
// RLS-scoped on tower.accounts (read = has_brand_access), joined to its brand.
// This is the management home for the accounts Mister's save-draft creates.
// Pure mapping + types live in clients-logic.ts ('use server' exports only async).

import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import { mapClientRow, CLIENT_SELECT, type ClientListItem, type RawClientRow } from './clients-logic'

/**
 * List clients the caller can see, A→Z. RLS on tower.accounts is the scope
 * boundary — this never widens it.
 */
export async function listClients(): Promise<ActionResult<ClientListItem[]>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const { data, error } = await supabase
    .schema('tower')
    .from('accounts')
    .select(CLIENT_SELECT)
    .order('name', { ascending: true })
    .limit(500)

  if (error) return fail('VALIDATION', 'No se pudieron listar los clientes / Could not list clients')

  return ok(((data ?? []) as unknown as RawClientRow[]).map(mapClientRow))
}
