import { EmptyState } from '@/components/ui/EmptyState'
import { RepresentedBrandManager } from '@/components/marcas'
import { listRepresentedBrands } from '@/lib/actions/represented-brands'

// Marcas Representadas (RB Console Wave 1, Ch 01) — the TOWER write-side over the
// shipped rb_wave1 backend. Server-fetches the brands the user can see (RLS: a
// rep sees only their own; a group admin sees all), hands to the client manager.
export default async function MarcasPage() {
  const result = await listRepresentedBrands()

  if (result.error) {
    return (
      <EmptyState
        tag="MRC · Marcas"
        title={{ es: 'Marcas representadas', en: 'Represented brands' }}
        description={{
          es: 'No se pudieron cargar las marcas. Intenta de nuevo.',
          en: 'Could not load brands. Please try again.',
        }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">MRC · Marcas Representadas</span>
        <h1 className="font-ui text-t2 text-ink-primary">Marcas representadas (RB)</h1>
      </header>
      <RepresentedBrandManager initialBrands={result.data} />
    </div>
  )
}
