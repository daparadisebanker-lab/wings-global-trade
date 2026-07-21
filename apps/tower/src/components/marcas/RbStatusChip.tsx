// Represented-brand status chip — DESIGN_SYSTEM "Status language": stamped,
// uppercase mono, dot + label, never color alone. Mirrors the admin StatusChip
// but keyed to the RB lifecycle. Note ENDED reads muted-strikethrough, not
// alarm red: red is spent only on true failure states (FAIL/OVER-CAPACITY/
// EXPIRED) so it never inflates — a lifecycle end is not a failure.
import { cn } from '@wings/trade-ui'
import type { RbStatus } from '@/lib/actions/represented-brands-logic'

type Tone = 'neutral' | 'accent' | 'positive' | 'muted'

const TONE_CLASS: Record<Tone, { dot: string; text: string }> = {
  neutral: { dot: 'bg-ink-secondary', text: 'text-ink-secondary' },
  accent: { dot: 'bg-accent', text: 'text-accent' },
  positive: { dot: 'bg-positive', text: 'text-positive' },
  muted: { dot: 'bg-ink-secondary', text: 'text-ink-secondary line-through' },
}

const RB_TONE: Record<RbStatus, Tone> = {
  PROSPECT: 'neutral',
  NEGOTIATION: 'neutral',
  SIGNED: 'neutral',
  ONBOARDING: 'accent',
  BRAND_REVIEW: 'accent',
  LIVE: 'positive',
  PAUSED: 'muted',
  ENDED: 'muted',
}

export function RbStatusChip({ status, className }: { status: RbStatus; className?: string }) {
  const s = TONE_CLASS[RB_TONE[status]]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.1em]',
        s.text,
        className,
      )}
    >
      <span aria-hidden className={cn('inline-block h-1.5 w-1.5 rounded-full', s.dot)} />
      {status}
    </span>
  )
}
