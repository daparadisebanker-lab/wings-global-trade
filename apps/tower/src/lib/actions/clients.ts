'use server'

// The Clients window's data layer — every client (account) the caller can see,
// RLS-scoped on tower.accounts (read = has_brand_access), joined to its brand.
// This is the management home for the accounts Mister's save-draft creates.
// Pure mapping + types live in clients-logic.ts ('use server' exports only async).

import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import { mapClientRow, CLIENT_SELECT, type ClientListItem, type RawClientRow } from './clients-logic'

export interface ClientBrandOption {
  id: string
  name: string
}

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

/** The brands the caller can file a client under (RLS read = has_brand_access). */
export async function listClientBrands(): Promise<ActionResult<ClientBrandOption[]>> {
  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const { data, error } = await supabase
    .schema('tower')
    .from('brands')
    .select('id,name')
    .order('name', { ascending: true })

  if (error) return fail('VALIDATION', 'No se pudieron listar las marcas / Could not list brands')
  return ok((data ?? []) as ClientBrandOption[])
}

const createClientSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  country: z.string().trim().max(100).nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
})
export type CreateClientInput = z.input<typeof createClientSchema>

/**
 * Create a client (account) under a brand. The single account-insert path —
 * shared by the Clients window's "+ Nuevo cliente" form and Mister's save-draft.
 * RLS gates the write (accounts_ins = has_brand_role LANE_DIRECTOR/SALES).
 */
export async function createClient(input: CreateClientInput): Promise<ActionResult<ClientListItem>> {
  const parsed = createClientSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const supabase = await createServerSupabase()
  if (!supabase) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail('UNAUTHORIZED', 'Sesión requerida / Session required')

  const { data, error } = await supabase
    .schema('tower')
    .from('accounts')
    .insert({
      brand_id: parsed.data.brandId,
      name: parsed.data.name,
      country: parsed.data.country ?? null,
      region: parsed.data.region ?? null,
    })
    .select(CLIENT_SELECT)
    .single()

  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo crear el cliente / Could not create the client')
  return ok(mapClientRow(data as unknown as RawClientRow))
}
