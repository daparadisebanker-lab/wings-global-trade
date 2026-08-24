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

// WGT/07's route migration landed 2026-08-24 (see programs/automobiles/
// SCOPE.md) — automoviles now lives at its own top-level /automoviles, so
// laneFromPath() resolves it and LaneScope stamps data-lane="automoviles"
// on <html> exactly like it does for interiores: the global SiteNav/Footer
// chrome themes itself (asphalt ground, white CTA fill) on every
// automóviles page, not just the lane's own content.
export const LANES = [interiores, automoviles] as const

/** `/interiores/azulejos` → `interiores`. Null on every non-lane route. */
export function laneFromPath(path: string | null | undefined): string | null {
  if (!path) return null
  const first = path.split('/').filter(Boolean)[0]
  return LANES.some((l) => l.slug === first) ? first : null
}
