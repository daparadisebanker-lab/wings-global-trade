// src/lib/rbac.ts
// PRESENTATION-ONLY module visibility. This does NOT enforce permissions — RLS is
// the permission system (CLAUDE.md Directive 1). It only decides which NavRail
// items to render so a user isn't shown a module with nothing behind it. Even if
// a module were shown, RLS returns no rows; even if hidden, the route still
// exists. The two must never drift into being the actual gate.
import { MODULES, type ModuleId } from './nav'

/**
 * Lane roles — MUST match the `tower.lane_memberships.role` enum exactly
 * (uppercase). Group admin is NOT a lane role: it is `profiles.is_group_admin`,
 * threaded separately into `visibleModules`.
 */
export type Role = 'LANE_DIRECTOR' | 'CATALOG_EDITOR' | 'TRADE_OPS' | 'SALES' | 'VIEWER'

// Group admins see every real module. Derived from the nav MODULES list — the
// single source of truth — so a module added to the rail can NEVER silently go
// missing here again (the drift that once hid Cotizaciones/Clientes/Documentos
// from the rail while the ⌘K palette still listed them).
const ALL_MODULES: ModuleId[] = MODULES.map((m) => m.id)

const ROLE_MODULES: Record<Role, ModuleId[]> = {
  LANE_DIRECTOR: ['catalog', 'pipeline', 'quotations', 'clients', 'containers', 'costing', 'signals', 'intelligence', 'documents'],
  CATALOG_EDITOR: ['catalog', 'documents', 'signals'],
  TRADE_OPS: ['containers', 'costing', 'catalog', 'documents', 'signals'],
  SALES: ['pipeline', 'quotations', 'clients', 'signals'],
  VIEWER: ['signals'],
}

// A represented-brand rep's modules — driven by rb_memberships, NOT lane roles
// (a pure rep has no lane role). They manage their brand (marcas), browse the
// org-wide published catalog (catalog — read-broad, edit stays brand-scoped via
// RLS + capabilities), and see signals. marcas is otherwise group-admin-only.
const RB_REP_MODULES: ModuleId[] = ['marcas', 'catalog', 'signals']

/**
 * Union of modules visible across a user's lane roles. Group admins see every
 * module (including `admin`). A user with no roles and no admin flag sees
 * nothing — which is correct: RLS would return no rows anyway.
 */
export function visibleModules(
  roles: Role[],
  isGroupAdmin = false,
  hasRbMembership = false,
): Set<ModuleId> {
  if (isGroupAdmin) return new Set<ModuleId>(ALL_MODULES)
  const out = new Set<ModuleId>()
  for (const role of roles) {
    for (const m of ROLE_MODULES[role] ?? []) out.add(m)
  }
  if (hasRbMembership) for (const m of RB_REP_MODULES) out.add(m)
  return out
}
