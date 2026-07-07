'use client'

// TriageQueue (COMPONENT_TREE §5): AI-suggested lane / archetype / stage for
// each unclassified inbound, reviewed and disposed by an operator. The list is
// the working set; approve/reject call the (RLS-scoped) W4.B actions and refetch.
// Loading / empty / error are all explicit.
import { useState, useTransition } from 'react'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { approveTriage, rejectDraft } from '@/lib/actions/intelligence'
import { TriageCard } from './TriageCard'
import { useTriageDraftsQuery } from './useTriageDraftsQuery'

export function TriageQueue({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const query = useTriageDraftsQuery()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApprove(draftId: string) {
    setError(null)
    startTransition(async () => {
      const result = await approveTriage(draftId)
      if (result.error) {
        setError(result.error.message)
        return
      }
      await query.refetch()
    })
  }

  function handleReject(draftId: string) {
    setError(null)
    startTransition(async () => {
      const result = await rejectDraft(draftId)
      if (result.error) {
        setError(result.error.message)
        return
      }
      await query.refetch()
    })
  }

  if (query.isLoading) {
    return (
      <p className="px-1 font-ui text-t0 text-ink-secondary">
        {t({ es: 'Cargando cola de triage…', en: 'Loading triage queue…' }, locale)}
      </p>
    )
  }

  if (query.error) {
    return (
      <p role="alert" className="px-1 font-ui text-t0 text-negative">
        {t({ es: 'No se pudo cargar la cola de triage', en: 'Could not load the triage queue' }, locale)}:{' '}
        {query.error.message}
      </p>
    )
  }

  const drafts = query.data ?? []

  if (drafts.length === 0) {
    return (
      <p className="px-1 font-ui text-t0 text-ink-secondary">
        {t({ es: 'Cola vacía — nada por clasificar.', en: 'Queue empty — nothing to classify.' }, locale)}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {drafts.map((draft) => (
          <TriageCard
            key={draft.id}
            draft={draft}
            busy={isPending}
            locale={locale}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  )
}
