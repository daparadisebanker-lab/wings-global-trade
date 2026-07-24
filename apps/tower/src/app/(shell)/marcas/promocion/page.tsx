import Link from 'next/link'
import { MarketingStudio } from '@/components/marcas'
import { listPromotableContainers } from '@/lib/actions/container-promo'
import { getMyRepProfile } from '@/lib/actions/rep-profile'
import { listShareRecipients } from '@/lib/actions/share-recipients'

// Estudio de marketing (root CLAUDE.md §5-bis). One space, three sources —
// Contenedor (an active allocation), Catálogo (a listed product) and Prueba (an
// unlisted market probe) — sharing one Wings compose→share pipeline. Server-
// fetches the containers a rep may promote (RLS), the reachable client contacts
// for the share picker, and the rep's own WhatsApp line so shares open from their
// number (tower_39). The Catálogo product list loads client-side from the studio.
export default async function PromocionPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const [result, repProfile, recipientsResult, params] = await Promise.all([
    listPromotableContainers(),
    getMyRepProfile(),
    listShareRecipients(),
    searchParams,
  ])
  const rep = repProfile.data ?? null
  // Reachable client contacts for the share picker; RLS-scoped, empty on error.
  const recipients = recipientsResult.error ? [] : recipientsResult.data
  // Containers are just ONE source; a container-load error must not block the
  // Catálogo / Prueba sources — degrade to an empty container list.
  const containerRows = result.error ? [] : result.data

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">MRC · Estudio de marketing</span>
          <h1 className="font-display text-t2 text-ink-primary">Estudio de marketing</h1>
        </div>
        <Link
          href="/marcas"
          className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
        >
          ← Marcas
        </Link>
      </header>
      <MarketingStudio
        containerRows={containerRows}
        containersDegraded={Boolean(result.error)}
        initialContainerId={params.c}
        recipients={recipients}
        repWhatsappE164={rep?.whatsappE164 ?? null}
        repWhatsappLabel={rep?.whatsappLabel ?? null}
      />
    </div>
  )
}
