// src/lib/nav.ts
// The eight TOWER modules (COMPONENT_TREE.md). NavRail + CommandPalette read this
// list; routes live under app/(shell)/{module}. Modules resolve into three IA
// groups so the rail reads as sections, not a flat list.
import type { Localized } from './i18n'

export type ModuleId =
  | 'catalog'
  | 'pipeline'
  | 'containers'
  | 'costing'
  | 'marcas'
  | 'signals'
  | 'intelligence'
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

export const MODULES: NavModule[] = [
  { id: 'catalog', href: '/catalog', label: { es: 'Catálogo', en: 'Catalog' }, tag: 'CAT', group: 'operate', icon: 'catalog' },
  { id: 'pipeline', href: '/pipeline', label: { es: 'Pipeline', en: 'Pipeline' }, tag: 'PIP', group: 'operate', icon: 'pipeline' },
  { id: 'containers', href: '/containers', label: { es: 'Contenedores', en: 'Containers' }, tag: 'CTN', group: 'operate', icon: 'containers' },
  { id: 'costing', href: '/costing', label: { es: 'Costeo', en: 'Costing' }, tag: 'CST', group: 'operate', icon: 'costing' },
  { id: 'marcas', href: '/marcas', label: { es: 'Marcas', en: 'Brands' }, tag: 'MRC', group: 'intel', icon: 'marcas' },
  { id: 'signals', href: '/signals', label: { es: 'Señales', en: 'Signals' }, tag: 'SIG', group: 'intel', icon: 'signals' },
  { id: 'intelligence', href: '/intelligence', label: { es: 'Inteligencia', en: 'Intelligence' }, tag: 'INT', group: 'intel', icon: 'intelligence' },
  { id: 'admin', href: '/admin', label: { es: 'Administración', en: 'Admin' }, tag: 'ADM', group: 'system', icon: 'admin' },
]
