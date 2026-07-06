'use client'

// Thin TanStack Query wrapper over the `listProducts` server action.
// Server-paginated (cursor), per ARCHITECTURE "Data grid: TanStack Table +
// TanStack Query … server pagination".
import { useQuery } from '@tanstack/react-query'
import { listProducts, type ListProductsInput, type ProductListPage } from '@/lib/actions/catalog'

export function useProductsQuery(input: ListProductsInput) {
  return useQuery<ProductListPage, Error>({
    queryKey: ['tower', 'catalog', 'products', input],
    queryFn: async () => {
      const result = await listProducts(input)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    placeholderData: (previous) => previous,
  })
}
