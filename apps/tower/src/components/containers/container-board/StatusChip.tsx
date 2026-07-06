// Shared status chip for Container Desk — DESIGN_SYSTEM "Status language":
// stamped, uppercase mono, dot + label, never color alone. In-motion states
// (FILLING, IN_TRANSIT) pulse via the single permitted ambient animation
// (globals.css `.tower-pulse`, off under prefers-reduced-motion).
import type { ContainerStatus } from '@/lib/actions/containers-types'

const STYLES: Record<ContainerStatus, { dot: string; text: string; pulse?: boolean }> = {
  OPEN: { dot: 'bg-ink-secondary', text: 'text-ink-secondary' },
  FILLING: { dot: 'bg-accent', text: 'text-accent', pulse: true },
  BOOKED: { dot: 'bg-accent', text: 'text-accent' },
  IN_TRANSIT: { dot: 'bg-accent', text: 'text-accent', pulse: true },
  ARRIVED: { dot: 'bg-positive', text: 'text-positive' },
  CLEARED: { dot: 'bg-positive', text: 'text-positive' },
  CLOSED: { dot: 'bg-ink-secondary', text: 'text-ink-secondary line-through' },
}

export function StatusChip({ status, className }: { status: ContainerStatus; className?: string }) {
  const style = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.1em] ${style.text} ${className ?? ''}`}
    >
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot} ${style.pulse ? 'tower-pulse' : ''}`} />
      {status}
    </span>
  )
}
