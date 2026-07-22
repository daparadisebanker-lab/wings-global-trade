'use client'

// The single active-tool derivation (TOWER-REDESIGN §5) — so the nav rail's
// active item, the breadcrumb, and (next) the Dock dot + Control Center
// highlight can never disagree. Replaces the duplicated `pathname.startsWith`
// checks that previously lived in NavRail and ShellChrome's Breadcrumb.
import { usePathname } from 'next/navigation'
import { resolveActiveTool, type TowerTool } from './registry'

export function useActiveTool(): TowerTool | null {
  const pathname = usePathname()
  return resolveActiveTool(pathname)
}
