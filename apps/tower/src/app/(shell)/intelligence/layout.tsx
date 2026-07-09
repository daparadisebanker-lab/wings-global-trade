import type { ReactNode } from 'react'
import { IntelligenceQueryProvider } from './IntelligenceQueryProvider'

// Wraps every /intelligence route with the scoped TanStack Query client
// (TriageQueue / SpecExtractReview's server-backed queries read through it).
export default function IntelligenceLayout({ children }: { children: ReactNode }) {
  return <IntelligenceQueryProvider>{children}</IntelligenceQueryProvider>
}
