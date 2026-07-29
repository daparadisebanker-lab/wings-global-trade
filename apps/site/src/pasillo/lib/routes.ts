// The aisle is mounted inside the live Wings site as the first catalogue of
// WGT/02 Interiores, not served from its own origin, so no view may carry a
// bare route literal. The mount point is stated once, here, and every link
// derives from it — the same rule the catalogue applies to series truth.
//
// NAMING, and it is deliberate: the buyer-facing name of this catalogue is
// "Azulejos". "El Pasillo" is the *interaction* — the aisle you walk — and it
// belongs in the spec, the code and the build log, never in navigation. A buyer
// looking for tiles does not scan a menu for a corridor.

export const LANE_SLUG = 'interiores'
export const CATALOGUE_SLUG = 'azulejos'

export const LANE_BASE = `/${LANE_SLUG}`
export const PASILLO_BASE = `${LANE_BASE}/${CATALOGUE_SLUG}`

export const PASILLO_ROUTES = {
  lane: PASILLO_BASE,
  lista: `${PASILLO_BASE}/lista`,
  muestrario: `${PASILLO_BASE}/muestrario`,
  mesa: `${PASILLO_BASE}/mesa`,
  /** Back out to the lane that owns this catalogue. */
  parent: LANE_BASE,
} as const

/**
 * True for every route the aisle owns — and only those. The lane landing page
 * at /interiores is NOT included: it is an ordinary Wings page and keeps the
 * full site chrome. Only the aisle takes the viewport.
 */
export function isAislePath(path: string | null | undefined): boolean {
  return !!path && (path === PASILLO_BASE || path.startsWith(`${PASILLO_BASE}/`))
}
