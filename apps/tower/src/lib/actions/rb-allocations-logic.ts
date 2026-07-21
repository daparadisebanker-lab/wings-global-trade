// src/lib/actions/rb-allocations-logic.ts
// Pure, dependency-free logic for the RB slot-allocation status machine
// (Represented-Brands Wave 3, ALLOCATION archetype — root CLAUDE.md §5-bis).
// Split out of the server action for the same reason as represented-brands-logic.ts:
// a 'use server' file may only export async functions, and the legal-transition
// rule is exactly what a reviewer needs covered by tests — it touches no Supabase.
//
// This is the TS mirror of the DB guard trigger installed in
// supabase/migrations/20260721140000_tower_36_rb_alloc_status.sql. The DB trigger
// is the real gate (clients can never bypass it); this module gives the server
// action a clean STAGE_INVALID error and lets the UI hide impossible flips.

// ── Allocation status (the shipped 4-state enum from rb_wave1) ────────────────
export const RB_ALLOCATION_STATUSES = ['RESERVED', 'CONFIRMED', 'LOADED', 'RELEASED'] as const
export type RbAllocationStatus = (typeof RB_ALLOCATION_STATUSES)[number]

export function isRbAllocationStatus(v: string): v is RbAllocationStatus {
  return (RB_ALLOCATION_STATUSES as readonly string[]).includes(v)
}

// The forward commitment line: a reservation is confirmed, a confirmed slot is
// loaded into the container, a loaded slot is released once shipped/settled.
const LINE: RbAllocationStatus[] = ['RESERVED', 'CONFIRMED', 'LOADED', 'RELEASED']

// Legal flips, byte-for-byte the DB guard's allow-list:
//   RESERVED  → CONFIRMED   (a reservation is committed)
//   CONFIRMED → LOADED      (a committed slot is stuffed)
//   LOADED    → RELEASED    (a loaded slot is closed out)
//   RESERVED  → RELEASED    (expiry/cancel — the job path + rep cancel)
// Everything else — no-ops, reversals, skips, and any move out of RELEASED —
// is rejected. RELEASED is terminal.
const LEGAL: Record<RbAllocationStatus, ReadonlyArray<RbAllocationStatus>> = {
  RESERVED: ['CONFIRMED', 'RELEASED'],
  CONFIRMED: ['LOADED'],
  LOADED: ['RELEASED'],
  RELEASED: [],
}

/**
 * Is a slot-allocation status flip legal? Forward-only along the commitment line
 * plus the RESERVED→RELEASED expiry/cancel shortcut. No-ops are rejected so the
 * action never writes an empty audit row, and RELEASED is terminal.
 */
export function canTransitionAllocationStatus(
  from: RbAllocationStatus,
  to: RbAllocationStatus,
): boolean {
  if (from === to) return false
  return LEGAL[from].includes(to)
}

/** The status flips offered in the UI for an allocation currently at `from`. */
export function nextAllocationStatuses(from: RbAllocationStatus): RbAllocationStatus[] {
  return RB_ALLOCATION_STATUSES.filter((s) => canTransitionAllocationStatus(from, s))
}

// Keep LINE referenced so the ordering intent is documented and lint-clean even
// though the allow-list above is the authoritative source.
export const RB_ALLOCATION_LINE: ReadonlyArray<RbAllocationStatus> = LINE
