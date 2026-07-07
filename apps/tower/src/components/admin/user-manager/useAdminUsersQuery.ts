'use client'

// Thin TanStack Query wrapper over the `listUsers` server action.
import { useQuery } from '@tanstack/react-query'
import { listUsers, type AdminUserRow } from '@/lib/actions/admin'

export const ADMIN_USERS_KEY = ['tower', 'admin', 'users'] as const

export function useAdminUsersQuery() {
  return useQuery<AdminUserRow[], Error>({
    queryKey: ADMIN_USERS_KEY,
    queryFn: async () => {
      const result = await listUsers()
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
  })
}
