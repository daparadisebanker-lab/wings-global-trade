import type { ReactNode } from 'react'
import { ContainersQueryProvider } from './ContainersQueryProvider'

// Wraps every /containers route with the scoped TanStack Query client
// (ContainerBoard + the detail organs all read through it).
export default function ContainersLayout({ children }: { children: ReactNode }) {
  return <ContainersQueryProvider>{children}</ContainersQueryProvider>
}
