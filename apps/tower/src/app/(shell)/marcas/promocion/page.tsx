import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { PromoWorkbench } from '@/components/marcas'
import { listPromotableContainers } from '@/lib/actions/container-promo'

// Promoción de contenedores (container-promotion feature, root CLAUDE.md §5-bis).
// Server-fetches the containers the user may promote (RLS: a rep sees only their
// brands', a group admin sees all) and hands them to the marketing workbench.
export default async function PromocionPage() {
  const result = await listPromotableContainers()

  if (result.error) {
    return (
      <EmptyState
        tag="MRC · Promoción"
        title={{ es: 'Promoción de contenedores', en: 'Container promotion' }}
        description={{
          es: 'No se pudieron cargar los contenedores. Intenta de nuevo.',
          en: 'Could not load containers. Please try again.',
        }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">MRC · Promoción de contenedores</span>
          <h1 className="font-display text-t2 text-ink-primary">Promoción de contenedores</h1>
        </div>
        <Link
          href="/marcas"
          className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
        >
          ← Marcas
        </Link>
      </header>
      <PromoWorkbench initialRows={result.data} />
    </div>
  )
}
