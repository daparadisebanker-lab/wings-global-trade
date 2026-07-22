'use client'

// The desktop Dock (TOWER-REDESIGN §3.1) — the primary desktop navigation.
// Renders EXCLUSIVELY from the navigation registry (TOOLS × the rbac `visible`
// set), split by `section` into core | divider | utility, with the active dot
// from `useActiveTool` — no third nav list exists. A leading lane-stamp tile
// opens the LaneSwitcher in a popover (P4b — lane switching re-homed off the
// retired rail; LaneSwitcher is a props-passthrough, no internal edits). Desktop
// -only (`hidden md:flex`, CSS-gated); below md the off-canvas drawer is
// untouched. Pin state is owned by ShellChrome (drives the content padding).
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import type { LaneMembership } from '@/lib/lanes/memberships'
import { TOOLS, type TowerTool } from '@/shell/navigation/registry'
import { useActiveTool } from '@/shell/navigation/useActiveTool'
import { NAV_ICONS } from '@/components/shell/nav-icons'
import { LaneSwitcher } from '@/components/shell/LaneSwitcher'

function DockTile({ tool, active, locale }: { tool: TowerTool; active: boolean; locale: Locale }) {
  const Icon = NAV_ICONS[tool.icon]
  const label = t(tool.label, locale)
  return (
    <Link
      href={tool.href}
      data-active={active}
      data-tip={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className="mac-dock-tile"
    >
      <Icon className="mac-dock-ico" />
      {active ? <span aria-hidden className="mac-dock-dot" /> : null}
    </Link>
  )
}

export function Dock({
  visible,
  pinned,
  onTogglePinned,
  onOpenSearch,
  lanes,
  activeLaneId,
  onSelectLane,
  locale = DEFAULT_LOCALE,
}: {
  visible: Set<ModuleId>
  pinned: boolean
  onTogglePinned: () => void
  onOpenSearch: () => void
  lanes: LaneMembership[]
  activeLaneId: string | null
  onSelectLane: (laneId: string) => void
  locale?: Locale
}) {
  const active = useActiveTool()
  const [revealed, setRevealed] = useState(false)
  const [laneOpen, setLaneOpen] = useState(false)
  const laneRef = useRef<HTMLDivElement>(null)

  // Close the lane popover on outside click / Escape.
  useEffect(() => {
    if (!laneOpen) return
    const onDoc = (e: MouseEvent) => {
      if (laneRef.current && !laneRef.current.contains(e.target as Node)) setLaneOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLaneOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onEsc)
    }
  }, [laneOpen])

  const tools = TOOLS.filter((tl) => visible.has(tl.id))
  const core = tools.filter((tl) => tl.section === 'core')
  const utility = tools.filter((tl) => tl.section === 'utility')

  // A zero-module operator keeps the rail's designed empty note on desktop
  // (ShellChrome un-hides the aside for them); the Dock stands down entirely.
  if (tools.length === 0) return null

  const activeLane = lanes.find((l) => l.laneId === activeLaneId) ?? null
  // Include laneOpen: an auto-hidden dock must not slide off while its lane
  // popover is open (crossing the gap to the popover would otherwise fire
  // mouseleave and hide both). Outside-click/Escape close it, then hide resumes.
  const shown = pinned || revealed || laneOpen

  return (
    <>
      {!pinned ? (
        <div
          aria-hidden
          className="mac-dock-summon hidden md:block"
          onMouseEnter={() => setRevealed(true)}
          onMouseLeave={() => setRevealed(false)}
        />
      ) : null}

      <nav
        aria-label={t({ es: 'Dock', en: 'Dock' }, locale)}
        className={cn('mac-dock hidden md:flex', !shown && 'is-hidden')}
        onMouseEnter={() => {
          if (!pinned) setRevealed(true)
        }}
        onMouseLeave={() => {
          if (!pinned) setRevealed(false)
        }}
        onFocusCapture={() => {
          if (!pinned) setRevealed(true)
        }}
        onBlurCapture={(e) => {
          if (!pinned && !e.currentTarget.contains(e.relatedTarget as Node | null)) setRevealed(false)
        }}
      >
        {/* Lane stamp — opens the LaneSwitcher popover (only when the operator
            holds lanes). The stamp square is tinted by the active lane accent. */}
        {lanes.length > 0 ? (
          <div className="mac-dock-lane" ref={laneRef}>
            <button
              type="button"
              onClick={() => setLaneOpen((v) => !v)}
              aria-haspopup="dialog"
              aria-expanded={laneOpen}
              data-tip={activeLane ? activeLane.laneName : t({ es: 'Lanes', en: 'Lanes' }, locale)}
              aria-label={t({ es: 'Cambiar lane', en: 'Switch lane' }, locale)}
              className="mac-dock-tile"
            >
              <span aria-hidden className="mac-dock-stamp" />
            </button>
            {laneOpen ? (
              <div className="mac-dock-lane-pop" role="dialog" aria-label={t({ es: 'Lanes', en: 'Lanes' }, locale)}>
                <LaneSwitcher
                  lanes={lanes}
                  activeLaneId={activeLaneId}
                  onSelect={(id) => {
                    onSelectLane(id)
                    setLaneOpen(false)
                  }}
                  locale={locale}
                />
              </div>
            ) : null}
            <span aria-hidden className="mac-dock-div" />
          </div>
        ) : null}

        {core.map((tl) => (
          <DockTile key={tl.id} tool={tl} active={active?.id === tl.id} locale={locale} />
        ))}

        <span aria-hidden className="mac-dock-div" />

        {utility.map((tl) => (
          <DockTile key={tl.id} tool={tl} active={active?.id === tl.id} locale={locale} />
        ))}

        <button
          type="button"
          onClick={onOpenSearch}
          data-tip={t({ es: 'Buscar', en: 'Search' }, locale)}
          aria-label={t({ es: 'Buscar (⌘K)', en: 'Search (⌘K)' }, locale)}
          className="mac-dock-tile"
        >
          <svg className="mac-dock-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
            <circle cx="9" cy="9" r="5" />
            <path d="M13.5 13.5 17 17" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onTogglePinned}
          aria-pressed={pinned}
          data-tip={pinned ? t({ es: 'Auto-ocultar', en: 'Auto-hide' }, locale) : t({ es: 'Fijar', en: 'Pin' }, locale)}
          aria-label={
            pinned
              ? t({ es: 'Auto-ocultar el dock', en: 'Auto-hide the dock' }, locale)
              : t({ es: 'Fijar el dock', en: 'Pin the dock' }, locale)
          }
          className="mac-dock-tile mac-dock-pin"
        >
          <svg className="mac-dock-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {pinned ? <path d="M10 3v9M6 8l4 4 4-4M4 16.5h12" /> : <path d="M10 4v9M6.5 7.5 10 4l3.5 3.5M4 16.5h12" />}
          </svg>
        </button>
      </nav>
    </>
  )
}
