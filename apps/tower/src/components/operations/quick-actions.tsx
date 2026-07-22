import Link from 'next/link'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import { ADMIN_ACTIONS, EVERYONE_ACTIONS, resolveActiveTool } from '@/shell/navigation/registry'

// Quick actions — a compact link row rendered ENTIRELY from the navigation
// registry (no fourth nav list). Everyone-actions for all; admin-actions when
// group admin. Each tile deep-links through the action's href and is gated on the
// TARGET module's visibility, so an action into a hidden module never appears.
export function QuickActions({
  visible,
  isGroupAdmin = false,
  locale = DEFAULT_LOCALE,
}: {
  visible: Set<ModuleId>
  isGroupAdmin?: boolean
  locale?: Locale
}) {
  const actions = [...EVERYONE_ACTIONS, ...(isGroupAdmin ? ADMIN_ACTIONS : [])]
    .filter((a) => !a.adminOnly || isGroupAdmin)
    .filter((a) => {
      if (!a.href) return false
      const tool = resolveActiveTool(a.href)
      return !tool || visible.has(tool.id)
    })

  if (actions.length === 0) return null

  return (
    <nav aria-label={t({ es: 'Acciones rápidas', en: 'Quick actions' }, locale)} className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link
          key={a.id}
          href={a.href!}
          className="rounded-pill border border-line bg-surface-1 px-4 py-2 font-ui text-t0 text-ink-primary transition-colors hover:border-gold hover:text-gold"
        >
          {t(a.label, locale)}
        </Link>
      ))}
    </nav>
  )
}
