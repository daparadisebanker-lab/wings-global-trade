// src/lib/category-href.ts
//
// Every pre-lane category resolves to /catalogo/{slug} — except automóviles,
// which moved to its own lane route (/automoviles) as part of the WGT/07
// Phase 3 migration (see programs/automobiles/SCOPE.md §5). Nine different
// nav/grid components each built `/catalogo/${slug}` inline; centralizing
// the one exception here beats patching the same conditional into all nine.
// /catalogo/automoviles itself still resolves (redirected in
// next.config.mjs) for anything external that already linked or indexed
// the old URL — this helper is for the site's OWN links, which should
// point at the canonical URL directly rather than bounce through a redirect.
export function categoryHref(slug: string): string {
  return slug === 'automoviles' ? '/automoviles' : `/catalogo/${slug}`
}
