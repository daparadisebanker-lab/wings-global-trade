'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@wings/trade-ui'
import { CommandPalette } from './CommandPalette'
import { LaneSwitcher } from './LaneSwitcher'
import { MisterDock } from './MisterDock'
import { MisterMark } from './MisterMark'
import { NavRail } from './NavRail'
import { OnboardingBanner } from './OnboardingBanner'
import { RouteProgress } from './RouteProgress'
import { TopBar } from './TopBar'
import type { LaneMembership } from '@/lib/lanes/memberships'
import { visibleModules, type Role } from '@/lib/rbac'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { useActiveTool } from '@/shell/navigation/useActiveTool'
import { GreetingBar } from '@/shell/frame/GreetingBar'

/** Location strip — TOWER › Módulo › subpágina, derived from the path so you
 *  always know where you are. Ids/numbers in the path are omitted. */
function Breadcrumb({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const mod = useActiveTool()
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
  needsOnboarding = false,
  children,
}: {
  memberships: LaneMembership[]
  userEmail: string | null
  isGroupAdmin?: boolean
  hasRbMembership?: boolean
  needsOnboarding?: boolean
  children: ReactNode
}) {
  const [activeLaneId, setActiveLaneId] = useState<string | null>(memberships[0]?.laneId ?? null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [misterOpen, setMisterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const railRef = useRef<HTMLElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      // ⌘J / Ctrl-J summons Mister — the copilot dock (the palette is ⌘K).
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        setMisterOpen((v) => !v)
      }
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Below md (768px) the rail is a MODAL DRAWER, not a sidebar — it needs the
  // full dialog contract (inert when closed, focus trapped when open, focus
  // returned on close). Above md it is a static sidebar and none of this applies.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // The off-screen mobile drawer must not be reachable by keyboard / AT.
  useEffect(() => {
    if (railRef.current) railRef.current.inert = isMobile && !drawerOpen
  }, [isMobile, drawerOpen])

  // Move focus into the drawer on open; return it to the opener on close.
  useEffect(() => {
    if (!isMobile) return
    if (drawerOpen) {
      restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null
      const id = window.setTimeout(() => {
        railRef.current?.querySelector<HTMLElement>('a[href],button:not([disabled])')?.focus()
      }, 0)
      return () => window.clearTimeout(id)
    }
    restoreFocusRef.current?.focus?.()
  }, [drawerOpen, isMobile])

  // Trap Tab within the open mobile drawer.
  function onRailKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
    if (!isMobile || !drawerOpen || e.key !== 'Tab') return
    const f = railRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')
    if (!f || f.length === 0) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // Drives the page-transition replay (keys <main>) — the frame's route change.
  const pathname = usePathname()
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
    <div style={rootStyle} className="tower-premium-ground min-h-screen bg-surface-0 text-ink-primary">
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
          ref={railRef}
          onKeyDown={onRailKeyDown}
          role={isMobile ? 'dialog' : undefined}
          aria-modal={isMobile && drawerOpen ? true : undefined}
          aria-label={isMobile ? t({ es: 'Menú de navegación', en: 'Navigation menu' }, DEFAULT_LOCALE) : undefined}
          className={cn(
            'tower-rail fixed inset-y-0 left-0 z-40 flex w-[86vw] max-w-80 flex-col overflow-y-auto border-r border-line bg-surface-1 transition-transform duration-200',
            'md:sticky md:top-0 md:z-auto md:h-screen md:max-w-none',
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

          <div className="mt-auto flex flex-col">
            {/* Mister — a persistent rail entry (the dock is also ⌘J + the floating
                door). Its own mark, so it reads as the copilot, not a module. */}
            <button
              type="button"
              onClick={() => {
                setMisterOpen(true)
                setDrawerOpen(false)
              }}
              aria-label={t({ es: 'Abrir Mister (⌘J)', en: 'Open Mister (⌘J)' }, DEFAULT_LOCALE)}
              className={cn(
                'group flex items-center gap-3 border-t border-line px-4 py-3 text-ink-secondary transition-colors hover:text-ink-primary',
                collapsed && 'justify-center px-0',
              )}
            >
              <MisterMark size={20} className="shrink-0" />
              {!collapsed ? (
                <>
                  <span className="font-mono text-label uppercase tracking-[0.12em]">Mister</span>
                  <span
                    data-kbd-hint
                    className="ml-auto font-mono text-label tracking-[0.1em] text-ink-secondary group-hover:text-ink-primary"
                  >
                    ⌘J
                  </span>
                </>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={
                collapsed
                  ? t({ es: 'Expandir menú', en: 'Expand menu' }, DEFAULT_LOCALE)
                  : t({ es: 'Colapsar menú', en: 'Collapse menu' }, DEFAULT_LOCALE)
              }
              className="hidden items-center gap-2 border-t border-line px-4 py-3 font-mono text-label uppercase tracking-[0.12em] text-ink-secondary transition-colors hover:text-ink-primary md:flex"
            >
              <span aria-hidden>{collapsed ? '»' : '«'}</span>
              {!collapsed ? <span>{t({ es: 'Colapsar', en: 'Collapse' }, DEFAULT_LOCALE)}</span> : null}
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar
            userEmail={userEmail}
            isGroupAdmin={isGroupAdmin}
            onOpenSearch={() => setPaletteOpen(true)}
            onOpenMenu={() => setDrawerOpen(true)}
          />
          <GreetingBar userEmail={userEmail} />
          <Breadcrumb locale={DEFAULT_LOCALE} />
          {needsOnboarding ? <OnboardingBanner /> : null}
          {/* overflow-x-clip: a mobile safety net — no page-wide horizontal
              scroll, while inner overflow-x-auto tables keep their own scroll.
              key={pathname} + .mac-page replays the shell-frame page transition on
              every navigation (transform+opacity only; reduced-motion → fade). */}
          <main key={pathname} data-lane={activeLane?.laneSlug} className="mac-page min-w-0 flex-1 overflow-x-clip">
            {children}
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} isGroupAdmin={isGroupAdmin} visible={visible} />

      {/* Mister — the copilot dock (World B) + its floating door. The launcher
          hides while the dock is open so they never overlap. */}
      {!misterOpen && !drawerOpen ? (
        <button
          type="button"
          onClick={() => setMisterOpen(true)}
          className="mister-launch"
          aria-label={t({ es: 'Abrir Mister (⌘J)', en: 'Open Mister (⌘J)' }, DEFAULT_LOCALE)}
          title="Mister · ⌘J"
        >
          <MisterMark size={26} />
        </button>
      ) : null}
      <MisterDock open={misterOpen} onClose={() => setMisterOpen(false)} />
    </div>
  )
}
