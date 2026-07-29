// Which route family owns which scoped experience.
//
// The site is no longer one catalogue. It carries WGT/01 machinery under
// /catalogo, WGT/02 Interiores under /interiores, and represented brands under
// /marcas — three product worlds with different buyers, different unit math and
// different tools. A tool built for one of them is not a site feature; it is
// that world's feature, and it has to say so.
//
// Compare and multi-inquiry were both written when /catalogo WAS the site.
// Their only gate was "do I have items?", so a buyer who selected two tractors
// and then walked into Interiores found a machinery compare tray floating over
// the tile aisle. The state was still valid; the surface was not.
//
// Declare the family here, once. `src/pasillo/lib/routes.ts` does the same for
// the aisle via isAislePath(); never re-derive either predicate inline.

/** WGT/01 machinery: the catalogue and the JDM engine pages beside it. */
const MACHINERY_PREFIXES = ['/catalogo', '/repuestos'] as const

/**
 * Is this route inside the machinery world?
 *
 * Compare, multi-inquiry and anything else built against `products` belongs
 * here and nowhere else. Note that /repuestos IS machinery — the compare tray
 * excluded it by name for its own reasons, which is a display decision for that
 * page to make, not a statement about which world it is in.
 */
export function isMachineryPath(path: string | null | undefined): boolean {
  if (!path) return false
  return MACHINERY_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
}
