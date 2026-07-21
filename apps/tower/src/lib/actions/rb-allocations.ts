'use server'

// src/lib/actions/rb-allocations.ts
// Represented-Brands slot-allocation status machine — the TOWER write-side over
// the shipped rb_wave1 rb_slot_allocations table (RB Console Wave 3, ALLOCATION
// archetype, root CLAUDE.md §5-bis).
//
// Mutation law: auth → Zod → RLS-scoped query. No role branching — the RLS
// UPDATE policy (rb_alloc_upd, has_rb_role BRAND_MANAGER/BRAND_OPS resolved
// through rb_containers), the status column privilege, and the BEFORE UPDATE
// guard trigger (all in tower_36) are the real gate. The TS transition check
// here only turns an about-to-be-rejected flip into a clean STAGE_INVALID.
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { fail, ok, type ActionResult } from './result'
import {
  canTransitionAllocationStatus,
  RB_ALLOCATION_STATUSES,
  type RbAllocationStatus,
} from './rb-allocations-logic'

const uuidSchema = z.string().uuid()

const advanceSchema = z.object({
  allocationId: uuidSchema,
  to: z.enum(RB_ALLOCATION_STATUSES),
})
export type AdvanceAllocationInput = z.input<typeof advanceSchema>

export interface RbAllocationRow {
  id: string
  rbContainerId: string
  slots: number
  quantityUnits: number
  status: RbAllocationStatus
}

interface RawAllocationRow {
  id: string
  rb_container_id: string
  slots: number
  quantity_units: number
  status: string
}
const ALLOCATION_COLS = 'id,rb_container_id,slots,quantity_units,status'
function mapAllocation(r: RawAllocationRow): RbAllocationRow {
  return {
    id: r.id,
    rbContainerId: r.rb_container_id,
    slots: r.slots,
    quantityUnits: r.quantity_units,
    status: r.status as RbAllocationStatus,
  }
}

async function requireUser() {
  const supabase = await createServerSupabase()
  if (!supabase) return { ok: false, error: fail('UNAUTHORIZED', 'Auth no configurado / Auth not configured') } as const
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: fail('UNAUTHORIZED', 'Sesión requerida / Session required') } as const
  return { ok: true, supabase: supabase.schema('tower'), user } as const
}

/**
 * Advance a slot allocation along the status machine
 * (RESERVED→CONFIRMED→LOADED→RELEASED, plus RESERVED→RELEASED to cancel). The
 * write goes through the caller's RLS client: brand tenancy (has_rb_role through
 * the container) and the legal-transition guard are enforced in Postgres. RLS
 * refusing the row surfaces as FORBIDDEN_LANE; an illegal flip as STAGE_INVALID.
 */
export async function advanceRbAllocationStatus(
  input: AdvanceAllocationInput,
): Promise<ActionResult<RbAllocationRow>> {
  const parsed = advanceSchema.safeParse(input)
  if (!parsed.success) return fail('VALIDATION', 'Datos inválidos / Invalid data')

  const auth = await requireUser()
  if (!auth.ok) return auth.error

  // Read current status under RLS — a brand a rep can't see returns nothing.
  const { data: current } = await auth.supabase
    .from('rb_slot_allocations')
    .select('status')
    .eq('id', parsed.data.allocationId)
    .maybeSingle()
  const cur = current as { status: RbAllocationStatus } | null
  if (!cur) return fail('FORBIDDEN_LANE', 'Asignación no encontrada / Allocation not found')

  if (!canTransitionAllocationStatus(cur.status, parsed.data.to)) {
    return fail('STAGE_INVALID', `Transición no permitida ${cur.status} → ${parsed.data.to}`)
  }

  // The RLS-scoped write. Column privilege limits this to `status`; the guard
  // trigger is the final arbiter (covers the check-then-write race too).
  const { data, error } = await auth.supabase
    .from('rb_slot_allocations')
    .update({ status: parsed.data.to })
    .eq('id', parsed.data.allocationId)
    .select(ALLOCATION_COLS)
    .maybeSingle()
  if (error) return fail('STAGE_INVALID', 'No se pudo cambiar el estado / Could not change status')
  if (!data) return fail('FORBIDDEN_LANE', 'Sin permiso sobre la asignación / Not permitted on this allocation')
  return ok(mapAllocation(data as unknown as RawAllocationRow))
}
