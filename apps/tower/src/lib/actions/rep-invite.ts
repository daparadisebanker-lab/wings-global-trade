'use server'

// src/lib/actions/rep-invite.ts
// Rep ENROLLMENT — a group admin invites a rep by email and, in one atomic-ish
// act, (1) creates the auth.users record via the Supabase Auth admin API, (2)
// ensures a tower.profiles row, (3) grants the chosen membership (rb_memberships
// OR lane_memberships — the existing grant tables), and (4) seeds the rep's empty
// tower.rep_profiles row so the onboarding gate + self-serve screen (rep-profile.ts)
// light up on their first sign-in.
//
// AUTHORIZATION MODEL — the same "authorize-then-privileged-act" pattern as
// admin.ts (inviteUser/setMemberships) and represented-brands-media.ts: the
// invite needs the Supabase Auth admin API and writes cross-user identity/
// membership rows that lane RLS cannot express, so the action:
//   1. resolves group-admin authority from the DB (profiles.is_group_admin via the
//      RLS-scoped client — never client state), then
//   2. performs every write with the SERVICE ROLE.
// The group-admin check IS the enforcement boundary. No RLS policy is widened.
//
// IDEMPOTENT-SAFE: inviting an address that is already a user does not crash —
// we recover the existing user id and continue (grant + profile + rep row are all
// upserts). The composite-PK membership onConflict makes a repeat grant a no-op.
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import {
  buildMembershipInsert,
  displayNameFromEmail,
  repInviteSchema,
  type RepInviteInput,
} from './rep-invite-logic'

export interface RepInviteResult {
  userId: string
  email: string | null
  /** true when the auth invite email was freshly sent; false when the address
   *  was already a user (membership + rep row were still ensured). */
  invited: boolean
}

async function requireGroupAdmin() {
  const rls = await createServerSupabase()
  if (!rls) return { ok: false as const, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') }
  const {
    data: { user },
  } = await rls.auth.getUser()
  if (!user) return { ok: false as const, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') }

  const { data: profile, error } = await rls
    .schema('tower')
    .from('profiles')
    .select('is_group_admin')
    .eq('id', user.id)
    .maybeSingle()
  if (error) return { ok: false as const, error: fail('VALIDATION', 'No se pudo verificar permisos / Could not verify permissions') }
  if (!(profile as { is_group_admin?: boolean } | null)?.is_group_admin) {
    return { ok: false as const, error: fail('FORBIDDEN_LANE', 'Solo el administrador del grupo / Group admin only') }
  }

  const service = createServiceClient()
  if (!service) return { ok: false as const, error: fail('VALIDATION', 'Servicio no configurado / Service role not configured') }
  return { ok: true as const, service, db: service.schema('tower') }
}

/** Find an existing auth user by email (idempotent-invite recovery). One page of
 *  1000 covers the internal team + rep roster at this scale. */
async function findUserIdByEmail(
  service: NonNullable<ReturnType<typeof createServiceClient>>,
  email: string,
): Promise<string | null> {
  const { data } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const target = email.toLowerCase()
  const match = (data?.users ?? []).find((u) => (u.email ?? '').toLowerCase() === target)
  return match?.id ?? null
}

/**
 * Enroll a rep: invite (or recover) the user, ensure their profile, grant the
 * chosen membership, and seed their empty rep_profiles row. Group-admin only.
 */
export async function inviteRep(input: RepInviteInput): Promise<ActionResult<RepInviteResult>> {
  const gate = await requireGroupAdmin()
  if (!gate.ok) return gate.error
  const { service, db } = gate

  const parsed = repInviteSchema.safeParse(input)
  if (!parsed.success) {
    return fail('VALIDATION', 'Datos inválidos / Invalid data', parsed.error.flatten().fieldErrors as Record<string, string[]>)
  }
  const { email, target } = parsed.data

  // 1 · Invite by email via the Auth admin API. On failure (most commonly: the
  //     address is already a user) recover the existing id and continue.
  let userId: string | null = null
  let email_: string | null = email
  let invited = false
  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email)
  if (inviteData?.user) {
    userId = inviteData.user.id
    email_ = inviteData.user.email ?? email
    invited = true
  } else {
    userId = await findUserIdByEmail(service, email)
    if (!userId) {
      return fail('VALIDATION', 'No se pudo invitar / Could not invite', {
        email: [inviteError?.message ?? 'invite_failed'],
      })
    }
  }

  // 2 · Ensure the profile row (full_name seeded from the email; group-admin false —
  //     elevation is a separate, deliberate act).
  const { error: profileError } = await db
    .from('profiles')
    .upsert(
      { id: userId, full_name: displayNameFromEmail(email), is_group_admin: false },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  if (profileError) {
    return fail('VALIDATION', 'Usuario invitado pero no se creó el perfil / User invited but profile not created')
  }

  // 3 · Grant the membership via the existing grant table (idempotent on its
  //     composite PK — re-enrolling the same (user, target, role) is a no-op).
  const membership = buildMembershipInsert(userId, target)
  const { error: membershipError } = await db
    .from(membership.table)
    .upsert(membership.row, { onConflict: membership.onConflict, ignoreDuplicates: true })
  if (membershipError) {
    return fail('VALIDATION', 'No se pudo asignar el acceso / Could not grant membership', {
      target: [membershipError.message],
    })
  }

  // 4 · Seed the empty rep_profiles row — the signal that this user is a rep who
  //     must self-serve onboarding (getMyRepProfile returns non-null-but-empty,
  //     onboarded_at null → the shell shows the onboarding banner).
  const { error: repError } = await db
    .from('rep_profiles')
    .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
  if (repError) {
    return fail('VALIDATION', 'Acceso asignado pero no se creó el perfil de rep / Membership granted but rep profile not created')
  }

  return ok({ userId, email: email_, invited })
}
