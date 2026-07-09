import type { ReactNode } from 'react'
import { PipelineQueryProvider } from './PipelineQueryProvider'

// Wraps every /pipeline route with the scoped TanStack Query client
// (PipelineBoard/RfqDetail's server-backed queries read through it).
export default function PipelineLayout({ children }: { children: ReactNode }) {
  return <PipelineQueryProvider>{children}</PipelineQueryProvider>
}
