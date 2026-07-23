// src/shell/navigation/registry.ts
// THE canonical navigation source of truth (TOWER-REDESIGN §5). One array feeds
// the nav rail, the ⌘K palette, the breadcrumb — and, next, the Dock and the
// WINGS Control Center. Adding a tool here (plus its icon in nav-icons) surfaces
// it everywhere with no other edits.
//
// Adapted from spec §5 per guardrail §9 (codebase conventions win): `label` is
// `Localized` (TOWER is ES-first bilingual), `icon` stays a KEY resolved by
// nav-icons.tsx (so this module imports no React and stays server-safe), and the
// shipped 3-group IA (`group`) is kept — `section` (core|utility) is derived from
// it for Dock/palette consumers. Type-only imports from lib/nav keep this the one
// runtime source (lib/nav re-exports MODULES from here; no runtime cycle).
import type { Localized } from '@/lib/i18n'
import type { NavGroupId, NavIconId, NavModule } from '@/lib/nav'

/** A navigable tool. Superset of the legacy NavModule (so `MODULES` stays typed)
 *  plus the palette-search + Dock fields from spec §5. */
export interface TowerTool extends NavModule {
  /** Palette search terms, ES + EN. */
  keywords: string[]
  /** Derived from `group`: operate|intel → core, system → utility. */
  section: 'core' | 'utility'
  /** Dock / rail ordering. */
  order: number
}

const core = 'core' as const
const utility = 'utility' as const

/** The modules — rail + palette + (soon) Dock. */
export const TOOLS: TowerTool[] = [
  { id: 'catalog', href: '/catalog', label: { es: 'Catálogo', en: 'Catalog' }, tag: 'CAT', group: 'operate', icon: 'catalog', section: core, order: 0, keywords: ['catálogo', 'catalog', 'productos', 'products', 'pim', 'sku', 'ficha'] },
  { id: 'pipeline', href: '/pipeline', label: { es: 'Pipeline', en: 'Pipeline' }, tag: 'PIP', group: 'operate', icon: 'pipeline', section: core, order: 1, keywords: ['pipeline', 'rfq', 'cotización', 'oportunidades', 'crm', 'embudo', 'deals'] },
  { id: 'quotations', href: '/quotations', label: { es: 'Cotizaciones', en: 'Quotations' }, tag: 'COT', group: 'operate', icon: 'quotations', section: core, order: 2, keywords: ['cotizaciones', 'quotations', 'proforma', 'quote', 'factura'] },
  { id: 'clients', href: '/clients', label: { es: 'Clientes', en: 'Clients' }, tag: 'CLI', group: 'operate', icon: 'clients', section: core, order: 3, keywords: ['clientes', 'clients', 'cuentas', 'accounts', 'compradores', 'buyers'] },
  { id: 'containers', href: '/containers', label: { es: 'Contenedores', en: 'Containers' }, tag: 'CTN', group: 'operate', icon: 'containers', section: core, order: 4, keywords: ['contenedores', 'containers', 'consolidación', 'cbm', 'carga', 'shipments'] },
  { id: 'costing', href: '/costing', label: { es: 'Costeo', en: 'Costing' }, tag: 'CST', group: 'operate', icon: 'costing', section: core, order: 5, keywords: ['costeo', 'costing', 'sunat', 'landed', 'arancel', 'margen', 'import cost'] },
  { id: 'marcas', href: '/marcas', label: { es: 'Marcas', en: 'Brands' }, tag: 'MRC', group: 'intel', icon: 'marcas', section: core, order: 6, keywords: ['marcas', 'brands', 'representadas', 'represented', 'rb', 'allocation', 'slots'] },
  { id: 'signals', href: '/signals', label: { es: 'Señales', en: 'Signals' }, tag: 'SIG', group: 'intel', icon: 'signals', section: core, order: 7, keywords: ['señales', 'signals', 'analítica', 'analytics', 'métricas', 'metrics', 'dashboard'] },
  { id: 'intelligence', href: '/intelligence', label: { es: 'Mister', en: 'Mister' }, tag: 'INT', group: 'intel', icon: 'intelligence', section: core, order: 8, keywords: ['mister', 'inteligencia', 'intelligence', 'ia', 'ai', 'copiloto', 'copilot', 'cotización', 'contenedor', 'triage', 'spec extract', 'revisión'] },
  { id: 'documents', href: '/documents', label: { es: 'Documentos', en: 'Documents' }, tag: 'DOC', group: 'intel', icon: 'documents', section: core, order: 9, keywords: ['documentos', 'documents', 'drive', 'archivos', 'files', 'certificados'] },
  { id: 'admin', href: '/admin', label: { es: 'Administración', en: 'Admin' }, tag: 'ADM', group: 'system', icon: 'admin', section: utility, order: 10, keywords: ['administración', 'admin', 'usuarios', 'users', 'lanes', 'auditoría', 'webhooks'] },
]

/** Palette-only destinations (NOT in the rail today — behavior preserved). */
export interface PaletteDestination {
  id: string
  href: string
  label: Localized
  tag: string
  keywords: string[]
  /** Group-admin gate. CONSUMED by the palette: `SELF_DESTINATIONS`/
   *  `EVERYONE_ACTIONS` are rendered to everyone through a `!adminOnly ||
   *  isGroupAdmin` filter, so this flag is what would hide an admin-only entry
   *  living in those everyone-lists. On the `ADMIN_*` lists (rendered only inside
   *  the `isGroupAdmin` block) it is redundant-but-defensive — kept so those rows
   *  stay gated if ever moved out of that block. */
  adminOnly?: boolean
}

/** Everyone-facing self destinations (shown in the palette's Módulos group). */
export const SELF_DESTINATIONS: PaletteDestination[] = [
  { id: 'perfil', href: '/perfil', label: { es: 'Mi perfil', en: 'My profile' }, tag: 'PRF', keywords: ['perfil', 'profile', 'cuenta', 'account', 'firma', 'signature'] },
]

/** Admin ⌘K destinations (group-admin only). */
export const ADMIN_DESTINATIONS: PaletteDestination[] = [
  { id: 'admin-home', href: '/admin', label: { es: 'Administración', en: 'Admin home' }, tag: 'ADM', adminOnly: true, keywords: ['admin', 'administración'] },
  { id: 'admin-users', href: '/admin/users', label: { es: 'Usuarios y accesos', en: 'Users & access' }, tag: 'USR', adminOnly: true, keywords: ['usuarios', 'users', 'accesos', 'access', 'membership'] },
  { id: 'admin-lanes', href: '/admin/lanes', label: { es: 'Registro de lanes', en: 'Lane registry' }, tag: 'LNE', adminOnly: true, keywords: ['lanes', 'registro', 'registry'] },
  { id: 'admin-brands', href: '/admin/brands', label: { es: 'Marcas', en: 'Brands' }, tag: 'BRD', adminOnly: true, keywords: ['marcas', 'brands', 'tenant'] },
  { id: 'admin-audit', href: '/admin/audit', label: { es: 'Auditoría', en: 'Audit' }, tag: 'AUD', adminOnly: true, keywords: ['auditoría', 'audit', 'log'] },
  { id: 'admin-webhooks', href: '/admin/webhooks', label: { es: 'Webhooks', en: 'Webhooks' }, tag: 'WHK', adminOnly: true, keywords: ['webhooks', 'n8n', 'revalidate'] },
]

/** A ⌘K run-action. `href` opens the surface where the action completes. */
export interface PaletteAction {
  id: string
  label: Localized
  href?: string
  keywords: string[]
  /** Group-admin gate — same semantics as `PaletteDestination.adminOnly`
   *  (consumed by the everyone-list filter; defensive on the `ADMIN_*` lists). */
  adminOnly?: boolean
}

/** Everyone-facing actions (P6 — now live). Each opens the surface that hosts
 *  its create flow: the same "land on the module index where the flow begins"
 *  semantics as ADMIN_ACTIONS — the create forms live behind parametric routes
 *  (`/catalog/[id]`, the inline Nuevo-RFQ form on the Pipeline board) that can't
 *  be a static href. No `disabled` entry remains → the palette has no dead
 *  affordance anywhere. */
export const EVERYONE_ACTIONS: PaletteAction[] = [
  { id: 'act-publish', href: '/catalog', label: { es: 'Publicar producto…', en: 'Publish product…' }, keywords: ['publicar', 'publish', 'producto', 'product'] },
  { id: 'act-new-rfq', href: '/pipeline', label: { es: 'Nuevo RFQ…', en: 'New RFQ…' }, keywords: ['nuevo', 'new', 'rfq', 'cotización'] },
]

/** Client-only palette actions — they run a shell callback (theme, dock) rather
 *  than navigate, so they carry no href. The palette maps `id → threaded handler`
 *  and renders an item only when its handler is present (no dead affordance); the
 *  registry itself stays React-free (no callbacks live here). */
export type LocalActionId = 'toggle-theme' | 'toggle-dock'
export interface LocalAction {
  id: LocalActionId
  label: Localized
  keywords: string[]
}
export const LOCAL_ACTIONS: LocalAction[] = [
  { id: 'toggle-theme', label: { es: 'Cambiar tema (claro / oscuro)', en: 'Toggle theme (light / dark)' }, keywords: ['tema', 'theme', 'oscuro', 'claro', 'dark', 'light', 'modo'] },
  { id: 'toggle-dock', label: { es: 'Fijar u ocultar el Dock', en: 'Pin or hide the Dock' }, keywords: ['dock', 'colapsar', 'collapse', 'ocultar', 'pin', 'fijar'] },
]

/** Admin run-actions (group-admin only) — each opens its completion surface. */
export const ADMIN_ACTIONS: PaletteAction[] = [
  { id: 'act-invite-user', href: '/admin/users', label: { es: 'Invitar usuario…', en: 'Invite user…' }, adminOnly: true, keywords: ['invitar', 'invite', 'usuario', 'user'] },
  { id: 'act-invite-rep', href: '/admin/users', label: { es: 'Invitar rep…', en: 'Invite rep…' }, adminOnly: true, keywords: ['invitar', 'invite', 'rep'] },
  { id: 'act-register-lane', href: '/admin/lanes', label: { es: 'Registrar lane…', en: 'Register lane…' }, adminOnly: true, keywords: ['registrar', 'register', 'lane'] },
  { id: 'act-new-brand', href: '/admin/brands', label: { es: 'Nueva marca…', en: 'New brand…' }, adminOnly: true, keywords: ['nueva', 'new', 'marca', 'brand'] },
]

/** Pure active-tool resolution (segment-aware, no framework deps) — shared by
 *  the `useActiveTool` hook and any server-side caller. `startsWith(href)` alone
 *  is a future prefix-collision trap, so match the full segment. */
export function resolveActiveTool(pathname: string): TowerTool | null {
  return TOOLS.find((t) => pathname === t.href || pathname.startsWith(t.href + '/')) ?? null
}

// Re-export the group ids for consumers that build sections from the registry.
export type { NavGroupId, NavIconId }
