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
  /** "¿Qué formato?" — the comparison a buyer needs before they filter. */
  formatos: `${PASILLO_BASE}/formatos`,
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

// ── Deep links ─────────────────────────────────────────────────────────────
// Series and SKUs address as query params on the four existing routes, never as
// new path segments: lane slugs are append-only and permanent, and a params
// approach costs no URL commitment.
//
// This exists because procurement is multi-party. The buyer is working against a
// specification someone else wrote, and without a link the only way to ask that
// person "is this the one?" is a screenshot — which is precisely the failure the
// volume footer was built to end. A screenshot carries no code, no coverage and
// no carton count.

export const PARAM_SERIES = 'serie'
export const PARAM_SKU = 'sku'
/** Preselects a format filter in the Lista — the handoff out of "¿Qué formato?",
 *  so the comparison lands the buyer IN the filtered catalogue rather than at a
 *  page that tells them to go and filter it themselves. */
export const PARAM_FORMAT = 'formato'

/** A link to one booth in the aisle. */
export function seriesHref(seriesUid: string, base: string = PASILLO_ROUTES.lane): string {
  return `${base}?${PARAM_SERIES}=${encodeURIComponent(seriesUid)}`
}

/** A link that opens one SKU's sheet, on whichever view the buyer should land in. */
export function skuHref(code: string, base: string = PASILLO_ROUTES.lane): string {
  return `${base}?${PARAM_SKU}=${encodeURIComponent(code)}`
}
