import { CatalogBrowse } from '@/components/catalog/catalog-browse'
import { listBrowseCategories } from '@/lib/actions/catalog'

// Read-only cross-category catalog browse for the "pure rep" persona (RB read
// across the PUBLISHED catalog via tower_31, no editable lane). Server-fetches
// the bounded category facet list (RLS-scoped), then hands off to the
// client-side, server-paginated CatalogBrowse. RLS is the boundary — this
// surface never offers an edit affordance.
export default async function CatalogBrowsePage() {
  const categoriesResult = await listBrowseCategories()
  const categories = categoriesResult.data ?? []

  return <CatalogBrowse categories={categories} />
}
