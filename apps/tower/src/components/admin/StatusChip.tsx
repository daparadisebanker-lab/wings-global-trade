// Shared status chip for the Admin module — DESIGN_SYSTEM "Status language":
// stamped, uppercase mono, dot + label, never color alone. Mirrors the catalog
// StatusStamp but keyed to the admin lifecycles (lane OPENING/ACTIVE/ARCHIVED,
// brand ACTIVE/RETIRED). in-motion states (OPENING) carry the one permitted
// ambient pulse.
import type { LaneStatus, BrandStatus } from '@/lib/actions/admin-logic'

type Tone = 'neutral' | 'accent' | 'positive' | 'muted'

const TONE_CLASS: Record<Tone, { dot: string; text: string }> = {
  neutral: { dot: 'bg-ink-secondary', text: 'text-ink-secondary' },
  accent: { dot: 'bg-accent tower-pulse', text: 'text-accent' },
  positive: { dot: 'bg-positive', text: 'text-positive' },
  muted: { dot: 'bg-ink-secondary', text: 'text-ink-secondary line-through' },
}

const LANE_TONE: Record<LaneStatus, Tone> = {
  OPENING: 'accent',
  ACTIVE: 'positive',
  ARCHIVED: 'muted',
}

const BRAND_TONE: Record<BrandStatus, Tone> = {
  ACTIVE: 'positive',
  RETIRED: 'muted',
}

function Chip({ label, tone, className }: { label: string; tone: Tone; className?: string }) {
  const s = TONE_CLASS[tone]
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.1em] ${s.text} ${className ?? ''}`}
    >
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  )
}

export function LaneStatusChip({ status, className }: { status: LaneStatus; className?: string }) {
  return <Chip label={status} tone={LANE_TONE[status]} className={className} />
}

export function BrandStatusChip({ status, className }: { status: BrandStatus; className?: string }) {
  return <Chip label={status} tone={BRAND_TONE[status]} className={className} />
}
