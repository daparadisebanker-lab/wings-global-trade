'use client'

import Link from 'next/link'
import type { ContainerRow } from '@/lib/actions/containers-types'
import { FillBar } from './FillBar'
import { StatusChip } from './StatusChip'

// COMPONENT_TREE §3: "<ContainerCard> code stamp · <FillBar> committed/
// capacity CBM · mode chip (SHARED/DEDICATED) · ETD"
export function ContainerCard({ container }: { container: ContainerRow }) {
  return (
    <Link
      href={`/containers/${container.id}`}
      className="flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4 transition-[border-color,transform] duration-150 hover:border-lane-accent motion-safe:hover:-translate-y-px"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-t0 text-ink-primary" data-numeric>
          {container.code}
        </span>
        <span className="rounded-card border border-line px-2 py-0.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
          {container.mode}
        </span>
      </div>

      <FillBar
        committedCbm={container.committedCbm}
        capacityCbm={container.capacityCbm}
        fillPercent={container.fillPercent}
      />

      <div className="flex items-center justify-between">
        <StatusChip status={container.status} />
        <span className="font-mono text-label text-ink-secondary" data-numeric>
          {container.kind}
          {container.route.etd ? ` · ETD ${container.route.etd}` : ''}
        </span>
      </div>
    </Link>
  )
}
