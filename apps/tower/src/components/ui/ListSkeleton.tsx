// Loading placeholder for card lists — pulsing blocks so a phone on a slow
// connection sees structure during the first fetch instead of an empty box
// (the lists are client-fetched after mount). Reduced-motion drops the pulse;
// a role=status + sr-only label announces the load to assistive tech.
export function ListSkeleton({
  rows = 5,
  label = 'Cargando… / Loading…',
  className = '',
}: {
  rows?: number
  label?: string
  className?: string
}) {
  return (
    <div role="status" className={`flex flex-col gap-3 ${className}`}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="h-20 animate-pulse rounded-card border border-line bg-surface-1 motion-reduce:animate-none"
        />
      ))}
    </div>
  )
}
