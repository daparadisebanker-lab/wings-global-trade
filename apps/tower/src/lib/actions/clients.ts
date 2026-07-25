'use server'

// The Clients CRM data layer — every client (account) the caller can see,
// RLS-scoped on tower.accounts (read = has_brand_access), joined to its brand and
// primary contact. The single account-insert path (shared with Mister's
// save-draft) now carries the full CRM profile. Pure mapping + vocabularies live
// in clients-logic.ts ('use server' exports only async).

import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { ok, fail, type ActionResult } from './result'
import { mapClientRow, CLIENT_SELECT, type ClientListItem, type RawClientRow } from './clients-logic'

export interface ClientBrandOption {
  id: string
  name: string
}

export interface ClientOwnerOption {
  id: string
  name: string
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }
  return { ok: true as const, supabase, user }
}

/**
 * List clients the caller can see, A→Z. RLS on tower.accounts is the scope
 * boundary — this never widens it.
 */
export async function listClients(): Promise<ActionResult<ClientListItem[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
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
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('brands')
    .select('id,name')
    .order('name', { ascending: true })

  if (error) return fail('VALIDATION', 'No se pudieron listar las marcas / Could not list brands')
  return ok((data ?? []) as ClientBrandOption[])
}

/** Team roster for the account-owner picker (tower.team_roster — id + full_name,
 *  readable by any authed member; profiles_read itself is self/admin-only). */
export async function listTeamRoster(): Promise<ActionResult<ClientOwnerOption[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase.schema('tower').rpc('team_roster')
  if (error) return fail('VALIDATION', 'No se pudo leer el equipo / Could not read team')
  return ok(
    ((data ?? []) as { id: string; full_name: string | null }[]).map((r) => ({
      id: r.id,
      name: r.full_name ?? '—',
    })),
  )
}

const SOURCE_IDS = ['mister', 'whatsapp', 'referral', 'web', 'trade_fair', 'cold_outreach', 'network', 'other'] as const
const STAGE_IDS = ['lead', 'qualified', 'quoted', 'negotiating', 'won', 'dormant'] as const
const ARCHETYPE_IDS = ['EQUIPMENT', 'PROJECT', 'COMMODITY', 'PROGRAM', 'CREDENTIAL', 'ORIGIN', 'ALLOCATION'] as const

const nz = (max: number) => z.string().trim().max(max).nullish()

const createClientSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  source: z.enum(SOURCE_IDS).nullish(),
  category: nz(120),
  archetype: z.enum(ARCHETYPE_IDS).nullish(),
  demand: nz(2000),
  stage: z.enum(STAGE_IDS).default('lead'),
  country: nz(100),
  region: nz(100),
  city: nz(120),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/)
    .transform((s) => s.toUpperCase())
    .default('USD'),
  ownerId: z.string().uuid().nullish(),
  score: z.number().int().min(0).max(100).default(0),
  notes: nz(4000),
  // Primary contact (optional — created only when a name is given).
  contactName: nz(200),
  contactWhatsapp: nz(40),
  contactEmail: nz(200),
  contactRole: nz(120),
})
export type CreateClientInput = z.input<typeof createClientSchema>

/**
 * Create a client (account) with its CRM profile + an optional primary contact.
 * The single account-insert path — shared by the Clients window's form and
 * Mister's save-draft. RLS gates both writes (accounts_ins / contacts_ins =
 * has_brand_role LANE_DIRECTOR/SALES). Owner defaults to the creator.
 */
export async function createClient(input: CreateClientInput): Promise<ActionResult<ClientListItem>> {
  const parsed = createClientSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const d = parsed.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase.schema('tower')

  const { data: acct, error } = await db
    .from('accounts')
    .insert({
      brand_id: d.brandId,
      name: d.name,
      source: d.source ?? null,
      category: d.category ?? null,
      archetype_profile: d.archetype ?? null,
      demand: d.demand ?? null,
      stage: d.stage,
      country: d.country ?? null,
      region: d.region ?? null,
      city: d.city ?? null,
      currency: d.currency,
      owner_id: d.ownerId ?? auth.user.id,
      score: d.score,
      notes: d.notes ?? null,
    })
    .select('id')
    .single()

  if (error || !acct) return fail('FORBIDDEN_LANE', 'No se pudo crear el cliente / Could not create the client')
  const accountId = (acct as { id: string }).id

  // Primary contact (best-effort: the account stands even if this is rejected).
  if (d.contactName && d.contactName.length > 0) {
    await db.from('contacts').insert({
      account_id: accountId,
      full_name: d.contactName,
      whatsapp: d.contactWhatsapp ?? null,
      email: d.contactEmail ?? null,
      role: d.contactRole ?? null,
      is_primary: true,
    })
  }

  const { data: row, error: readErr } = await db.from('accounts').select(CLIENT_SELECT).eq('id', accountId).single()
  if (readErr || !row) return fail('VALIDATION', 'Cliente creado; no se pudo releer / Created; could not re-read')
  return ok(mapClientRow(row as unknown as RawClientRow))
}

const updateClientSchema = createClientSchema.extend({ id: z.string().uuid() })
export type UpdateClientInput = z.input<typeof updateClientSchema>

/**
 * Update a client's CRM profile + primary contact (RLS gates the write via
 * accounts_upd / contacts_upd = has_brand_role LANE_DIRECTOR/SALES). The primary
 * contact is upserted: an existing primary row is updated, else a new one is
 * inserted when a name is given. Brand is not re-parented here (identity stays).
 */
export async function updateClient(input: UpdateClientInput): Promise<ActionResult<ClientListItem>> {
  const parsed = updateClientSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const d = parsed.data

  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const db = auth.supabase.schema('tower')

  const { data: updated, error } = await db
    .from('accounts')
    .update({
      name: d.name,
      source: d.source ?? null,
      category: d.category ?? null,
      archetype_profile: d.archetype ?? null,
      demand: d.demand ?? null,
      stage: d.stage,
      country: d.country ?? null,
      region: d.region ?? null,
      city: d.city ?? null,
      currency: d.currency,
      owner_id: d.ownerId ?? auth.user.id,
      score: d.score,
      notes: d.notes ?? null,
    })
    .eq('id', d.id)
    .select('id')
    .single()

  if (error || !updated) return fail('FORBIDDEN_LANE', 'No se pudo actualizar / Could not update')

  // Upsert the primary contact.
  if (d.contactName && d.contactName.length > 0) {
    const { data: existing } = await db
      .from('contacts')
      .select('id')
      .eq('account_id', d.id)
      .eq('is_primary', true)
      .maybeSingle()
    const patch = {
      full_name: d.contactName,
      whatsapp: d.contactWhatsapp ?? null,
      email: d.contactEmail ?? null,
      role: d.contactRole ?? null,
    }
    if (existing) {
      await db.from('contacts').update(patch).eq('id', (existing as { id: string }).id)
    } else {
      await db.from('contacts').insert({ account_id: d.id, ...patch, is_primary: true })
    }
  }

  const { data: row, error: readErr } = await db.from('accounts').select(CLIENT_SELECT).eq('id', d.id).single()
  if (readErr || !row) return fail('VALIDATION', 'Actualizado; no se pudo releer / Updated; could not re-read')
  return ok(mapClientRow(row as unknown as RawClientRow))
}

const stageOnlySchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(STAGE_IDS),
})
export type MoveClientStageInput = z.input<typeof stageOnlySchema>

/** Move a client to a pipeline stage (the board's drop / select). RLS-gated. */
export async function moveClientStage(input: MoveClientStageInput): Promise<ActionResult<{ id: string; stage: string }>> {
  const parsed = stageOnlySchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  const { data, error } = await auth.supabase
    .schema('tower')
    .from('accounts')
    .update({ stage: parsed.data.stage })
    .eq('id', parsed.data.id)
    .select('id,stage')
    .single()
  if (error || !data) return fail('FORBIDDEN_LANE', 'No se pudo mover / Could not move')
  return ok(data as { id: string; stage: string })
}
