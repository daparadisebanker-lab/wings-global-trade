'use client'

// Palette record search — wired to EXISTING server actions ONLY (P6 hard rule:
// no new search tables/RPCs/service). Products is the one record type with both
// a free-text endpoint (listProducts({ search })) and a detail route
// (/catalog/[id]). Other record types are skipped for now — either they have no
// text-search surface or no per-record route to land on (see REDESIGN-NOTES P6).
// RBAC: gated on the same `visible` module set the rail uses; RLS remains the
// real boundary (Directive 1).
import { useQuery } from '@tanstack/react-query'
import { listProducts } from '@/lib/actions/catalog'
import type { Localized } from '@/lib/i18n'
import type { ModuleId } from '@/lib/nav'

export interface RecordHit {
  /** Stable React/cmdk key. */
  key: string
  href: string
  label: Localized
  tag: string
  moduleId: ModuleId
}

export function useRecordSearch(term: string, visible?: Set<ModuleId>) {
  // Only query once there are ≥2 chars AND the operator can see the module.
  const canProducts = term.length >= 2 && (!visible || visible.has('catalog'))

  const products = useQuery({
    // Palette-specific key so it never collides with the catalog table's cache.
    queryKey: ['palette', 'products', term],
    enabled: canProducts,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await listProducts({ search: term, limit: 10 })
      return res.data?.rows ?? []
    },
  })

  const hits: RecordHit[] = (products.data ?? []).map((p) => ({
    key: `catalog:${p.id}`,
    href: `/catalog/${p.id}`,
    label: p.name,
    tag: 'CAT',
    moduleId: 'catalog',
  }))

  return { hits, isFetching: canProducts && products.isFetching }
}
