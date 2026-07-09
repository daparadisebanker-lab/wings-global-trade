// Committed/capacity CBM visualizer — DESIGN_SYSTEM: thin rules not shadows,
// mono numerals for the figures, amber/green only. This is the operational
// (ContainerBoard/detail) instrument; the public FillMeter3D visualizer lives
// on the site side and reads the same numbers via /api/public/fill.
export function FillBar({
  committedCbm,
  capacityCbm,
  fillPercent,
  className,
}: {
  committedCbm: number
  capacityCbm: number
  fillPercent: number
  className?: string
}) {
  const overCapacity = committedCbm > capacityCbm
  return (
    <div className={`flex flex-col gap-1 ${className ?? ''}`}>
      <div className="h-1.5 w-full overflow-hidden rounded-card bg-surface-0">
        <div
          className={`h-full ${overCapacity ? 'bg-negative' : 'bg-positive'}`}
          style={{ width: `${Math.min(100, fillPercent)}%` }}
        />
      </div>
      <div className="flex items-baseline justify-between font-mono text-label text-ink-secondary" data-numeric>
        <span className={overCapacity ? 'text-negative' : ''}>
          {committedCbm.toFixed(1)} / {capacityCbm.toFixed(1)} CBM
        </span>
        <span className={overCapacity ? 'text-negative' : ''}>{fillPercent.toFixed(0)}%</span>
      </div>
    </div>
  )
}
