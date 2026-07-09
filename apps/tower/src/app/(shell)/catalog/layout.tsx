import type { ReactNode } from 'react'
import { CatalogQueryProvider } from './CatalogQueryProvider'

// Wraps every /catalog route with the scoped TanStack Query client
// (ProductTable's server-paginated list reads through it).
export default function CatalogLayout({ children }: { children: ReactNode }) {
  return <CatalogQueryProvider>{children}</CatalogQueryProvider>
}
