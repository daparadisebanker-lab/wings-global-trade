'use client'

// The publish flow bar (COMPONENT_TREE §1 · CLAUDE.md "Publish flow"):
// DRAFT → IN_REVIEW → PUBLISHED, director-gated, shows the exact public URL
// + revalidation status after publish. `capabilities` comes from
// `getLaneCapabilities` (real lane_memberships/profiles rows) — this
// component never hardcodes a role check; it only shows the actions the
// data says the user has (CLAUDE.md Directive 1: UI hides, RLS enforces).
import type { ProductCapabilities, ProductStatus } from '@/lib/actions/catalog-logic'
import { StatusStamp } from '../product-table/StatusStamp'

export type RevalidateState = 'idle' | 'pending' | 'done' | 'error'

export function PublishBar({
  status,
  capabilities,
  publicUrl,
  revalidateState = 'idle',
  busy = false,
  onSaveDraft,
  onSubmitForReview,
  onPublish,
  onRetire,
}: {
  status: ProductStatus
  capabilities: ProductCapabilities
  /** The exact public URL this product resolves to once published. */
  publicUrl?: string
  revalidateState?: RevalidateState
  busy?: boolean
  onSaveDraft?: () => void
  onSubmitForReview?: () => void
  onPublish?: () => void
  onRetire?: () => void
}) {
  const showSubmit = capabilities.canSubmitForReview && status === 'DRAFT'
  const showPublish = capabilities.canPublish && (status === 'DRAFT' || status === 'IN_REVIEW')
  const showRetire = capabilities.canRetire && status === 'PUBLISHED'

  return (
    <div className="sticky bottom-0 z-20 flex flex-col gap-2 border-t border-line bg-surface-1 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <StatusStamp status={status} />
          {status === 'PUBLISHED' && publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-t0 text-lane-accent underline-offset-2 hover:underline"
            >
              {publicUrl}
            </a>
          ) : null}
          {status === 'PUBLISHED' ? (
            <span
              role="status"
              className={
                revalidateState === 'error'
                  ? 'font-mono text-label uppercase tracking-[0.1em] text-negative'
                  : revalidateState === 'done'
                    ? 'font-mono text-label uppercase tracking-[0.1em] text-positive'
                    : 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'
              }
            >
              {revalidateState === 'pending' && 'Revalidando… / Revalidating…'}
              {revalidateState === 'done' && 'Sitio actualizado / Site updated'}
              {revalidateState === 'error' && 'Revalidación falló / Revalidation failed'}
              {revalidateState === 'idle' && ''}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {capabilities.canEdit ? (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={busy}
              className="rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary disabled:opacity-40"
            >
              Guardar borrador / Save draft
            </button>
          ) : null}

          {showSubmit ? (
            <button
              type="button"
              onClick={onSubmitForReview}
              disabled={busy}
              className="rounded-card border border-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-accent disabled:opacity-40"
            >
              Enviar a revisión / Submit for review
            </button>
          ) : null}

          {showPublish ? (
            <button
              type="button"
              onClick={onPublish}
              disabled={busy}
              className="rounded-card bg-positive px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              Publicar / Publish
            </button>
          ) : null}

          {showRetire ? (
            <button
              type="button"
              onClick={onRetire}
              disabled={busy}
              className="rounded-card border border-negative px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-negative disabled:opacity-40"
            >
              Retirar / Retire
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
