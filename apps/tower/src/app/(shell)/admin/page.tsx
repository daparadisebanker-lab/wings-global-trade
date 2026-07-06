import { EmptyState } from '@/components/ui/EmptyState'

// Admin — Wave 5. Placeholder shell surface.
export default function AdminPage() {
  return (
    <EmptyState
      tag="ADM · Admin"
      title={{ es: 'Administración', en: 'Admin' }}
      description={{
        es: 'Usuarios y memberships, registro de lanes (códigos append-only), marcas, auditoría y webhooks. En construcción.',
        en: 'Users and memberships, lane registry (append-only codes), brands, audit, and webhooks. Under construction.',
      }}
    />
  )
}
