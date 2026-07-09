'use client'

// Thin TanStack Query wrapper over the `listContainers` server action —
// server-paginated (cursor), same shape as Catalog Studio's useProductsQuery
// (ARCHITECTURE "Data grid: TanStack Table + TanStack Query … server pagination").
import { useQuery } from '@tanstack/react-query'
import { listContainers, type ContainerListPage, type ListContainersInput } from '@/lib/actions/containers'

export function useContainersQuery(input: ListContainersInput) {
  return useQuery<ContainerListPage, Error>({
    queryKey: ['tower', 'containers', 'list', input],
    queryFn: async () => {
      const result = await listContainers(input)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    placeholderData: (previous) => previous,
  })
}
