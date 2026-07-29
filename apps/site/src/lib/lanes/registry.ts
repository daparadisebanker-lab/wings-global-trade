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

export const LANES = [interiores] as const

/** `/interiores/azulejos` → `interiores`. Null on every non-lane route. */
export function laneFromPath(path: string | null | undefined): string | null {
  if (!path) return null
  const first = path.split('/').filter(Boolean)[0]
  return LANES.some((l) => l.slug === first) ? first : null
}
