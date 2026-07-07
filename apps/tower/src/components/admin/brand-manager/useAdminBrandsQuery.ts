'use client'

// Thin TanStack Query wrapper over the `listBrands` server action.
import { useQuery } from '@tanstack/react-query'
import { listBrands, type BrandRow } from '@/lib/actions/admin'

export const ADMIN_BRANDS_KEY = ['tower', 'admin', 'brands'] as const

export function useAdminBrandsQuery() {
  return useQuery<BrandRow[], Error>({
    queryKey: ADMIN_BRANDS_KEY,
    queryFn: async () => {
      const result = await listBrands()
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
  })
}
