import type { ReactNode } from 'react'
import { AuditQueryProvider } from './AuditQueryProvider'

// Wraps /admin/audit with its scoped TanStack Query client (the AuditExplorer's
// server-paginated list reads through it).
export default function AuditLayout({ children }: { children: ReactNode }) {
  return <AuditQueryProvider>{children}</AuditQueryProvider>
}
