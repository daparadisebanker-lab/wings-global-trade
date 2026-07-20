// src/lib/nav.ts
// The six TOWER modules (COMPONENT_TREE.md). NavRail and the CommandPalette read
// this list; routes live under app/(shell)/{module}.
import type { Localized } from './i18n'

export type ModuleId =
  | 'catalog'
  | 'pipeline'
  | 'containers'
  | 'costing'
  | 'signals'
  | 'intelligence'
  | 'admin'

export interface NavModule {
  id: ModuleId
  href: string
  label: Localized
  /** Short tabular-mono glyph shown in the rail (kept text so status/label reads without color). */
  tag: string
}

export const MODULES: NavModule[] = [
  { id: 'catalog', href: '/catalog', label: { es: 'Catálogo', en: 'Catalog' }, tag: 'CAT' },
  { id: 'pipeline', href: '/pipeline', label: { es: 'Pipeline', en: 'Pipeline' }, tag: 'PIP' },
  { id: 'containers', href: '/containers', label: { es: 'Contenedores', en: 'Containers' }, tag: 'CTN' },
  { id: 'costing', href: '/costing', label: { es: 'Costeo', en: 'Costing' }, tag: 'CST' },
  { id: 'signals', href: '/signals', label: { es: 'Señales', en: 'Signals' }, tag: 'SIG' },
  { id: 'intelligence', href: '/intelligence', label: { es: 'Inteligencia', en: 'Intelligence' }, tag: 'INT' },
  { id: 'admin', href: '/admin', label: { es: 'Administración', en: 'Admin' }, tag: 'ADM' },
]
