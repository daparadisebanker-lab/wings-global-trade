// Action stamp for an audit row — uppercase mono, dot + label, readable
// without color (DESIGN_SYSTEM status language). INSERT reads positive,
// DELETE alarm, UPDATE neutral-amber; the glyph + word carry the meaning so
// color is never the only signal.
import type { AuditAction } from '@/lib/actions/audit-logic'

const STYLE: Record<AuditAction, { dot: string; text: string; glyph: string; label: string }> = {
  INSERT: { dot: 'bg-positive', text: 'text-positive', glyph: '+', label: 'INSERT' },
  UPDATE: { dot: 'bg-accent', text: 'text-accent', glyph: '~', label: 'UPDATE' },
  DELETE: { dot: 'bg-negative', text: 'text-negative', glyph: '−', label: 'DELETE' },
}

export function ActionStamp({ action }: { action: AuditAction }) {
  const s = STYLE[action] ?? STYLE.UPDATE
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-label uppercase tracking-[0.1em] ${s.text}`}>
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot}`} />
      <span aria-hidden className="w-2 text-center">
        {s.glyph}
      </span>
      {s.label}
    </span>
  )
}
