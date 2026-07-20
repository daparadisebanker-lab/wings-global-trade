'use server'

// src/lib/actions/admin.ts
// Admin module mutations + reads — API_MAP "Admin" domain (inviteUser,
// setMemberships, registerLane, publishSpecSchema[owned elsewhere]) plus the
// LaneRegistry/BrandManager operations from COMPONENT_TREE §6.
//
// AUTHORIZATION MODEL (deliberate, differs from the lane-scoped modules):
// Admin operates on the IDENTITY and TENANT tables — profiles, lane_memberships,
// lanes, brands — which have no lane_id to scope by and are inherently
// cross-user / cross-brand. Lane RLS (has_lane_role on a row's lane_id) cannot
// express "a group admin administers every user in every brand", and inviteUser
// needs the Supabase auth admin API regardless. So every action here:
//   1. resolves group-admin authority from the DB (profiles.is_group_admin via
//      the RLS-scoped client — never from client state), then
//   2. performs the write with the service-role client.
// The group-admin check IS the enforcement boundary — the same
// authorize-then-privileged-act pattern as tower.commit_container_cbm (W3) and
// the W3.C conversation reads (D-16). It does NOT widen any RLS policy in code
// (brief constraint); policy/column changes the DB genuinely needs are PROPOSED
// in programs/tower/migration/wave5-admin.sql, never applied here.
import { z } from 'zod'
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import { archetypeSchema, type Archetype } from '@/lib/archetypes'
import type { DbLaneRole } from './catalog-logic'
import {
  LANE_ROLES,
  LANE_STATUSES,
  BRAND_STATUSES,
  canTransitionLaneStatus,
  canTransitionBrandStatus,
  nextLaneCode,
  diffMemberships,
  slugify,
  SLUG_RE,
  LANE_CODE_PREFIX_RE,
  type LaneStatus,
  type BrandStatus,
  type MembershipKey,
} from './admin-logic'

// ── Row shapes returned to the UI ────────────────────────────────────────────

export interface AdminUserRow {
  id: string
  fullName: string
  email: string | null
  isGroupAdmin: boolean
  createdAt: string | null
  memberships: MembershipKey[]
}

export interface LaneAdminRow {
  id: string
  brandId: string
  brandSlug: string
  brandName: string
  code: string
  slug: string
  name: string
  archetype: Archetype
  status: LaneStatus
}

export interface BrandRow {
  id: string
  slug: string
  name: string
  status: BrandStatus
  createdAt: string | null
}

// ── Auth gate ────────────────────────────────────────────────────────────────

/** Service-role client + its `tower`-schema-scoped query builder (D-23 pattern). */
type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>
type TowerDb = ReturnType<ServiceClient['schema']>

type GroupAdminGate =
  | { ok: false; error: ActionResult<never> }
  | {
      ok: true
      /** service-role client scoped to the `tower` schema — the write path. */
      db: TowerDb
      /** unscoped service client (for auth.admin + default-schema reads). */
      service: ServiceClient
      userId: string
    }

async function requireGroupAdmin(): Promise<GroupAdminGate> {
  const rls = await createServerSupabase()
  if (!rls) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }

  const {
    data: { user },
  } = await rls.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }

  // Group-admin authority from the DB, not client state (D-07: a user may read
  // their own profile row through the RLS-scoped client).
  const { data: profile, error } = await rls
    .schema('tower')
    .from('profiles')
    .select('is_group_admin')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return { ok: false, error: fail('VALIDATION', 'No se pudo verificar permisos / Could not verify permissions') }
  if (!(profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    return { ok: false, error: fail('FORBIDDEN_LANE', 'Solo el administrador del grupo / Group admin only') }
  }

  const service = createServiceClient()
  if (!service) return { ok: false, error: fail('VALIDATION', 'Servicio no configurado / Service role not configured') }

  return { ok: true, db: service.schema('tower'), service, userId: user.id }
}

// ── Reads ────────────────────────────────────────────────────────────────────

/** Every user with their memberships and email — the UserManager grid source.
 * Email lives in auth.users (not tower.profiles), so it's read via the auth
 * admin API and joined in memory by id. */
export async function listUsers(): Promise<ActionResult<AdminUserRow[]>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db, service } = gate

  const [{ data: profiles, error: profilesError }, { data: memberships, error: membershipsError }, authList] =
    await Promise.all([
      db.from('profiles').select('id,full_name,is_group_admin,created_at').order('created_at', { ascending: true }),
      db.from('lane_memberships').select('user_id,lane_id,role'),
      service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ])

  if (profilesError || membershipsError) {
    return fail('VALIDATION', 'No se pudieron listar los usuarios / Could not list users')
  }

  const emailById = new Map<string, string | null>()
  for (const u of authList.data?.users ?? []) emailById.set(u.id, u.email ?? null)

  const membershipsByUser = new Map<string, MembershipKey[]>()
  for (const m of (memberships ?? []) as { user_id: string; lane_id: string; role: DbLaneRole }[]) {
    const list = membershipsByUser.get(m.user_id) ?? []
    list.push({ laneId: m.lane_id, role: m.role })
    membershipsByUser.set(m.user_id, list)
  }

  const rows = ((profiles ?? []) as {
    id: string
    full_name: string
    is_group_admin: boolean
    created_at: string | null
  }[]).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: emailById.get(p.id) ?? null,
    isGroupAdmin: p.is_group_admin,
    createdAt: p.created_at,
    memberships: membershipsByUser.get(p.id) ?? [],
  }))

  return ok(rows)
}

/** Every lane across every brand — LaneRegistry source + the columns of the
 * UserManager membership matrix. Append-only codes shown as-is. */
export async function listLanes(): Promise<ActionResult<LaneAdminRow[]>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const { data, error } = await db
    .from('lanes')
    .select('id,brand_id,code,slug,name,archetype,status,brands(slug,name)')
    .order('code', { ascending: true })

  if (error) return fail('VALIDATION', 'No se pudieron listar las lanes / Could not list lanes')

  const rows = ((data ?? []) as unknown as {
    id: string
    brand_id: string
    code: string
    slug: string
    name: string
    archetype: string
    status: string
    brands: { slug: string; name: string } | { slug: string; name: string }[] | null
  }[]).map((l) => {
    const brand = Array.isArray(l.brands) ? l.brands[0] : l.brands
    return {
      id: l.id,
      brandId: l.brand_id,
      brandSlug: brand?.slug ?? '',
      brandName: brand?.name ?? '',
      code: l.code,
      slug: l.slug,
      name: l.name,
      archetype: l.archetype as Archetype,
      status: l.status as LaneStatus,
    }
  })

  return ok(rows)
}

/** Every tenant brand — BrandManager source. `status` degrades to ACTIVE when
 * the (proposed) brands.status column isn't present yet (wave5-admin.sql). */
export async function listBrands(): Promise<ActionResult<BrandRow[]>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const { data, error } = await db.from('brands').select('*').order('created_at', { ascending: true })
  if (error) return fail('VALIDATION', 'No se pudieron listar las marcas / Could not list brands')

  const rows = ((data ?? []) as { id: string; slug: string; name: string; status?: string; created_at: string | null }[]).map(
    (b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      status: (b.status as BrandStatus) ?? 'ACTIVE',
      createdAt: b.created_at,
    }),
  )

  return ok(rows)
}

// ── Mutations · Users ────────────────────────────────────────────────────────

const emailSchema = z.string().trim().email().max(254)

/** Invite a new user by email (magic-link / Google, per ARCHITECTURE auth).
 * Creates the auth.users record via the admin API and ensures a matching
 * tower.profiles row (full_name seeded from the email local part, group-admin
 * false — elevation is a separate, deliberate act). */
export async function inviteUser(email: string): Promise<ActionResult<{ userId: string; email: string | null }>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db, service } = gate

  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) return fail('VALIDATION', 'Email inválido / Invalid email', parsed.error.flatten().formErrors.length ? { email: parsed.error.flatten().formErrors } : undefined)

  const { data, error } = await service.auth.admin.inviteUserByEmail(parsed.data)
  if (error || !data?.user) {
    // Most common: the address is already a user.
    return fail('VALIDATION', 'No se pudo invitar (¿ya existe?) / Could not invite (already a user?)', {
      email: [error?.message ?? 'invite_failed'],
    })
  }

  const localPart = parsed.data.split('@')[0] ?? parsed.data
  const { error: profileError } = await db
    .from('profiles')
    .upsert({ id: data.user.id, full_name: localPart, is_group_admin: false }, { onConflict: 'id', ignoreDuplicates: true })
  if (profileError) {
    return fail('VALIDATION', 'Usuario invitado pero no se creó el perfil / User invited but profile not created')
  }

  return ok({ userId: data.user.id, email: data.user.email ?? parsed.data })
}

const setAdminSchema = z.object({ userId: z.string().uuid(), isGroupAdmin: z.boolean() })

/**
 * Promote/demote a user to group admin (profiles.is_group_admin). Group admin is
 * the "sees + does everything" tier — the whole small team runs as group admins;
 * the fine-grained lane/brand roles are for external reps + future scale. Written
 * service-role (the column is revoked from the authenticated path, tower_32); a
 * group-admin can't demote themselves (lockout guard).
 */
export async function setUserGroupAdmin(input: z.input<typeof setAdminSchema>): Promise<ActionResult<{ userId: string; isGroupAdmin: boolean }>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const parsed = setAdminSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')
  if (parsed.data.userId === gate.userId && !parsed.data.isGroupAdmin) {
    return fail('VALIDATION', 'No puedes quitarte tu propio acceso de admin / You cannot demote yourself')
  }
  const { error } = await gate.db
    .from('profiles')
    .update({ is_group_admin: parsed.data.isGroupAdmin })
    .eq('id', parsed.data.userId)
  if (error) return fail('VALIDATION', 'No se pudo actualizar / Could not update')
  return ok({ userId: parsed.data.userId, isGroupAdmin: parsed.data.isGroupAdmin })
}

const membershipKeySchema = z.object({
  laneId: z.string().uuid(),
  role: z.enum(LANE_ROLES as unknown as [DbLaneRole, ...DbLaneRole[]]),
})

const setMembershipsSchema = z.object({
  userId: z.string().uuid(),
  desired: z.array(membershipKeySchema).max(200),
})

/** Replace a user's full membership set with the grid's desired (lane, role)
 * pairs. Computes the minimal add/remove (admin-logic.diffMemberships) and
 * applies it: revoking a role is a real row delete (lane_memberships has no
 * soft-delete column and is not an append-only world — Directive 4). */
export async function setMemberships(
  userId: string,
  desired: MembershipKey[],
): Promise<ActionResult<{ memberships: MembershipKey[] }>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const parsed = setMembershipsSchema.safeParse({ userId, desired })
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const { data: currentRows, error: readError } = await db
    .from('lane_memberships')
    .select('lane_id,role')
    .eq('user_id', parsed.data.userId)
  if (readError) return fail('VALIDATION', 'No se pudieron leer las memberships / Could not read memberships')

  const current: MembershipKey[] = ((currentRows ?? []) as { lane_id: string; role: DbLaneRole }[]).map((r) => ({
    laneId: r.lane_id,
    role: r.role,
  }))

  const { toAdd, toRemove } = diffMemberships(current, parsed.data.desired)

  // Disjoint key sets (diff guarantees it) — removals and additions never race.
  const removals = toRemove.map((k) =>
    db.from('lane_memberships').delete().match({ user_id: parsed.data.userId, lane_id: k.laneId, role: k.role }),
  )
  const additions =
    toAdd.length > 0
      ? [db.from('lane_memberships').insert(toAdd.map((k) => ({ user_id: parsed.data.userId, lane_id: k.laneId, role: k.role })))]
      : []

  const results = await Promise.all([...removals, ...additions])
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    // 23503 = a laneId that isn't a real lane.
    return fail('VALIDATION', 'No se pudieron guardar las memberships / Could not save memberships')
  }

  return ok({ memberships: parsed.data.desired })
}

// ── Mutations · Lanes ────────────────────────────────────────────────────────

const registerLaneSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(SLUG_RE, 'kebab-case').optional(),
  archetype: archetypeSchema,
  codePrefix: z.string().regex(LANE_CODE_PREFIX_RE, 'PREFIX debe ser 2–5 mayúsculas / PREFIX must be 2–5 uppercase letters'),
  scope: z.string().trim().max(280).optional(),
})

export type RegisterLaneInput = z.input<typeof registerLaneSchema>

/** Create a lane with the next append-only code for its prefix. Codes are never
 * reused, reordered, edited, or deleted (root CLAUDE.md §6). New lane opens at
 * status OPENING. A new lane "lights up" the whole app with zero code changes
 * (one row + memberships) — that is the payoff this action protects. */
export async function registerLane(input: RegisterLaneInput): Promise<ActionResult<LaneAdminRow>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const parsed = registerLaneSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const { data: brand, error: brandError } = await db
    .from('brands')
    .select('id,slug,name')
    .eq('id', parsed.data.brandId)
    .maybeSingle()
  if (brandError) return fail('VALIDATION', 'No se pudo leer la marca / Could not read brand')
  if (!brand) return fail('VALIDATION', 'Marca no encontrada / Brand not found')
  const brandRow = brand as { id: string; slug: string; name: string }

  const { data: codeRows, error: codesError } = await db.from('lanes').select('code')
  if (codesError) return fail('VALIDATION', 'No se pudieron leer los códigos / Could not read lane codes')
  const existingCodes = ((codeRows ?? []) as { code: string }[]).map((r) => r.code)

  const code = nextLaneCode(existingCodes, parsed.data.codePrefix)
  const slug = parsed.data.slug ?? slugify(parsed.data.name)
  if (!SLUG_RE.test(slug)) return fail('VALIDATION', 'No se pudo derivar el slug / Could not derive a valid slug')

  const config = parsed.data.scope ? { scope: parsed.data.scope, archetype: parsed.data.archetype } : { archetype: parsed.data.archetype }

  const { data, error } = await db
    .from('lanes')
    .insert({
      brand_id: brandRow.id,
      code,
      slug,
      name: parsed.data.name,
      archetype: parsed.data.archetype,
      status: 'OPENING',
      config,
    })
    .select('id,brand_id,code,slug,name,archetype,status')
    .single()

  if (error) {
    if (error.code === '23505') {
      // Either the code raced another register, or (brand_id, slug) collides.
      return fail('VALIDATION', 'Código o slug ya en uso, reintenta / Code or slug already used, retry', {
        slug: ['duplicate'],
      })
    }
    return fail('VALIDATION', 'No se pudo registrar la lane / Could not register lane')
  }

  const l = data as {
    id: string
    brand_id: string
    code: string
    slug: string
    name: string
    archetype: string
    status: string
  }
  return ok({
    id: l.id,
    brandId: l.brand_id,
    brandSlug: brandRow.slug,
    brandName: brandRow.name,
    code: l.code,
    slug: l.slug,
    name: l.name,
    archetype: l.archetype as Archetype,
    status: l.status as LaneStatus,
  })
}

const setLaneStatusSchema = z.object({
  laneId: z.string().uuid(),
  to: z.enum(LANE_STATUSES),
})

/** Flip a lane's status forward along OPENING → ACTIVE → ARCHIVED. Never
 * backward, never a no-op (admin-logic.canTransitionLaneStatus). The code is
 * untouched — ARCHIVED retires the lane, it does not free the code. */
export async function setLaneStatus(laneId: string, to: LaneStatus): Promise<ActionResult<{ id: string; status: LaneStatus }>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const parsed = setLaneStatusSchema.safeParse({ laneId, to })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: readError } = await db
    .from('lanes')
    .select('status')
    .eq('id', parsed.data.laneId)
    .maybeSingle()
  if (readError) return fail('VALIDATION', 'No se pudo leer la lane / Could not read lane')
  if (!current) return fail('VALIDATION', 'Lane no encontrada / Lane not found')

  const from = (current as { status: string }).status as LaneStatus
  if (!canTransitionLaneStatus(from, parsed.data.to)) {
    return fail('VALIDATION', `Transición inválida ${from} → ${parsed.data.to} / Invalid transition`)
  }

  const { data, error } = await db
    .from('lanes')
    .update({ status: parsed.data.to })
    .eq('id', parsed.data.laneId)
    .select('id,status')
    .single()
  if (error) return fail('VALIDATION', 'No se pudo actualizar el estado / Could not update status')

  const l = data as { id: string; status: string }
  return ok({ id: l.id, status: l.status as LaneStatus })
}

// ── Mutations · Brands ───────────────────────────────────────────────────────

const createBrandSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().regex(SLUG_RE, 'kebab-case').optional(),
})

export type CreateBrandInput = z.input<typeof createBrandSchema>

/** Create a tenant brand (wings, aladin, future endorsed brands — ADR-2). */
export async function createBrand(input: CreateBrandInput): Promise<ActionResult<BrandRow>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const parsed = createBrandSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }

  const slug = parsed.data.slug ?? slugify(parsed.data.name)
  if (!SLUG_RE.test(slug)) return fail('VALIDATION', 'No se pudo derivar el slug / Could not derive a valid slug')

  const { data, error } = await db.from('brands').insert({ slug, name: parsed.data.name }).select('*').single()
  if (error) {
    if (error.code === '23505') return fail('VALIDATION', 'Ese slug ya existe / Slug already used', { slug: ['duplicate'] })
    return fail('VALIDATION', 'No se pudo crear la marca / Could not create brand')
  }

  const b = data as { id: string; slug: string; name: string; status?: string; created_at: string | null }
  return ok({ id: b.id, slug: b.slug, name: b.name, status: (b.status as BrandStatus) ?? 'ACTIVE', createdAt: b.created_at })
}

const setBrandStatusSchema = z.object({
  brandId: z.string().uuid(),
  to: z.enum(BRAND_STATUSES),
})

/** Retire or reinstate a brand (append-only spirit: retire, never delete).
 * Requires the proposed brands.status column (wave5-admin.sql); until it lands
 * this returns a clear VALIDATION error rather than crashing. */
export async function setBrandStatus(brandId: string, to: BrandStatus): Promise<ActionResult<{ id: string; status: BrandStatus }>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { db } = gate

  const parsed = setBrandStatusSchema.safeParse({ brandId, to })
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const { data: current, error: readError } = await db.from('brands').select('*').eq('id', parsed.data.brandId).maybeSingle()
  if (readError) return fail('VALIDATION', 'No se pudo leer la marca / Could not read brand')
  if (!current) return fail('VALIDATION', 'Marca no encontrada / Brand not found')

  const from = ((current as { status?: string }).status as BrandStatus) ?? 'ACTIVE'
  if (!canTransitionBrandStatus(from, parsed.data.to)) {
    return fail('VALIDATION', `Transición inválida ${from} → ${parsed.data.to} / Invalid transition`)
  }

  const { data, error } = await db.from('brands').update({ status: parsed.data.to }).eq('id', parsed.data.brandId).select('id,status').single()
  if (error) {
    // 42703 = the brands.status column doesn't exist yet (pre-migration).
    if (error.code === '42703') {
      return fail('VALIDATION', 'Falta la columna brands.status (aplica wave5-admin.sql) / brands.status column missing (apply wave5-admin.sql)')
    }
    return fail('VALIDATION', 'No se pudo actualizar el estado / Could not update status')
  }

  const b = data as { id: string; status: string }
  return ok({ id: b.id, status: b.status as BrandStatus })
}
