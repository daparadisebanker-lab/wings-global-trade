'use client'

// Thin TanStack Query wrapper over the read-only `listBrowseProducts` server
// action. Server-paginated (cursor), PUBLISHED-only, cross-category — the
// pure-rep browse mirror of catalog Studio's useProductsQuery.
import { useQuery } from '@tanstack/react-query'
import { listBrowseProducts, type BrowseProductsInput, type ProductListPage } from '@/lib/actions/catalog'

export function useBrowseQuery(input: BrowseProductsInput) {
  return useQuery<ProductListPage, Error>({
    queryKey: ['tower', 'catalog', 'browse', input],
    queryFn: async () => {
      const result = await listBrowseProducts(input)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    placeholderData: (previous) => previous,
  })
}
