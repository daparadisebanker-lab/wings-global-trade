'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@wings/trade-ui'
import { CommandPalette } from './CommandPalette'
import { LaneSwitcher } from './LaneSwitcher'
import { NavRail } from './NavRail'
import { RouteProgress } from './RouteProgress'
import { TopBar } from './TopBar'
import type { LaneMembership } from '@/lib/lanes/memberships'
import { visibleModules, type Role } from '@/lib/rbac'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { MODULES } from '@/lib/nav'

/** Location strip — TOWER › Módulo › subpágina, derived from the path so you
 *  always know where you are. Ids/numbers in the path are omitted. */
function Breadcrumb({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const mod = MODULES.find((m) => pathname.startsWith(m.href))
  const sub = pathname.split('/').filter(Boolean)[1]
  const isId = !!sub && (/^[0-9a-f-]{8,}$/i.test(sub) || /^\d+$/.test(sub))
  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-2.5 font-mono text-label uppercase tracking-[0.14em] text-ink-secondary">
      <span className="text-gold">TOWER</span>
      {mod ? (
        <>
          <span aria-hidden>›</span>
          <span className="text-ink-primary">{t(mod.label, locale)}</span>
        </>
      ) : null}
      {sub && !isId ? (
        <>
          <span aria-hidden>›</span>
          <span>{sub.replace(/-/g, ' ')}</span>
        </>
      ) : null}
    </div>
  )
}

/**
 * TowerShell client chrome (COMPONENT_TREE). Wraps every (shell) screen with the
 * lane switcher, grouped module rail, top bar, breadcrumb, ⌘K palette and
 * notifications. Interaction only (data is fetched server-side and passed in):
 *  - active lane selection → sets --lane-accent on the shell root (tints
 *    stamps/series/chips ONLY; surfaces never change).
 *  - ⌘K / Ctrl-K toggles the command palette.
 *  - the rail collapses to icons on desktop and becomes an off-canvas drawer on
 *    mobile (hamburger in the TopBar), so content is never crushed at 390px.
 */
export function ShellChrome({
  memberships,
  userEmail,
  isGroupAdmin = false,
  hasRbMembership = false,
  children,
}: {
  memberships: LaneMembership[]
  userEmail: string | null
  isGroupAdmin?: boolean
  hasRbMembership?: boolean
  children: ReactNode
}) {
  const [activeLaneId, setActiveLaneId] = useState<string | null>(memberships[0]?.laneId ?? null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const roles = useMemo(() => memberships.map((m) => m.role) as Role[], [memberships])
  const visible = useMemo(
    () => visibleModules(roles, isGroupAdmin, hasRbMembership),
    [roles, isGroupAdmin, hasRbMembership],
  )

  const activeLane = memberships.find((m) => m.laneId === activeLaneId) ?? null
  const rootStyle = activeLane?.accent
    ? ({ '--lane-accent': activeLane.accent } as CSSProperties)
    : undefined

  return (
    <div style={rootStyle} className="min-h-screen bg-surface-0 text-ink-primary">
      <RouteProgress />
      <div className="flex min-h-screen">
        {/* Mobile drawer backdrop */}
        {drawerOpen ? (
          <button
            type="button"
            aria-label={t({ es: 'Cerrar menú', en: 'Close menu' }, DEFAULT_LOCALE)}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-30 md:hidden"
            style={{ backgroundColor: 'var(--scrim)' }}
          />
        ) : null}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-line bg-surface-1 transition-transform duration-200',
            'md:sticky md:top-0 md:z-auto md:h-screen',
            collapsed ? 'md:w-16' : 'md:w-64',
            drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          <div className="flex items-center border-b border-line p-4">
            {collapsed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/brand/wings-isotipo.webp" alt="Wings Global Trade" className="mx-auto h-7 w-7" />
            ) : (
              <div className="flex flex-col gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/wings-imagotipo.svg" alt="Wings Global Trade" className="h-8 w-auto" />
                <span className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.18em] text-ink-secondary">
                  <span aria-hidden className="inline-block h-1.5 w-1.5 bg-gold" />
                  Admin Portal
                </span>
              </div>
            )}
          </div>

          {!collapsed ? (
            <LaneSwitcher lanes={memberships} activeLaneId={activeLaneId} onSelect={setActiveLaneId} />
          ) : null}

          <NavRail visible={visible} collapsed={collapsed} onNavigate={() => setDrawerOpen(false)} />

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={
              collapsed
                ? t({ es: 'Expandir menú', en: 'Expand menu' }, DEFAULT_LOCALE)
                : t({ es: 'Colapsar menú', en: 'Collapse menu' }, DEFAULT_LOCALE)
            }
            className="mt-auto hidden items-center gap-2 border-t border-line px-4 py-3 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary transition-colors hover:text-ink-primary md:flex"
          >
            <span aria-hidden>{collapsed ? '»' : '«'}</span>
            {!collapsed ? <span>{t({ es: 'Colapsar', en: 'Collapse' }, DEFAULT_LOCALE)}</span> : null}
          </button>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar
            userEmail={userEmail}
            isGroupAdmin={isGroupAdmin}
            onOpenSearch={() => setPaletteOpen(true)}
            onOpenMenu={() => setDrawerOpen(true)}
          />
          <Breadcrumb locale={DEFAULT_LOCALE} />
          {/* overflow-x-clip: a mobile safety net — no page-wide horizontal
              scroll, while inner overflow-x-auto tables keep their own scroll. */}
          <main data-lane={activeLane?.laneSlug} className="min-w-0 flex-1 overflow-x-clip">
            {children}
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} isGroupAdmin={isGroupAdmin} />
    </div>
  )
}
