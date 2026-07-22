// src/lib/nav.ts
// The eight TOWER modules (COMPONENT_TREE.md). NavRail + CommandPalette read this
// list; routes live under app/(shell)/{module}. Modules resolve into three IA
// groups so the rail reads as sections, not a flat list.
import type { Localized } from './i18n'
import { TOOLS } from '@/shell/navigation/registry'

export type ModuleId =
  | 'catalog'
  | 'pipeline'
  | 'quotations'
  | 'clients'
  | 'containers'
  | 'costing'
  | 'marcas'
  | 'signals'
  | 'intelligence'
  | 'documents'
  | 'admin'

/** IA groups — the rail renders these as labelled sections (in this order). */
export type NavGroupId = 'operate' | 'intel' | 'system'
export interface NavGroup {
  id: NavGroupId
  label: Localized
}
export const NAV_GROUPS: NavGroup[] = [
  { id: 'operate', label: { es: 'Operación', en: 'Operations' } },
  { id: 'intel', label: { es: 'Marca e inteligencia', en: 'Brand & Intelligence' } },
  { id: 'system', label: { es: 'Sistema', en: 'System' } },
]

/** Icon key — resolved to an SVG in nav-icons.tsx (kept out of this data file). */
export type NavIconId = ModuleId

export interface NavModule {
  id: ModuleId
  href: string
  label: Localized
  /** Short tabular-mono glyph — demoted to a secondary detail beside the icon. */
  tag: string
  group: NavGroupId
  icon: NavIconId
}

// The canonical tool list now lives in the shell navigation registry — the one
// source of truth (TOWER-REDESIGN §5, "one registry" DoD gate). Re-exported here
// so every existing importer of `MODULES` (NavRail, CommandPalette, the
// Breadcrumb) keeps working unchanged. `TowerTool extends NavModule`, so this is
// type-preserving and additive.
export const MODULES: NavModule[] = TOOLS
