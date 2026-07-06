// src/lib/rbac.ts
// PRESENTATION-ONLY module visibility. This does NOT enforce permissions — RLS is
// the permission system (CLAUDE.md Directive 1). It only decides which NavRail
// items to render so a user isn't shown a module with nothing behind it. Even if
// a module were shown, RLS returns no rows; even if hidden, the route still
// exists. The two must never drift into being the actual gate.
import type { ModuleId } from './nav'

/** Roles per PRODUCT_BRIEF role table. */
export type Role =
  | 'group_admin'
  | 'lane_director'
  | 'catalog_editor'
  | 'trade_ops'
  | 'sales'
  | 'viewer'

const ROLE_MODULES: Record<Role, ModuleId[]> = {
  group_admin: ['catalog', 'pipeline', 'containers', 'signals', 'intelligence', 'admin'],
  lane_director: ['catalog', 'pipeline', 'containers', 'signals', 'intelligence'],
  catalog_editor: ['catalog', 'signals'],
  trade_ops: ['containers', 'catalog', 'signals'],
  sales: ['pipeline', 'signals'],
  viewer: ['signals'],
}

/**
 * Union of modules visible across a user's roles. With NO memberships (fresh
 * scaffold, empty tables) every module is shown so the six placeholders are
 * reachable — the demonstrable scaffold state. Real role data narrows this.
 */
export function visibleModules(roles: Role[]): Set<ModuleId> {
  if (roles.length === 0) {
    return new Set<ModuleId>(['catalog', 'pipeline', 'containers', 'signals', 'intelligence', 'admin'])
  }
  const out = new Set<ModuleId>()
  for (const role of roles) {
    for (const m of ROLE_MODULES[role] ?? []) out.add(m)
  }
  return out
}
