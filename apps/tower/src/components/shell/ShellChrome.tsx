'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { CommandPalette } from './CommandPalette'
import { LaneSwitcher } from './LaneSwitcher'
import { NavRail } from './NavRail'
import { TopBar } from './TopBar'
import type { LaneMembership } from '@/lib/lanes/memberships'
import { visibleModules, type Role } from '@/lib/rbac'

/**
 * TowerShell client chrome (COMPONENT_TREE). Wraps every (shell) screen with the
 * stamp rail, module nav, top bar, ⌘K palette and a notifications stub. Data is
 * fetched server-side and passed in; this layer owns interaction only:
 *  - active lane selection → sets --lane-accent on the shell root (tints
 *    stamps/series/chips ONLY; surfaces stay graphite).
 *  - ⌘K / Ctrl-K toggles the command palette (everything keyboard reachable).
 */
export function ShellChrome({
  memberships,
  userEmail,
  isGroupAdmin = false,
  children,
}: {
  memberships: LaneMembership[]
  userEmail: string | null
  isGroupAdmin?: boolean
  children: ReactNode
}) {
  const [activeLaneId, setActiveLaneId] = useState<string | null>(
    memberships[0]?.laneId ?? null,
  )
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const roles = useMemo(() => memberships.map((m) => m.role) as Role[], [memberships])
  const visible = useMemo(() => visibleModules(roles, isGroupAdmin), [roles, isGroupAdmin])

  const activeLane = memberships.find((m) => m.laneId === activeLaneId) ?? null
  const rootStyle = activeLane?.accent
    ? ({ '--lane-accent': activeLane.accent } as CSSProperties)
    : undefined

  return (
    <div style={rootStyle} className="min-h-screen bg-surface-0 text-ink-primary">
      <div className="grid grid-cols-[minmax(220px,260px)_1fr]">
        <aside className="sticky top-0 h-screen overflow-y-auto border-r border-line bg-surface-1">
          <div className="border-b border-line p-4">
            <span className="font-mono text-t1 tracking-[0.22em] text-ink-primary">TOWER</span>
          </div>
          <LaneSwitcher
            lanes={memberships}
            activeLaneId={activeLaneId}
            onSelect={setActiveLaneId}
          />
          <NavRail visible={visible} />
        </aside>

        <div className="flex min-h-screen flex-col">
          <TopBar
            userEmail={userEmail}
            isGroupAdmin={isGroupAdmin}
            onOpenSearch={() => setPaletteOpen(true)}
          />
          <main data-lane={activeLane?.laneSlug} className="flex-1">
            {children}
          </main>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
