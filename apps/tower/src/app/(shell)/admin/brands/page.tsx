import { BrandManager } from '@/components/admin/brand-manager'

// BrandManager page. Fully client-fetched (useAdminBrandsQuery); the layout
// already guards group-admin access.
export default function AdminBrandsPage() {
  return <BrandManager />
}
