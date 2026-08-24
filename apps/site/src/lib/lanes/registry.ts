// Which lane, if any, owns the current route.
//
// The site chrome (SiteNav, TrustFooter) is a sibling of the lane wrapper in the
// root layout, so it cannot see `[data-lane]` through the cascade. This resolves
// the lane from the path so the chrome can be stamped at the document root and
// theme itself — the alternative was a second, forked navigation per lane, which
// root §1.1 forbids outright.
//
// Append a slug here when a lane opens. Codes and slugs are permanent.

import { lane as interiores } from '@wings/liveries/interiores/lane.config'
import { lane as automoviles } from '@wings/liveries/automoviles/lane.config'

// WGT/07 registered but not yet path-resolvable: its route still lives at
// /catalogo/automoviles (Phase 3, route migration, pending — see
// programs/automobiles/SCOPE.md §5). laneFromPath() below only matches a
// lane living at its own top-level /{slug}, so this entry is inert for
// chrome-theming purposes until that migration ships; it's added now so the
// footer's Divisiones column (which reads this array directly, not the
// path resolver) states the lane truthfully in the meantime.
export const LANES = [interiores, automoviles] as const

/** `/interiores/azulejos` → `interiores`. Null on every non-lane route. */
export function laneFromPath(path: string | null | undefined): string | null {
  if (!path) return null
  const first = path.split('/').filter(Boolean)[0]
  return LANES.some((l) => l.slug === first) ? first : null
}
