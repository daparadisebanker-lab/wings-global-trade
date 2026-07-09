import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { getIsGroupAdmin } from '@/lib/lanes/memberships'
import { AdminQueryProvider } from './AdminQueryProvider'

/**
 * Admin is a group-admin-only module. This server guard hides the whole surface
 * from non-admins — PRESENTATION ONLY (the real boundary is each server action's
 * requireGroupAdmin + RLS; a non-admin hitting an action still gets FORBIDDEN).
 * The group-admin flag is read from the DB (profiles.is_group_admin), never
 * client state.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const isGroupAdmin = await getIsGroupAdmin()

  if (!isGroupAdmin) {
    return (
      <EmptyState
        tag="ADM · Admin"
        title={{ es: 'Acceso restringido', en: 'Restricted' }}
        description={{
          es: 'La administración es solo para administradores del grupo.',
          en: 'Administration is available to group admins only.',
        }}
      />
    )
  }

  return <AdminQueryProvider>{children}</AdminQueryProvider>
}
