'use client'

// product_versions timeline + one-click rollback (COMPONENT_TREE §1). Rollback
// = republish previous version (ADR-4): the parent (ProductEditor) calls
// `rollbackProduct(id, version)` and refreshes; this component is presentational.
import { useState } from 'react'
import { DEFAULT_LOCALE, t } from '@/lib/i18n'
import type { ProductVersionRow } from '@/lib/actions/catalog'

export function VersionHistory({
  versions,
  currentVersion,
  canRollback,
  busy = false,
  onRollback,
}: {
  versions: ProductVersionRow[]
  /** The version currently live (product_versions.version of the latest
   * PUBLISHED snapshot) — rendered without a rollback action (nothing to
   * roll back to itself). */
  currentVersion?: number
  canRollback: boolean
  busy?: boolean
  onRollback?: (version: number) => void
}) {
  const [confirming, setConfirming] = useState<number | null>(null)

  if (versions.length === 0) {
    return (
      <p className="font-ui text-t0 text-ink-secondary">
        Sin versiones publicadas todavía / No published versions yet.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-2">
      {versions.map((v) => {
        const isCurrent = v.version === currentVersion
        return (
          <li
            key={v.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface-1 px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-t1 text-ink-primary" data-numeric>
                v{v.version}
              </span>
              <span className="font-ui text-t0 text-ink-primary">{t(v.snapshot.name, DEFAULT_LOCALE)}</span>
              <span className="font-mono text-label text-ink-secondary" data-numeric>
                {new Date(v.publishedAt).toLocaleString('es-PE')}
              </span>
              {isCurrent ? (
                <span className="font-mono text-label uppercase tracking-[0.1em] text-positive">Actual / Current</span>
              ) : null}
            </div>

            {canRollback && !isCurrent ? (
              confirming === v.version ? (
                <div className="flex items-center gap-2">
                  <span className="font-ui text-t0 text-ink-secondary">¿Confirmar? / Confirm?</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      onRollback?.(v.version)
                      setConfirming(null)
                    }}
                    className="rounded-card border border-negative px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-negative disabled:opacity-40"
                  >
                    Revertir / Roll back
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary"
                  >
                    Cancelar / Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(v.version)}
                  className="rounded-card border border-line px-3 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-lane-accent"
                >
                  Revertir a esta versión / Roll back to this version
                </button>
              )
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
