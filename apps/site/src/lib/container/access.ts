// src/lib/container/access.ts
// Server-only data layer for Contenedor Compartido. Service-role client, so
// RLS is bypassed — THIS FILE is where per-member scoping is enforced. Rules:
//   • The public preview never carries member financials.
//   • The workspace returns the caller's own member row in full, and every
//     other member only as an anonymizable strip entry (no cost, no payments).
//   • A lead additionally sees other members' slot_status (fill), never money.
// Never import this into a client component.

import { createServiceClient } from '@/lib/supabase/server'
import { newInviteToken, newMemberRef, newShortCode, signMemberToken } from '@/lib/container/identity'
import type {
  ContainerInviteRow,
  ContainerMemberRow,
  ContainerPreview,
  ContainerRow,
  InviteEventKind,
  MemberDocumentRow,
  MemberPaymentRow,
  MilestoneRow,
  SlotCounts,
} from '@/types/container'
import type { ContainerOfferSurface } from '@wings/mister'

/** POST target the container_offer card and Mister lane use to onboard a member. */
export const CONTAINER_JOIN_ENDPOINT = '/api/container/join'

// ---------------------------------------------------------------------------
// Slot accounting
// ---------------------------------------------------------------------------

export async function getSlotCounts(containerId: string, totalSlots: number): Promise<SlotCounts> {
  const supabase = createServiceClient()
  if (!supabase) return { committed: 0, reserved: 0, open: totalSlots, total: totalSlots }

  const { data, error } = await supabase.rpc('container_slot_counts', {
    p_container_id: containerId,
  })
  if (error || !data?.[0]) {
    return { committed: 0, reserved: 0, open: totalSlots, total: totalSlots }
  }
  const row = data[0] as { committed_slots: number; reserved_slots: number; total_taken: number }
  const committed = row.committed_slots ?? 0
  const reserved = row.reserved_slots ?? 0
  const open = Math.max(0, totalSlots - committed - reserved)
  return { committed, reserved, open, total: totalSlots }
}

function toPreview(c: ContainerRow, slots: SlotCounts): ContainerPreview {
  return {
    shortCode: c.short_code,
    mode: c.mode,
    status: c.status,
    routeOrigin: c.route_origin,
    routeDestination: c.route_destination,
    containerType: c.container_type,
    slotPriceUsd: Number(c.slot_price_usd),
    priceIncludes: c.price_includes ?? [],
    fillDeadline: c.fill_deadline,
    fallback: c.fallback,
    cbmPerSlot: Number(c.cbm_per_slot),
    overagePerCbmUsd: c.overage_per_cbm_usd == null ? null : Number(c.overage_per_cbm_usd),
    leadName: c.lead_name,
    slots,
  }
}

// ---------------------------------------------------------------------------
// Invite resolution (the /g/{token} entrypoint)
// ---------------------------------------------------------------------------

export type InviteResolution =
  | { ok: true; invite: ContainerInviteRow; container: ContainerRow; preview: ContainerPreview }
  | { ok: false; reason: 'not_found' | 'revoked' | 'expired' | 'closed' }

export async function resolveInvite(token: string): Promise<InviteResolution> {
  const supabase = createServiceClient()
  if (!supabase) return { ok: false, reason: 'not_found' }

  const { data: invite } = await supabase
    .from('container_invites')
    .select('*')
    .eq('token', token)
    .maybeSingle<ContainerInviteRow>()

  if (!invite) return { ok: false, reason: 'not_found' }
  if (invite.revoked_at) return { ok: false, reason: 'revoked' }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { ok: false, reason: 'expired' }
  }

  const { data: container } = await supabase
    .from('containers')
    .select('*')
    .eq('id', invite.container_id)
    .maybeSingle<ContainerRow>()

  if (!container) return { ok: false, reason: 'not_found' }
  // A group that has moved past filling no longer accepts invitees.
  if (!['filling', 'soft_deadline', 'draft'].includes(container.status)) {
    return { ok: false, reason: 'closed' }
  }

  const slots = await getSlotCounts(container.id, container.total_slots)
  return { ok: true, invite, container, preview: toPreview(container, slots) }
}

/** Attribution: log an invite funnel event. Best-effort; never throws. */
export async function recordInviteEvent(
  inviteId: string,
  event: InviteEventKind,
  opts: { userRef?: string; meta?: Record<string, unknown> } = {},
): Promise<void> {
  const supabase = createServiceClient()
  if (!supabase) return
  try {
    await supabase.from('invite_events').insert({
      invite_id: inviteId,
      event,
      user_ref: opts.userRef ?? null,
      meta: opts.meta ?? {},
    })
    if (event === 'account_created' || event === 'slot_reserved') {
      // A join counts against the invite's use budget.
      const { data } = await supabase
        .from('container_invites')
        .select('uses')
        .eq('id', inviteId)
        .maybeSingle<{ uses: number }>()
      if (data) {
        await supabase
          .from('container_invites')
          .update({ uses: data.uses + 1 })
          .eq('id', inviteId)
      }
    }
  } catch (err) {
    console.error('[container] recordInviteEvent failed', err)
  }
}

// ---------------------------------------------------------------------------
// Creation (used by the Mister creation flow; also seedable for testing)
// ---------------------------------------------------------------------------

export interface CreateContainerInput {
  routeOrigin: string
  routeDestination: string
  containerType?: string
  totalCbm: number
  totalSlots: number
  slotPriceUsd: number
  priceIncludes: string[]
  fillDeadline: string // ISO
  fallback?: ContainerRow['fallback']
  overagePerCbmUsd?: number | null
  leadRef: string
  leadName?: string
  leadCargo?: string
  shortCodeHint?: string
}

export interface CreatedContainer {
  container: ContainerRow
  invite: ContainerInviteRow
}

/**
 * Create a private-group container in `filling`, register the lead as its first
 * member, and mint the share invite. Returns the container + invite so Mister
 * can hand back the /g/{token} link and share script.
 */
export async function createContainer(input: CreateContainerInput): Promise<CreatedContainer> {
  const supabase = createServiceClient()
  if (!supabase) throw new Error('Supabase not configured — cannot create container')

  const cbmPerSlot = round2(input.totalCbm / input.totalSlots)

  const { data: container, error: cErr } = await supabase
    .from('containers')
    .insert({
      short_code: newShortCode(input.shortCodeHint),
      mode: 'private_group',
      status: 'filling',
      route_origin: input.routeOrigin,
      route_destination: input.routeDestination,
      container_type: input.containerType ?? '40HC',
      total_cbm: input.totalCbm,
      total_slots: input.totalSlots,
      cbm_per_slot: cbmPerSlot,
      slot_price_usd: input.slotPriceUsd,
      overage_per_cbm_usd: input.overagePerCbmUsd ?? null,
      price_includes: input.priceIncludes,
      fill_deadline: input.fillDeadline,
      fallback: input.fallback ?? 'extend_once',
      lead_ref: input.leadRef,
      lead_name: input.leadName ?? null,
    })
    .select('*')
    .single<ContainerRow>()

  if (cErr || !container) throw new Error(`Container insert failed: ${cErr?.message}`)

  // The lead is a member with role 'lead', holding one slot by default.
  await supabase.from('container_members').insert({
    container_id: container.id,
    member_ref: input.leadRef,
    display_name: input.leadName ?? null,
    role: 'lead',
    slot_status: 'reserved',
    slots_claimed: 1,
    cargo_description: input.leadCargo ?? null,
  })

  const { data: invite, error: iErr } = await supabase
    .from('container_invites')
    .insert({
      container_id: container.id,
      created_by_ref: input.leadRef,
      token: newInviteToken(),
    })
    .select('*')
    .single<ContainerInviteRow>()

  if (iErr || !invite) throw new Error(`Invite insert failed: ${iErr?.message}`)

  return { container, invite }
}

// ---------------------------------------------------------------------------
// Workspace (scoped read for /contenedor/{id})
// ---------------------------------------------------------------------------

/** A member as seen by others — no financials, name optionally hidden. */
export interface MemberStripEntry {
  id: string
  displayName: string | null
  role: ContainerMemberRow['role']
  slotStatus: ContainerMemberRow['slot_status']
  slotsClaimed: number
  isSelf: boolean
}

export interface Workspace {
  container: ContainerRow
  slots: SlotCounts
  me: ContainerMemberRow
  isLead: boolean
  members: MemberStripEntry[]
  milestones: MilestoneRow[]
  myPayments: MemberPaymentRow[]
  myDocuments: MemberDocumentRow[]
}

/**
 * Load the workspace for `memberRef` within `containerId`. Returns null when
 * the caller is not a member of that container (the scoping gate). Other
 * members are reduced to strip entries; their money never leaves this function.
 */
export async function getWorkspace(
  containerId: string,
  memberRef: string,
): Promise<Workspace | null> {
  const supabase = createServiceClient()
  if (!supabase) return null

  const { data: container } = await supabase
    .from('containers')
    .select('*')
    .eq('id', containerId)
    .maybeSingle<ContainerRow>()
  if (!container) return null

  const { data: members } = await supabase
    .from('container_members')
    .select('*')
    .eq('container_id', containerId)
    .returns<ContainerMemberRow[]>()

  const roster = members ?? []
  const me = roster.find((m) => m.member_ref === memberRef)
  if (!me) return null // not a member → no access

  const isLead = me.role === 'lead'
  const privateMode = container.mode === 'private_group'

  const strip: MemberStripEntry[] = roster
    .filter((m) => m.slot_status !== 'released')
    .map((m) => {
      const isSelf = m.id === me.id
      // Private group: identities visible. Public: only opted-in identities,
      // and the lead can always see fill status.
      const nameVisible = isSelf || privateMode || m.visibility_opt_in
      return {
        id: m.id,
        displayName: nameVisible ? m.display_name : null,
        role: m.role,
        slotStatus: m.slot_status,
        slotsClaimed: m.slots_claimed,
        isSelf,
      }
    })

  const slots = await getSlotCounts(containerId, container.total_slots)

  const { data: milestones } = await supabase
    .from('container_milestones')
    .select('*')
    .eq('container_id', containerId)
    .order('occurred_at', { ascending: true })
    .returns<MilestoneRow[]>()

  const { data: myPayments } = await supabase
    .from('member_payments')
    .select('*')
    .eq('member_id', me.id)
    .order('created_at', { ascending: true })
    .returns<MemberPaymentRow[]>()

  const { data: myDocuments } = await supabase
    .from('member_documents')
    .select('*')
    .eq('member_id', me.id)
    .order('created_at', { ascending: true })
    .returns<MemberDocumentRow[]>()

  return {
    container,
    slots,
    me,
    isLead,
    members: strip,
    milestones: milestones ?? [],
    myPayments: myPayments ?? [],
    myDocuments: myDocuments ?? [],
  }
}

// ---------------------------------------------------------------------------
// Mister lane: resolve an existing container to an offer card (READ-ONLY), and
// the explicit member onboarding behind the card's CTA (WRITE).
// ---------------------------------------------------------------------------

/**
 * Resolve a container by short_code to the offer-card payload for Mister's
 * `container_offer` surface. Read-only — no rows created here. Returns null
 * for unknown containers or those no longer accepting members.
 */
export async function getContainerOfferByShortCode(
  shortCode: string,
): Promise<ContainerOfferSurface | null> {
  const supabase = createServiceClient()
  if (!supabase) return null

  const { data: c } = await supabase
    .from('containers')
    .select('*')
    .eq('short_code', shortCode)
    .maybeSingle<ContainerRow>()

  if (!c) return null
  if (!['filling', 'soft_deadline', 'draft'].includes(c.status)) return null

  const slots = await getSlotCounts(c.id, c.total_slots)
  return {
    shortCode: c.short_code,
    routeOrigin: c.route_origin,
    routeDestination: c.route_destination,
    containerType: c.container_type,
    slotPriceUsd: Number(c.slot_price_usd),
    priceIncludes: c.price_includes ?? [],
    fillDeadline: c.fill_deadline,
    leadName: c.lead_name,
    slots,
    joinEndpoint: CONTAINER_JOIN_ENDPOINT,
  }
}

export type JoinResult =
  | { ok: true; workspaceUrl: string; memberToken: string; alreadyMember: boolean }
  | { ok: false; reason: 'not_found' | 'closed' | 'error' }

/**
 * Onboard a member into a container by short_code. Explicit action (behind the
 * offer card CTA), never a stream side-effect. Sending the wa.me message IS the
 * WhatsApp opt-in, so whatsapp_opted_in_at is set here. Idempotent when the
 * caller passes back a memberRef it already holds.
 */
export async function joinContainerByShortCode(input: {
  shortCode: string
  displayName?: string | null
  phone?: string | null
  memberRef?: string | null
}): Promise<JoinResult> {
  const supabase = createServiceClient()
  if (!supabase) return { ok: false, reason: 'error' }

  const { data: c } = await supabase
    .from('containers')
    .select('*')
    .eq('short_code', input.shortCode)
    .maybeSingle<ContainerRow>()
  if (!c) return { ok: false, reason: 'not_found' }
  if (!['filling', 'soft_deadline'].includes(c.status)) return { ok: false, reason: 'closed' }

  // Reuse an existing membership when the caller already has an identity.
  if (input.memberRef) {
    const { data: existing } = await supabase
      .from('container_members')
      .select('member_ref')
      .eq('container_id', c.id)
      .eq('member_ref', input.memberRef)
      .maybeSingle<{ member_ref: string }>()
    if (existing) {
      return {
        ok: true,
        workspaceUrl: `/contenedor/${c.id}?t=${signMemberToken(input.memberRef, c.id)}`,
        memberToken: signMemberToken(input.memberRef, c.id),
        alreadyMember: true,
      }
    }
  }

  const memberRef = input.memberRef ?? newMemberRef()
  const { error } = await supabase.from('container_members').insert({
    container_id: c.id,
    member_ref: memberRef,
    display_name: input.displayName ?? null,
    phone: input.phone ?? null,
    role: 'member',
    slot_status: 'joined',
    slots_claimed: 1,
    whatsapp_opted_in_at: new Date().toISOString(),
  })
  if (error) {
    // Unique(container_id, member_ref) race → treat as already joined.
    if (error.code === '23505') {
      return {
        ok: true,
        workspaceUrl: `/contenedor/${c.id}?t=${signMemberToken(memberRef, c.id)}`,
        memberToken: signMemberToken(memberRef, c.id),
        alreadyMember: true,
      }
    }
    console.error('[container] joinContainerByShortCode insert failed', error)
    return { ok: false, reason: 'error' }
  }

  // Attribution: best-effort account_created against the lead's invite, if any.
  const { data: invite } = await supabase
    .from('container_invites')
    .select('id')
    .eq('container_id', c.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>()
  if (invite) {
    await recordInviteEvent(invite.id, 'account_created', { userRef: memberRef })
  }

  const token = signMemberToken(memberRef, c.id)
  return {
    ok: true,
    workspaceUrl: `/contenedor/${c.id}?t=${token}`,
    memberToken: token,
    alreadyMember: false,
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
