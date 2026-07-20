// src/lib/rbac.ts
// PRESENTATION-ONLY module visibility. This does NOT enforce permissions — RLS is
// the permission system (CLAUDE.md Directive 1). It only decides which NavRail
// items to render so a user isn't shown a module with nothing behind it. Even if
// a module were shown, RLS returns no rows; even if hidden, the route still
// exists. The two must never drift into being the actual gate.
import type { ModuleId } from './nav'

/**
 * Lane roles — MUST match the `tower.lane_memberships.role` enum exactly
 * (uppercase). Group admin is NOT a lane role: it is `profiles.is_group_admin`,
 * threaded separately into `visibleModules`.
 */
export type Role = 'LANE_DIRECTOR' | 'CATALOG_EDITOR' | 'TRADE_OPS' | 'SALES' | 'VIEWER'

const ALL_MODULES: ModuleId[] = ['catalog', 'pipeline', 'containers', 'costing', 'marcas', 'signals', 'intelligence', 'admin']

// 'marcas' (Represented-Brands console) visibility is driven by rb_memberships at
// the DB/RLS layer, not lane roles — the module is shown to lane staff who also
// hold a brand membership; group admins always see it (visibleModules). Shown to
// LANE_DIRECTOR here so brand-managing staff reach it; RLS returns only their brands.
const ROLE_MODULES: Record<Role, ModuleId[]> = {
  LANE_DIRECTOR: ['catalog', 'pipeline', 'containers', 'costing', 'marcas', 'signals', 'intelligence'],
  CATALOG_EDITOR: ['catalog', 'signals'],
  TRADE_OPS: ['containers', 'costing', 'catalog', 'signals'],
  SALES: ['pipeline', 'signals'],
  VIEWER: ['signals'],
}

/**
 * Union of modules visible across a user's lane roles. Group admins see every
 * module (including `admin`). A user with no roles and no admin flag sees
 * nothing — which is correct: RLS would return no rows anyway.
 */
export function visibleModules(roles: Role[], isGroupAdmin = false): Set<ModuleId> {
  if (isGroupAdmin) return new Set<ModuleId>(ALL_MODULES)
  const out = new Set<ModuleId>()
  for (const role of roles) {
    for (const m of ROLE_MODULES[role] ?? []) out.add(m)
  }
  return out
}
