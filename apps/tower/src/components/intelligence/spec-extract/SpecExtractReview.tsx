'use client'

// SpecExtractReview (COMPONENT_TREE §1 <SpecExtract> / §5 <SpecExtractQueue>):
// a supplier PDF/image was read into a drafted spec (API_MAP /api/ai/spec-extract,
// sonnet). Approval creates a DRAFT product (never PUBLISHED), so there is no
// existing target to diff against — this surface renders the extracted spec
// through SpecView, with per-field confidence so low-certainty fields draw the
// eye, and explicit Approve / Reject via the (RLS-scoped) W4.B actions. Renders
// tower.ai_drafts rows of kind SPEC_EXTRACT (AiDraftRecord<'SPEC_EXTRACT'>).
import { useMemo, useState, useTransition } from 'react'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale, type Localized } from '@/lib/i18n'
import { SpecView } from '@/components/catalog/spec-form'
import { getSpecSchema } from '@/lib/schemas/spec'
import { approveSpecExtract, rejectDraft } from '@/lib/actions/intelligence'
import type { AiDraftRecord } from '@/lib/ai'
import { ConfidenceMeter } from '../confidence-meter'
import { useSpecExtractDraftsQuery } from './useSpecExtractDraftsQuery'

type Draft = AiDraftRecord<'SPEC_EXTRACT'>

/** Last path segment of the source document, for a readable label. */
function docName(sourcePath: string): string {
  const parts = sourcePath.split('/')
  return parts[parts.length - 1] || sourcePath
}

function DraftListItem({
  draft,
  active,
  locale,
  onSelect,
}: {
  draft: Draft
  active: boolean
  locale: Locale
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active}
      className={cn(
        'flex w-full flex-col gap-2 rounded-card border px-3 py-2.5 text-left outline-none focus-visible:border-lane-accent',
        active ? 'border-lane-accent bg-surface-1' : 'border-line bg-surface-0 hover:border-ink-secondary',
      )}
    >
      <span className="font-ui text-t0 text-ink-primary">{t(draft.payload.name, locale)}</span>
      <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary" data-numeric>
        {draft.payload.archetype} · {docName(draft.payload.sourcePath)}
      </span>
      <ConfidenceMeter value={draft.confidence} compact locale={locale} />
    </button>
  )
}

export function SpecExtractReview({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const query = useSpecExtractDraftsQuery()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const drafts = query.data ?? []
  const selected = useMemo(() => drafts.find((d) => d.id === selectedId) ?? drafts[0] ?? null, [drafts, selectedId])

  // Resolve the archetype's JSON-Schema so SpecView can render typed fields.
  const schema = useMemo(
    () => (selected ? getSpecSchema(selected.payload.archetype, selected.payload.laneId) : null),
    [selected],
  )

  function handleApprove(draftId: string) {
    setError(null)
    startTransition(async () => {
      const result = await approveSpecExtract(draftId)
      if (result.error) {
        setError(result.error.message)
        return
      }
      setSelectedId(null)
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
      setSelectedId(null)
      await query.refetch()
    })
  }

  if (query.isLoading) {
    return (
      <p className="px-1 font-ui text-t0 text-ink-secondary">
        {t({ es: 'Cargando extracciones…', en: 'Loading extractions…' }, locale)}
      </p>
    )
  }

  if (query.error) {
    return (
      <p role="alert" className="px-1 font-ui text-t0 text-negative">
        {t({ es: 'No se pudieron cargar las extracciones', en: 'Could not load extractions' }, locale)}:{' '}
        {query.error.message}
      </p>
    )
  }

  if (drafts.length === 0) {
    return (
      <p className="px-1 font-ui text-t0 text-ink-secondary">
        {t({ es: 'Sin documentos por revisar.', en: 'No documents to review.' }, locale)}
      </p>
    )
  }

  const fieldProps =
    (schema as { properties?: Record<string, { 'x-label'?: Localized }> } | null)?.properties ?? {}

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex w-full flex-col gap-2 lg:w-72 lg:flex-none">
        {drafts.map((draft) => (
          <DraftListItem
            key={draft.id}
            draft={draft}
            active={selected?.id === draft.id}
            locale={locale}
            onSelect={() => setSelectedId(draft.id)}
          />
        ))}
      </div>

      {selected && schema ? (
        <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-card border border-line bg-surface-0 p-4">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-ui text-t1 text-ink-primary">{t(selected.payload.name, locale)}</h2>
              <span className="font-mono text-label uppercase tracking-[0.06em] text-ink-secondary" data-numeric>
                {selected.payload.archetype} · {docName(selected.payload.sourcePath)}
              </span>
            </div>
            <ConfidenceMeter
              value={selected.confidence}
              label={{ es: 'Confianza global', en: 'Overall confidence' }}
              locale={locale}
              className="w-48"
            />
          </header>

          {error ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              {t({ es: 'Especificación extraída', en: 'Extracted spec' }, locale)}
            </span>
            <SpecView schema={schema} value={selected.payload.specs} locale={locale} />
          </div>

          {Object.keys(selected.payload.fieldConfidences).length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                {t({ es: 'Confianza por campo', en: 'Per-field confidence' }, locale)}
              </span>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {Object.entries(selected.payload.fieldConfidences).map(([key, value]) => {
                  const prop = fieldProps[key]
                  const fieldLabel = prop?.['x-label'] ? t(prop['x-label'], locale) : key
                  return (
                    <div key={key} className="flex items-baseline justify-between gap-3 border-b border-line py-1">
                      <span className="truncate font-mono text-label uppercase tracking-[0.06em] text-ink-secondary">
                        {fieldLabel}
                      </span>
                      <ConfidenceMeter value={value} compact locale={locale} />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleApprove(selected.id)}
              className="rounded-card bg-positive px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              {t({ es: 'Aprobar extracción', en: 'Approve extraction' }, locale)}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleReject(selected.id)}
              className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-negative outline-none focus-visible:border-negative disabled:opacity-40"
            >
              {t({ es: 'Rechazar', en: 'Reject' }, locale)}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
