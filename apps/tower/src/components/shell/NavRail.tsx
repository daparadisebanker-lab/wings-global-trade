'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MODULES, NAV_GROUPS, type ModuleId } from '@/lib/nav'
import { NAV_ICONS } from './nav-icons'

/**
 * The module rail (COMPONENT_TREE). Modules render in three labelled IA groups
 * (Operación · Marca e inteligencia · Sistema), each item icon-led with a full
 * label + demoted mono tag. Only modules the memberships can see are shown —
 * PRESENTATION only (lib/rbac); RLS is the real gate. A group with no visible
 * child is omitted. `collapsed` renders icon-only (desktop rail toggle);
 * `onNavigate` lets the mobile drawer close on selection.
 */
export function NavRail({
  visible,
  locale = DEFAULT_LOCALE,
  collapsed = false,
  onNavigate,
}: {
  visible: Set<ModuleId>
  locale?: Locale
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label={t({ es: 'Módulos', en: 'Modules' }, locale)} className="flex flex-col gap-6 p-3">
      {NAV_GROUPS.map((group) => {
        const items = MODULES.filter((m) => m.group === group.id && visible.has(m.id))
        if (items.length === 0) return null
        return (
          <div key={group.id} className="flex flex-col gap-1">
            {collapsed ? (
              <span aria-hidden className="mx-2 mb-1 h-px bg-line" />
            ) : (
              <span className="flex items-center gap-2 px-2 pb-1 font-mono text-label uppercase tracking-[0.18em] text-ink-secondary">
                <span aria-hidden className="inline-block h-1 w-1 bg-gold" />
                {t(group.label, locale)}
              </span>
            )}
            {items.map((m) => {
              const active = pathname.startsWith(m.href)
              const Icon = NAV_ICONS[m.icon]
              return (
                <Link
                  key={m.id}
                  href={m.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  data-active={active}
                  title={collapsed ? t(m.label, locale) : undefined}
                  className={cn(
                    'tower-nav-item group flex items-center gap-3 rounded-card border-l-2 border-transparent px-3 py-3 text-t0',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'border-gold text-ink-primary'
                      : 'text-ink-secondary hover:border-line hover:bg-surface-0 hover:text-ink-primary',
                  )}
                >
                  <Icon
                    className={cn(
                      'shrink-0',
                      active ? 'text-gold' : 'text-ink-secondary group-hover:text-ink-primary',
                    )}
                  />
                  {!collapsed ? (
                    <>
                      <span className={cn('font-ui', active && 'font-medium')}>{t(m.label, locale)}</span>
                      <span
                        className={cn(
                          'ml-auto font-mono text-label tracking-[0.1em]',
                          active ? 'text-gold' : 'text-ink-secondary group-hover:text-ink-primary',
                        )}
                      >
                        {m.tag}
                      </span>
                    </>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
