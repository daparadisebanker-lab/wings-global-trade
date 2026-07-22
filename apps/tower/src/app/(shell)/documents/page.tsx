import { EmptyState } from '@/components/ui/EmptyState'
import { DocumentsWindow } from '@/components/documents'
import { listDocuments } from '@/lib/actions/documents'
import { DEFAULT_LOCALE } from '@/lib/i18n'

// Documents / Drive hub — the per-lane document store (tower_47). RLS-scoped via
// listDocuments; server-rendered like the Quotations/Clients windows.
export const dynamic = 'force-dynamic'

const TAG = 'DOC · Documentos'
const TITLE = { es: 'Documentos', en: 'Documents' }

export default async function DocumentsPage() {
  const result = await listDocuments()

  if (result.error) {
    return (
      <EmptyState
        tag={TAG}
        title={TITLE}
        description={{
          es: 'No se pudieron cargar los documentos. Intenta de nuevo.',
          en: 'Could not load documents. Please try again.',
        }}
      />
    )
  }

  return <DocumentsWindow items={result.data} locale={DEFAULT_LOCALE} />
}
