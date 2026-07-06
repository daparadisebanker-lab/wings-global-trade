// Re-exports the shared comparison context as a hook so all components
// share one state instance rather than creating independent localStorage copies.
export type { ComparisonItem } from '@/contexts/comparison-context'
export { useComparisonContext as useComparison } from '@/contexts/comparison-context'

// Backwards-compat type alias consumed by CompareBar / ProductCard / ProductPassport
export type UseComparison = ReturnType<typeof import('@/contexts/comparison-context').useComparisonContext>
