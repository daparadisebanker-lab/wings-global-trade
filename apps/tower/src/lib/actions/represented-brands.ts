'use server'

// src/lib/actions/represented-brands.ts
// Represented-Brands console — the TOWER write-side over the shipped rb_wave1
// backend (RB Console Wave 1, Ch 01). Mutation law: auth → Zod → RLS (has_rb_role)
// or service-role for the two publish-gate columns (status, kit_complete) that
// tower_25 revoked from the authenticated path. Registry ops (create brand, grant
// memberships) are group-admin; brand-scoped ops (list, kit, status) run under
// the rep's RLS client so a rep only ever touches their own brand.
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { slugify, SLUG_RE } from './admin-logic'
import {
  canTransitionRbStatus,
  nextRbCode,
  rbDiffMemberships,
  rbKitSchema,
  validateKit,
  RB_ROLES,
  RB_STATUSES,
  type RbRole,
  type RbStatus,
} from './represented-brands-logic'

const uuidSchema = z.string().uuid()

// ── Auth helpers ─────────────────────────────────────────────────────────────
async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

/** Group-admin gate + a service-role (RLS-bypassing) client for registry writes. */
async function requireGroupAdmin() {
  const auth = await requireUser()
  if (!auth.ok) return auth
  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('is_group_admin')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (!(profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    return { ok: false, error: fail('FORBIDDEN_LANE', 'Requiere administrador / Group admin required') } as const
  }
  const service = createServiceClient()
  if (!service) return { ok: false, error: fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured') } as const
  return { ok: true, supabase: auth.supabase, service: service.schema('tower'), user: auth.user } as const
}

type TowerClient = ReturnType<SupabaseClient['schema']>

/** Is the caller a BRAND_MANAGER of this brand, or a group admin? */
async function callerCanManageBrand(supabase: TowerClient, userId: string, brandId: string): Promise<boolean> {
  const { data: profile } = await supabase.from('profiles').select('is_group_admin').eq('id', userId).maybeSingle()
  if ((profile as { is_group_admin?: boolean } | null)?.is_group_admin) return true
  const { data } = await supabase
    .from('rb_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('represented_brand_id', brandId)
    .eq('role', 'BRAND_MANAGER')
    .maybeSingle()
  return Boolean(data)
}

// ── Row shapes ───────────────────────────────────────────────────────────────
export interface RepresentedBrandRow {
  id: string
  code: string
  slug: string
  name: string
  status: RbStatus
  kitComplete: boolean
  categories: string[]
  identity: Record<string, unknown>
}

interface RawBrandRow {
  id: string
  code: string
  slug: string
  name: string
  status: string
  kit_complete: boolean
  categories: string[] | null
  identity: Record<string, unknown> | null
}
const BRAND_COLS = 'id,code,slug,name,status,kit_complete,categories,identity'
function mapBrand(r: RawBrandRow): RepresentedBrandRow {
  return {
    id: r.id,
    code: r.code,
    slug: r.slug,
    name: r.name,
    status: r.status as RbStatus,
    kitComplete: r.kit_complete,
    categories: r.categories ?? [],
    identity: r.identity ?? {},
  }
}

// ── Registry actions (group-admin) ───────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().regex(SLUG_RE).max(80).optional(),
  categories: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
})
export type RegisterRepresentedBrandInput = z.input<typeof registerSchema>

/** Mint an append-only RB/xx code and seed the tenant row at PROSPECT. */
export async function registerRepresentedBrand(
  input: RegisterRepresentedBrandInput,
): Promise<ActionResult<RepresentedBrandRow & { registryLine: string }>> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireGroupAdmin()
  if (!auth.ok) return auth.error

  const { data: existing, error: readError } = await auth.service.from('represented_brands').select('code')
  if (readError) return fail('VALIDATION', 'No se pudo leer el registro / Could not read registry')
  const code = nextRbCode(((existing ?? []) as { code: string }[]).map((r) => r.code))
  const slug = parsed.data.slug ?? slugify(parsed.data.name)

  const { data, error } = await auth.service
    .from('represented_brands')
    .insert({ code, slug, name: parsed.data.name, categories: parsed.data.categories, status: 'PROSPECT', kit_complete: false })
    .select(BRAND_COLS)
    .single()
  if (error || !data) {
    return fail('VALIDATION', 'No se pudo registrar (¿slug/código duplicado?) / Could not register (duplicate slug/code?)')
  }
  const brand = mapBrand(data as unknown as RawBrandRow)
  // A server action cannot write a repo file — ops pastes this into registry.md.
  const registryLine = `| ${code} | ${brand.name} | ${brand.slug} | (accent pending) | OPENING |`
  return ok({ ...brand, registryLine })
}

/** Grant/revoke a user's RB memberships (real deletes; not append-only). */
const membershipSchema = z.object({
  userId: uuidSchema,
  desired: z.array(z.object({ brandId: uuidSchema, role: z.enum(RB_ROLES) })).max(200),
})
export async function setRepresentedBrandMemberships(
  input: z.input<typeof membershipSchema>,
): Promise<ActionResult<{ added: number; removed: number }>> {
  const parsed = membershipSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const auth = await requireGroupAdmin()
  if (!auth.ok) return auth.error

  const { data: current } = await auth.service
    .from('rb_memberships')
    .select('represented_brand_id,role')
    .eq('user_id', parsed.data.userId)
  const currentKeys = ((current ?? []) as { represented_brand_id: string; role: RbRole }[]).map((m) => ({
    brandId: m.represented_brand_id,
    role: m.role,
  }))
  const { toAdd, toRemove } = rbDiffMemberships(currentKeys, parsed.data.desired)

  for (const k of toRemove) {
    const { error } = await auth.service
      .from('rb_memberships')
      .delete()
      .eq('user_id', parsed.data.userId)
      .eq('represented_brand_id', k.brandId)
      .eq('role', k.role)
    if (error) return fail('VALIDATION', 'No se pudo revocar / Could not revoke')
  }
  if (toAdd.length > 0) {
    const { error } = await auth.service
      .from('rb_memberships')
      .insert(toAdd.map((k) => ({ user_id: parsed.data.userId, represented_brand_id: k.brandId, role: k.role })))
    if (error) return fail('VALIDATION', 'No se pudo asignar / Could not assign')
  }
  return ok({ added: toAdd.length, removed: toRemove.length })
}

// ── Brand-scoped reads/writes (requireUser + RLS) ────────────────────────────

/** The tenancy read: a rep sees only their brands; a group admin sees all. */
export async function listRepresentedBrands(): Promise<ActionResult<RepresentedBrandRow[]>> {
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  const { data, error } = await auth.supabase.from('represented_brands').select(BRAND_COLS).order('code')
  if (error) return fail('FORBIDDEN_LANE', 'No se pudieron leer las marcas / Could not read brands')
  return ok(((data ?? []) as unknown as RawBrandRow[]).map(mapBrand))
}

/** Retire/advance a brand along the 8-state machine. status is a revoked column,
 *  so the write goes through the service role AFTER the TS transition + kit gate. */
export async function setRepresentedBrandStatus(brandId: string, to: string): Promise<ActionResult<RepresentedBrandRow>> {
  const idParsed = uuidSchema.safeParse(brandId)
  const toParsed = z.enum(RB_STATUSES).safeParse(to)
  if (!idParsed.success || !toParsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  const auth = await requireUser()
  if (!auth.ok) return auth.error
  if (!(await callerCanManageBrand(auth.supabase, auth.user.id, idParsed.data))) {
    return fail('FORBIDDEN_LANE', 'Solo el gestor de la marca / Brand manager only')
  }
  const { data: current } = await auth.supabase
    .from('represented_brands')
    .select('status,kit_complete')
    .eq('id', idParsed.data)
    .maybeSingle()
  const cur = current as { status: RbStatus; kit_complete: boolean } | null
  if (!cur) return fail('FORBIDDEN_LANE', 'Marca no encontrada / Brand not found')
  if (!canTransitionRbStatus(cur.status, toParsed.data, { kitComplete: cur.kit_complete })) {
    return fail('STAGE_INVALID', `Transición no permitida ${cur.status} → ${toParsed.data}`)
  }
  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')
  const { data, error } = await service
    .schema('tower')
    .from('represented_brands')
    .update({ status: toParsed.data })
    .eq('id', idParsed.data)
    .select(BRAND_COLS)
    .single()
  if (error || !data) return fail('VALIDATION', 'No se pudo actualizar el estado / Could not update status')
  return ok(mapBrand(data as unknown as RawBrandRow))
}

/** Intake the --rb-* kit: rep writes identity via RLS; kit_complete is set by the
 *  service role only if the colour validators pass (never set by hand). */
export async function saveBrandKit(
  brandId: string,
  kit: unknown,
  existingAccents: string[] = [],
): Promise<ActionResult<{ kitComplete: boolean; errors: string[] }>> {
  const idParsed = uuidSchema.safeParse(brandId)
  if (!idParsed.success) return fail('VALIDATION', 'ID inválido / Invalid id')
  const parsed = rbKitSchema.safeParse(kit)
  if (!parsed.success) {
    return fail('VALIDATION', 'Kit inválido / Invalid kit', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const auth = await requireUser()
  if (!auth.ok) return auth.error

  // Rep-facing identity write goes through RLS as BRAND_MANAGER.
  const { error: idError } = await auth.supabase
    .from('represented_brands')
    .update({ identity: parsed.data })
    .eq('id', idParsed.data)
  if (idError) return fail('FORBIDDEN_LANE', 'No se pudo guardar el kit / Could not save the kit')

  const validation = validateKit(parsed.data, existingAccents)
  const service = createServiceClient()
  if (!service) return fail('UNAUTHORIZED', 'Servicio no configurado / Service not configured')
  const { error: kcError } = await service
    .schema('tower')
    .from('represented_brands')
    .update({ kit_complete: validation.kitComplete })
    .eq('id', idParsed.data)
  if (kcError) return fail('VALIDATION', 'No se pudo actualizar kit_complete / Could not update kit_complete')

  return ok({ kitComplete: validation.kitComplete, errors: validation.errors })
}
