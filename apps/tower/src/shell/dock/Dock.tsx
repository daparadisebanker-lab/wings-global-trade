'use client'

// The desktop Dock (TOWER-REDESIGN §3.1) — the primary desktop navigation.
// Renders EXCLUSIVELY from the navigation registry (TOOLS × the rbac `visible`
// set), split by `section` into core | divider | utility, with the active dot
// from `useActiveTool` — no third nav list exists. Desktop-only (`hidden
// md:flex`, CSS-gated so there is no hydration wobble); below md the off-canvas
// drawer is untouched. Pin state is owned by ShellChrome (drives the content
// padding); the Dock only reflects it and calls back to toggle.
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'
import { TOOLS, type TowerTool } from '@/shell/navigation/registry'
import { useActiveTool } from '@/shell/navigation/useActiveTool'
import { NAV_ICONS } from '@/components/shell/nav-icons'

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
  locale = DEFAULT_LOCALE,
}: {
  visible: Set<ModuleId>
  pinned: boolean
  onTogglePinned: () => void
  onOpenSearch: () => void
  locale?: Locale
}) {
  const active = useActiveTool()
  const [revealed, setRevealed] = useState(false)

  const tools = TOOLS.filter((tl) => visible.has(tl.id))
  const core = tools.filter((tl) => tl.section === 'core')
  const utility = tools.filter((tl) => tl.section === 'utility')

  // Auto-hidden: shown only while revealed (pointer in the summon zone or
  // keyboard focus inside). Pinned: always shown.
  const shown = pinned || revealed

  return (
    <>
      {/* Summon zone — a thin bottom-edge hover catcher, only when auto-hidden.
          Un-reveal on leave too, so a pointer that dips in and back out (never
          entering the dock) doesn't leave it stuck open (review F-P4a-1). */}
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
        {core.map((tl) => (
          <DockTile key={tl.id} tool={tl} active={active?.id === tl.id} locale={locale} />
        ))}

        <span aria-hidden className="mac-dock-div" />

        {utility.map((tl) => (
          <DockTile key={tl.id} tool={tl} active={active?.id === tl.id} locale={locale} />
        ))}

        {/* ⌘K search trigger (an action, not a route). */}
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

        {/* Auto-hide / pin toggle. */}
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
