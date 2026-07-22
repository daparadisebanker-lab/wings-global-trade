'use client'

// Container detail — composes the Container Desk organs (COMPONENT_TREE §3:
// FillMeter3D-as-instrument · CommitmentsTable · POPanel · DocumentVault ·
// CostSheet). FillMeter3D itself is the public site's visualizer reused as an
// operational instrument — out of this wave's ownership (a site-side organ).
// ContainerCubicaje (Phase D) now carries the fill visual here: the FitScene
// isometric cube, surfaced on the container's own detail — reachable beyond Mister.
import { useState } from 'react'
import Link from 'next/link'
import { CommitmentsTable } from '../commitments-table'
import { CostSheet } from '../cost-sheet'
import { StatusChip } from '../container-board'
import { ContainerCubicaje } from './ContainerCubicaje'
import { DocumentVault } from '../document-vault'
import { POPanel } from '../po-panel'
import { QcTracker } from '../qc-tracker'
import type { ContainerRow } from '@/lib/actions/containers-types'
import type { ContainerCapabilities } from '@/lib/actions/containers-logic'

export function ContainerDetail({
  container,
  capabilities,
}: {
  container: ContainerRow
  capabilities: ContainerCapabilities
}) {
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-3 border-b border-line pb-4">
        <Link href="/containers" className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary">
          ← Contenedores / Containers
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-mono text-t3 text-ink-primary" data-numeric>
              {container.code}
            </span>
            <StatusChip status={container.status} />
          </div>
          <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
            {container.kind} · {container.mode}
            {container.route.origin || container.route.destination
              ? ` · ${container.route.origin ?? '?'} → ${container.route.destination ?? '?'}`
              : ''}
          </span>
        </div>
      </div>

      <ContainerCubicaje
        code={container.code}
        committedCbm={container.committedCbm}
        capacityCbm={container.capacityCbm}
        fillPercent={container.fillPercent}
      />

      <section>
        <CommitmentsTable containerId={container.id} canCommit={capabilities.canCommit} />
      </section>

      <section>
        <POPanel
          containerId={container.id}
          laneId={container.laneId}
          canWrite={capabilities.canWrite}
          selectedPoId={selectedPoId}
          onSelectPo={setSelectedPoId}
        />
      </section>

      <section>
        <QcTracker purchaseOrderId={selectedPoId} canWrite={capabilities.canWrite} />
      </section>

      <section>
        <DocumentVault containerId={container.id} canWrite={capabilities.canWrite} />
      </section>

      <section>
        <CostSheet
          containerId={container.id}
          capacityCbm={container.capacityCbm}
          committedCbm={container.committedCbm}
          canWrite={capabilities.canWrite}
        />
      </section>
    </div>
  )
}
