// src/lib/actions/rb-catalog-logic.ts
// Pure, dependency-free logic for the RB product shelf (RB Console Wave 2, Ch 02).
// Split out of rb-catalog.ts for the same reason as catalog-logic.ts: a
// 'use server' file may only export async functions, and the capability
// derivation belongs in a Supabase-free, unit-tested module.
//
// The DRAFT → IN_REVIEW → PUBLISHED → RETIRED machine, the version-snapshot math,
// and the publish-completeness gate are archetype-agnostic — RB reuses them
// verbatim from catalog-logic.ts (no fork). Only the capability derivation
// differs: it is keyed on rb_memberships roles (BRAND_MANAGER / BRAND_OPS /
// BRAND_VIEWER) + the brand kit gate, not lane roles.
import type { ProductCapabilities } from './catalog-logic'
import type { RbRole } from './represented-brands-logic'

/**
 * Derive UI capabilities for the RB product editor from the caller's rb roles +
 * group-admin flag + the brand's kit gate. Returns the SAME `ProductCapabilities`
 * shape the lane catalog uses, so PublishBar and the shared status guards consume
 * it unchanged (reuse via props, never a fork).
 *
 * PRESENTATION ONLY — RLS (has_rb_role) re-checks every mutation server-side. This
 * exists so the editor HIDES (not disable-but-show) actions the caller's own
 * memberships prove they lack. `canPublish` additionally stays false until the
 * brand kit is complete (SPEC §3.1c / §3.2 kitComplete wiring gate — publish
 * buttons stay hidden, not merely disabled, until the kit + spec are complete).
 *
 * Role mapping: BRAND_MANAGER is the publish-authority (lane-director analogue);
 * BRAND_OPS is the editor (catalog-editor analogue); BRAND_VIEWER is read-only.
 */
export function computeRbProductCapabilities(
  roles: RbRole[],
  isGroupAdmin: boolean,
  kitComplete: boolean,
): ProductCapabilities {
  if (!isGroupAdmin && roles.length === 0) {
    return {
      canCreate: false,
      canEdit: false,
      canSubmitForReview: false,
      canPublish: false,
      canRetire: false,
      canRollback: false,
    }
  }

  const isManager = isGroupAdmin || roles.includes('BRAND_MANAGER')
  const isEditor = isManager || roles.includes('BRAND_OPS')

  return {
    canCreate: isEditor,
    canEdit: isEditor,
    canSubmitForReview: isEditor,
    canPublish: isManager && kitComplete,
    canRetire: isManager,
    canRollback: isManager,
  }
}
