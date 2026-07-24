// src/shell/navigation/quick-actions.ts
// 1–2 quick sub-actions per module, revealed when a NavSidebar card expands
// (shell IA/UI Phase C). Sparse by design — only modules with a distinct
// sub-route appear; a module absent here renders as a plain nav card with no
// expander. Registry-adjacent data (React-free), same spirit as registry.ts, so
// adding an action is a one-line edit that surfaces it in the sidebar.
import type { Localized } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'

export interface QuickAction {
  id: string
  label: Localized
  href: string
}

export const MODULE_QUICK_ACTIONS: Partial<Record<ModuleId, QuickAction[]>> = {
  catalog: [{ id: 'catalog-new', label: { es: 'Nuevo producto', en: 'New product' }, href: '/catalog/new' }],
  costing: [
    { id: 'costing-bulk', label: { es: 'Carga masiva', en: 'Bulk import' }, href: '/costing/bulk' },
    { id: 'costing-prorrateo', label: { es: 'Prorrateo', en: 'Proration' }, href: '/costing/prorrateo' },
  ],
  admin: [
    { id: 'admin-users', label: { es: 'Usuarios', en: 'Users' }, href: '/admin/users' },
    { id: 'admin-lanes', label: { es: 'Lanes', en: 'Lanes' }, href: '/admin/lanes' },
  ],
}
