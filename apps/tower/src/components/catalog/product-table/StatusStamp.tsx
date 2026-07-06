// Shared status chip — DESIGN_SYSTEM "Status language": stamped, uppercase
// mono, dot + label (never color alone). Reused by ProductTable, PublishBar,
// and VersionHistory (all within this wave's ownership).
import type { ProductStatus } from '@/lib/actions/catalog-logic'

const STYLES: Record<ProductStatus, { dot: string; text: string; label: string }> = {
  DRAFT: { dot: 'bg-ink-secondary', text: 'text-ink-secondary', label: 'DRAFT' },
  IN_REVIEW: { dot: 'bg-accent tower-pulse', text: 'text-accent', label: 'IN_REVIEW' },
  PUBLISHED: { dot: 'bg-positive', text: 'text-positive', label: 'PUBLISHED' },
  RETIRED: { dot: 'bg-ink-secondary', text: 'text-ink-secondary line-through', label: 'RETIRED' },
}

export function StatusStamp({ status, className }: { status: ProductStatus; className?: string }) {
  const style = STYLES[status]
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-label uppercase tracking-[0.1em] ${style.text} ${className ?? ''}`}>
      <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
