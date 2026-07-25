'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@wings/trade-ui'
import { CommandPalette } from './CommandPalette'
import { toggleTheme } from './theme'
import { LaneSwitcher } from './LaneSwitcher'
import { MisterMark } from './MisterMark'
import { MisterProvider } from './mister/MisterProvider'
import { MisterCockpit } from './mister/MisterCockpit'
import { OnboardingBanner } from './OnboardingBanner'
import { RouteProgress } from './RouteProgress'
import { TopBar } from './TopBar'
import type { LaneMembership } from '@/lib/lanes/memberships'
import { visibleModules, type Role } from '@/lib/rbac'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { useActiveTool } from '@/shell/navigation/useActiveTool'
import { resolveActiveTool } from '@/shell/navigation/registry'
import { recordRecent } from '@/shell/navigation/recents'
import { Dock } from '@/shell/dock/Dock'
import { ControlCenterGrid } from '@/shell/control-center/ControlCenter'
import { MobileControlCenter } from '@/shell/control-center/MobileControlCenter'
import { RepPanel } from '@/shell/rep-panel/RepPanel'

/** Focusable descendants that are actually rendered — display:none elements
 *  (`offsetParent === null`) are excluded. The aside hosts BOTH the mobile drawer
 *  content and the desktop-only controls (the WS3 collapse « button, the RepPanel
 *  links) under `hidden md:*`; without this filter the mobile focus trap and the
 *  open-focus would land on those hidden controls and silently break. */
function visibleFocusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  const all = root.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')
  return Array.from(all).filter((el) => el.offsetParent !== null)
}

/** Location strip — TOWER › Módulo › subpágina, derived from the path so you
 *  always know where you are. Ids/numbers in the path are omitted. Ancestor
 *  crumbs are links (retrace one level); the current location stays a label. */
const CRUMB_LINK =
  'rounded-sm underline-offset-2 hover:text-ink-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent'

function Breadcrumb({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const mod = useActiveTool()
  const sub = pathname.split('/').filter(Boolean)[1]
  const isId = !!sub && (/^[0-9a-f-]{8,}$/i.test(sub) || /^\d+$/.test(sub))
  const hasSub = !!sub && !isId
  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-2.5 font-mono text-label uppercase tracking-[0.14em] text-ink-secondary">
      {/* TOWER → home cockpit; a link whenever it is an ancestor (a module is active). */}
      {mod ? (
        <Link href="/signals" className={`text-gold ${CRUMB_LINK}`}>
          TOWER
        </Link>
      ) : (
        <span className="text-gold" aria-current="page">
          TOWER
        </span>
      )}
      {mod ? (
        <>
          <span aria-hidden>›</span>
          {hasSub ? (
            <Link href={mod.href} className={`text-ink-primary ${CRUMB_LINK}`}>
              {t(mod.label, locale)}
            </Link>
          ) : (
            <span className="text-ink-primary" aria-current="page">
              {t(mod.label, locale)}
            </span>
          )}
        </>
      ) : null}
      {hasSub ? (
        <>
          <span aria-hidden>›</span>
          <span aria-current="page">{sub.replace(/-/g, ' ')}</span>
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
  userName,
  userEmail,
  repTitle = null,
  teamSpaceEnabled = false,
  unreadMentions = 0,
  isGroupAdmin = false,
  hasRbMembership = false,
  needsOnboarding = false,
  children,
}: {
  memberships: LaneMembership[]
  userName: string | null
  userEmail: string | null
  /** The rep's role/title from their profile — shown under their name in the rail. */
  repTitle?: string | null
  /** Team space live (tower_55 applied) — gates the rail's Equipo entry so it
   *  never links to a dormant coming-soon page. */
  teamSpaceEnabled?: boolean
  /** Unread @mention count for the rail's Equipo badge. */
  unreadMentions?: number
  isGroupAdmin?: boolean
  hasRbMembership?: boolean
  needsOnboarding?: boolean
  children: ReactNode
}) {
  const [activeLaneId, setActiveLaneId] = useState<string | null>(memberships[0]?.laneId ?? null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [misterOpen, setMisterOpen] = useState(false)
  // Mobile iOS-style Control Center shade (top-right pill → slides down). Mobile-only.
  const [controlCenterOpen, setControlCenterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Desktop Dock pin state (default pinned; persisted). Owned here because it
  // drives the content-bottom padding; the Dock reflects it + toggles it.
  const [dockPinned, setDockPinned] = useState(true)
  // Desktop left-rail collapse (default open; persisted). Collapsing frees the full
  // width for the work surface — the "compact for what matters" ask. Desktop-only:
  // on mobile the aside is the drawer (drawerOpen governs it). Content-agnostic, so
  // it applies equally once the rail carries the rep panel instead of modules.
  const [railCollapsed, setRailCollapsed] = useState(false)
  const railRef = useRef<HTMLElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  // On /intelligence the cockpit is rendered inline (page mode); mounting the
  // overlay cockpit there too would put TWO editor hosts on one artifact seq and
  // corrupt the canvas working memory. This ref lets the (mount-once) key handler
  // read the current route so ⌘J is a no-op on that page.
  const onCockpitPageRef = useRef(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      // ⌘J / Ctrl-J summons Mister — the copilot cockpit overlay (the palette is
      // ⌘K). On /intelligence the cockpit is already the page, so ⌘J is a no-op
      // there (opening the overlay too would double-mount the editors).
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        if (!onCockpitPageRef.current) setMisterOpen((v) => !v)
      }
      // ⌘. toggles the desktop Dock between pinned and auto-hidden.
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        setDockPinned((v) => {
          const n = !v
          try {
            localStorage.setItem('tower-dock', n ? 'pinned' : 'hidden')
          } catch {
            /* private mode */
          }
          return n
        })
      }
      // ⌘\ collapses / restores the desktop left rail (maximize the work surface).
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        setRailCollapsed((v) => {
          const n = !v
          try {
            localStorage.setItem('tower-rail', n ? 'collapsed' : 'open')
          } catch {
            /* private mode */
          }
          return n
        })
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

  // Restore the persisted Dock pin state (default pinned). Read after mount so
  // there is no SSR/CSR mismatch on the padding contract.
  useEffect(() => {
    try {
      if (localStorage.getItem('tower-dock') === 'hidden') setDockPinned(false)
    } catch {
      /* private mode — stays pinned */
    }
  }, [])

  // Restore the persisted rail-collapsed state (default open). Read after mount.
  useEffect(() => {
    try {
      if (localStorage.getItem('tower-rail') === 'collapsed') setRailCollapsed(true)
    } catch {
      /* private mode — stays open */
    }
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
        visibleFocusables(railRef.current)[0]?.focus()
      }, 0)
      return () => window.clearTimeout(id)
    }
    restoreFocusRef.current?.focus?.()
  }, [drawerOpen, isMobile])

  // Trap Tab within the open mobile drawer.
  function onRailKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
    if (!isMobile || !drawerOpen || e.key !== 'Tab') return
    const f = visibleFocusables(railRef.current)
    if (f.length === 0) return
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
  // /intelligence renders the cockpit inline (page mode) — never mount the overlay
  // cockpit there too (one editor host per artifact seq; see onCockpitPageRef).
  const onCockpitPage = pathname === '/intelligence'
  onCockpitPageRef.current = onCockpitPage
  const roles = useMemo(() => memberships.map((m) => m.role) as Role[], [memberships])
  const visible = useMemo(
    () => visibleModules(roles, isGroupAdmin, hasRbMembership),
    [roles, isGroupAdmin, hasRbMembership],
  )

  // Capture visited record detail routes for the palette's "Recientes" group. A
  // detail route = an active tool whose path carries a trailing id segment (the
  // same id test the Breadcrumb uses). Label = module name + short id — terse but
  // honest; real record-name labels are a follow-up (REDESIGN-NOTES P6).
  useEffect(() => {
    const tool = resolveActiveTool(pathname)
    if (!tool || pathname === tool.href) return
    const segs = pathname.split('/').filter(Boolean)
    const last = segs[segs.length - 1] ?? ''
    const isId = /^[0-9a-f-]{8,}$/i.test(last) || /^\d+$/.test(last)
    if (!isId) return
    const shortId = last.length > 8 ? last.slice(0, 8) : last
    recordRecent({
      href: pathname,
      label: `${t(tool.label, DEFAULT_LOCALE)} · ${shortId}`,
      tag: tool.tag,
      moduleId: tool.id,
    })
  }, [pathname])

  // A hand-off / nav link INSIDE the full-bleed Mister overlay navigates the page
  // behind it; without dismissing the cockpit the destination stays hidden under the
  // z-60 overlay and the link looks dead (the top "buttons don't work" report). Close
  // it on every route change — its conversation/draft state lives in MisterProvider and
  // survives navigation, so nothing is lost. The mobile Control Center shade closes on
  // navigation too (its links go to real routes).
  useEffect(() => {
    setMisterOpen(false)
    setControlCenterOpen(false)
  }, [pathname])

  const activeLane = memberships.find((m) => m.laneId === activeLaneId) ?? null
  const rootStyle = activeLane?.accent
    ? ({ '--lane-accent': activeLane.accent } as CSSProperties)
    : undefined

  const toggleDock = () => {
    setDockPinned((v) => {
      const n = !v
      try {
        localStorage.setItem('tower-dock', n ? 'pinned' : 'hidden')
      } catch {
        /* private mode */
      }
      return n
    })
  }

  const toggleRail = () => {
    setRailCollapsed((v) => {
      const n = !v
      try {
        localStorage.setItem('tower-rail', n ? 'collapsed' : 'open')
      } catch {
        /* private mode */
      }
      return n
    })
  }

  return (
    <div
      style={rootStyle}
      data-dock-pinned={dockPinned}
      className="tower-premium-ground min-h-screen bg-surface-0 text-ink-primary"
    >
     <MisterProvider locale={DEFAULT_LOCALE}>
      <RouteProgress />
      <div className="flex min-h-screen">
        {/* Mobile drawer backdrop */}
        {drawerOpen ? (
          <button
            type="button"
            aria-label={t({ es: 'Cerrar menú', en: 'Close menu' }, DEFAULT_LOCALE)}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-30 backdrop-blur md:hidden"
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
            // Safe-area insets: the logo (top) clears the notch and the sign-out
            // (foot) clears the home indicator on a notched phone (viewport-fit:cover);
            // both resolve to 0 on desktop. macOS spring on open/close; reduced-motion
            // drops the slide (the drawer just appears) per the motion law.
            'tower-rail fixed inset-y-0 left-0 z-40 flex w-[86vw] max-w-80 flex-col overflow-y-auto border-r border-line bg-surface-1 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] transition-[transform,width] duration-200 ease-spring-settle motion-reduce:transition-none',
            'md:sticky md:top-0 md:z-auto md:h-screen md:max-w-none',
            // Desktop collapse (⌘\ / the « button): slide the rail to zero width to give
            // the work surface the whole viewport. Mobile is unaffected (drawer governs).
            railCollapsed ? 'md:w-0 md:min-w-0 md:overflow-hidden md:border-r-0' : 'md:w-64',
            drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          <div className="flex items-center border-b border-line p-4">
            <div className="flex flex-col gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/wings-imagotipo.svg" alt="Wings Global Trade" className="h-8 w-auto" />
              <span className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.18em] text-ink-secondary">
                <span aria-hidden className="inline-block h-1.5 w-1.5 bg-gold" />
                Admin Portal
              </span>
            </div>
            {/* Collapse the rail (desktop only; mobile uses the drawer scrim). */}
            <button
              type="button"
              onClick={toggleRail}
              aria-label={t({ es: 'Contraer panel (⌘\\)', en: 'Collapse panel (⌘\\)' }, DEFAULT_LOCALE)}
              className="ml-auto hidden h-8 w-8 shrink-0 items-center justify-center rounded-control text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink-primary md:flex"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                <path d="M10 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <LaneSwitcher lanes={memberships} activeLaneId={activeLaneId} onSelect={setActiveLaneId} />

          {/* Mobile: the Control Center module grid (registry-driven) + a dedicated
              Mister entry that opens the immersive overlay (the copilot), so
              "selecting Mister" here matches the desktop floating door / ⌘J. */}
          <div className="md:hidden">
            <ControlCenterGrid
              visible={visible}
              onNavigate={() => setDrawerOpen(false)}
              onOpenMister={() => {
                setMisterOpen(true)
                setDrawerOpen(false)
              }}
            />
          </div>
          {/* Desktop: the operator's own rail (D1). The Dock is the SOLE module
              navigator now, so the rail carries identity · profile · marketing ·
              sign out — never a module list. flex-1 so Sign out pins to the foot. */}
          <div className="hidden flex-1 flex-col md:flex">
            <RepPanel
              userName={userName}
              userEmail={userEmail}
              repTitle={repTitle}
              showMarketing={visible.has('marcas')}
              teamSpaceEnabled={teamSpaceEnabled}
              unreadMentions={unreadMentions}
            />
          </div>
        </aside>

        {/* When the rail is collapsed, a slim edge tab (desktop only) brings it back. */}
        {railCollapsed ? (
          <button
            type="button"
            onClick={toggleRail}
            aria-label={t({ es: 'Expandir panel (⌘\\)', en: 'Expand panel (⌘\\)' }, DEFAULT_LOCALE)}
            className="fixed left-0 top-3 z-40 hidden h-9 w-6 items-center justify-center rounded-r-control border border-l-0 border-line bg-surface-1 text-ink-secondary transition-colors hover:text-ink-primary md:flex"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <TopBar
            userName={userName}
            userEmail={userEmail}
            isGroupAdmin={isGroupAdmin}
            onOpenSearch={() => setPaletteOpen(true)}
            onOpenMenu={() => setDrawerOpen(true)}
            onOpenControlCenter={() => setControlCenterOpen(true)}
            hasModules={visible.size > 0}
          />
          <Breadcrumb locale={DEFAULT_LOCALE} />
          {needsOnboarding ? <OnboardingBanner /> : null}
          {/* overflow-x-clip: a mobile safety net — no page-wide horizontal
              scroll, while inner overflow-x-auto tables keep their own scroll.
              key={pathname} + .mac-page replays the shell-frame page transition on
              every navigation (transform+opacity only; reduced-motion → fade). */}
          <main
            key={pathname}
            data-lane={activeLane?.laneSlug}
            className={cn(
              // Mobile bottom clearance: reserve a band (+ the home-indicator inset)
              // so the last row never hides under the Mister FAB (bottom-right, ~72px).
              // Desktop has no FAB-over-content problem — the md: rules below take over
              // and size the clearance to the Dock instead.
              'mac-page min-w-0 flex-1 overflow-x-clip pb-[calc(5rem+env(safe-area-inset-bottom))]',
              // Content clearance for the desktop Dock.
              dockPinned ? 'md:pb-24' : 'md:pb-6',
            )}
          >
            {children}
          </main>
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        isGroupAdmin={isGroupAdmin}
        visible={visible}
        onToggleTheme={toggleTheme}
        onToggleDock={toggleDock}
      />

      {/* Desktop Dock — the primary desktop nav (registry-driven). Desktop-only
          (the component gates hidden md:flex); mobile keeps the drawer. */}
      <Dock
        visible={visible}
        pinned={dockPinned}
        onTogglePinned={toggleDock}
        onOpenSearch={() => setPaletteOpen(true)}
        lanes={memberships}
        activeLaneId={activeLaneId}
        onSelectLane={setActiveLaneId}
      />

      {/* Mobile Control Center — the iOS-style top shade (opened by the TopBar pill).
          Owns quick actions + settings + status/sign-out; the drawer stays modules. */}
      <MobileControlCenter
        open={controlCenterOpen}
        onClose={() => setControlCenterOpen(false)}
        userName={userName}
        userEmail={userEmail}
        teamSpaceEnabled={teamSpaceEnabled}
        unreadMentions={unreadMentions}
        showMarketing={visible.has('marcas')}
        onOpenMister={() => setMisterOpen(true)}
        onOpenSearch={() => setPaletteOpen(true)}
      />

      {/* Mister — the full-width production cockpit (World B) + its floating door.
          The launcher hides while the cockpit is open so they never overlap, and
          on /intelligence (where the cockpit IS the page) both are suppressed so
          only one editor host exists per artifact. */}
      {!misterOpen && !drawerOpen && !onCockpitPage ? (
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
      {!onCockpitPage ? <MisterCockpit mode="overlay" open={misterOpen} onClose={() => setMisterOpen(false)} /> : null}
     </MisterProvider>
    </div>
  )
}
