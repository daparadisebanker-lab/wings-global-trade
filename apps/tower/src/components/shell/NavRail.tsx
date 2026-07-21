'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MODULES, type ModuleId } from '@/lib/nav'

/**
 * The six-module rail (COMPONENT_TREE). Renders only modules the memberships can
 * see — PRESENTATION only (lib/rbac). RLS is the real gate; a hidden module's
 * route still exists.
 */
export function NavRail({
  visible,
  locale = DEFAULT_LOCALE,
}: {
  visible: Set<ModuleId>
  locale?: Locale
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Módulos" className="flex flex-col gap-1 p-2">
      {MODULES.filter((m) => visible.has(m.id)).map((m) => {
        const active = pathname.startsWith(m.href)
        return (
          <Link
            key={m.id}
            href={m.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-card border-l-2 border-transparent px-3 py-2 text-t0 transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent',
              active
                ? 'border-gold bg-surface-0 text-ink-primary'
                : 'text-ink-secondary hover:bg-surface-0 hover:text-ink-primary',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'font-mono text-label tracking-[0.1em]',
                active ? 'text-gold' : 'text-ink-secondary',
              )}
            >
              {m.tag}
            </span>
            <span className="font-ui">{t(m.label, locale)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
