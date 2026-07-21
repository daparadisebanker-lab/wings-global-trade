import { EmptyState } from '@/components/ui/EmptyState'
import { QuotationsWindow } from '@/components/quotations'
import { listQuotations } from '@/lib/actions/quotations'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Quotations window — a standalone list of quotations (draft + issued), each
// linking to its printable proforma. RLS-scoped via listQuotations. Server-
// rendered; mirrors the Signals/Container-desk force-dynamic pattern.
export const dynamic = 'force-dynamic'

const TAG = 'COT · Cotizaciones'
const TITLE = { es: 'Cotizaciones', en: 'Quotations' }

export default async function QuotationsPage() {
  const result = await listQuotations()

  if (result.error) {
    return (
      <EmptyState
        tag={TAG}
        title={TITLE}
        description={{
          es: 'No se pudieron cargar las cotizaciones. Intenta de nuevo.',
          en: 'Could not load quotations. Please try again.',
        }}
      />
    )
  }

  return <QuotationsWindow items={result.data} locale={DEFAULT_LOCALE} />
}
