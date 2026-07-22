'use client'

// Promoción de contenedores — the workbench that lists the containers a rep may
// promote (RLS-scoped) and opens the marketing window for one. Left: the
// container list with live promo state; right: the ContainerPromoPanel loaded on
// demand (getContainerPromo). Activation + copy edits round-trip through the
// server actions; the list refreshes so promo state stays truthful.
import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import {
  getContainerPromo,
  listPromotableContainers,
  type ContainerPromoDetail,
  type PromotableContainerRow,
} from '@/lib/actions/container-promo'
import { ContainerPromoPanel } from './ContainerPromoPanel'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'

export function PromoWorkbench({
  initialRows,
  initialSelectedId,
  repWhatsappE164 = null,
  repWhatsappLabel = null,
}: {
  initialRows: PromotableContainerRow[]
  /** Deep-link target — a container id from `?c=`, so its promo opens directly. */
  initialSelectedId?: string
  /** The signed-in rep's own WhatsApp Business line — threaded to the share panel
   *  so each rep's promo deep-links open from their own number (tower_39). */
  repWhatsappE164?: string | null
  repWhatsappLabel?: string | null
}) {
  const pathname = usePathname()
  const [rows, setRows] = useState(initialRows)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ContainerPromoDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, startLoad] = useTransition()

  function refreshRows() {
    void listPromotableContainers().then((res) => {
      if (res.data) setRows(res.data)
    })
  }

  function open(id: string) {
    setSelectedId(id)
    setError(null)
    // Reflect the open container in the URL so its promo is directly shareable
    // (?c=<id>). history.replaceState (not the router) → no server re-fetch of
    // the container list on each selection.
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `${pathname}?c=${id}`)
    }
    startLoad(async () => {
      const res = await getContainerPromo(id)
      if (res.error) {
        setError(res.error.message)
        setDetail(null)
        return
      }
      setDetail(res.data)
    })
  }

  // Deep-link: open a container's promo directly from ?c=<id> on first load.
  useEffect(() => {
    if (initialSelectedId) open(initialSelectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedId])

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,340px)_1fr]">
      <aside className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto rounded-card border border-line">
        {rows.map((r) => {
          const active = r.id === selectedId
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => open(r.id)}
              aria-current={active ? 'true' : undefined}
              className={`flex flex-col items-start gap-0.5 border-b border-line px-3 py-2 text-left last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent ${
                active ? 'bg-surface-1' : 'hover:bg-surface-1'
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="font-mono text-t0 text-ink-primary">{r.code}</span>
                <span className={`font-mono text-label uppercase tracking-[0.08em] ${r.promoActive ? 'text-positive' : 'text-ink-secondary'}`}>
                  {r.promoActive ? '● Activo' : '○'}
                </span>
              </span>
              <span className="font-ui text-label text-ink-secondary">
                {r.brandName} · {r.productName}
              </span>
              <span className="font-mono text-label text-ink-secondary">
                {r.slotsAvailable}/{r.slotsTotal} cupos · {r.status}
              </span>
            </button>
          )
        })}
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
            Sin contenedores abiertos / No open containers.
          </p>
        ) : null}
      </aside>

      <section className="min-h-[40vh]">
        {error ? (
          <p role="alert" className="font-ui text-t0 text-negative">
            {error}
          </p>
        ) : isLoading && !detail ? (
          <p className={LABEL}>Cargando…</p>
        ) : detail ? (
          <ContainerPromoPanel
            key={detail.id}
            initial={detail}
            onChanged={refreshRows}
            repWhatsappE164={repWhatsappE164}
            repWhatsappLabel={repWhatsappLabel}
          />
        ) : (
          <div className="flex h-full min-h-[40vh] items-center justify-center rounded-card border border-line">
            <p className="font-ui text-t0 text-ink-secondary">
              Selecciona un contenedor para promocionar / Select a container to promote.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
