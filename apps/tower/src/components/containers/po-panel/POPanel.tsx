'use client'

// Supplier POs + status advance — COMPONENT_TREE §3 <POPanel>. QC checkpoint
// tracking itself is `QcTracker` (a sibling component); this panel just lets
// the operator pick which PO to track by calling `onSelectPo`.
import { useState, useTransition } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { advancePOStatus, issuePO, listSuppliersForContainer } from '@/lib/actions/containers'
import { canAdvancePoStatus, parseDecimalToMinor } from '@/lib/actions/containers-logic'
import { PO_STATUSES, type PoStatus, type PurchaseOrderRow } from '@/lib/actions/containers-types'
import { formatMinor } from '@/lib/money'
import { EntityCombobox, type EntityOption } from '@/components/ui/EntityCombobox'
import { usePurchaseOrdersQuery } from './usePurchaseOrdersQuery'

const STATUS_STYLE: Record<PoStatus, string> = {
  ISSUED: 'text-ink-secondary',
  CONFIRMED: 'text-accent',
  IN_PRODUCTION: 'text-accent',
  QC_PENDING: 'text-accent',
  QC_PASSED: 'text-positive',
  SHIPPED: 'text-positive',
  CANCELLED: 'text-ink-secondary line-through',
}

function nextStatuses(current: PoStatus): PoStatus[] {
  return PO_STATUSES.filter((s) => canAdvancePoStatus(current, s))
}

export function POPanel({
  containerId,
  laneId,
  canWrite,
  selectedPoId,
  onSelectPo,
}: {
  containerId: string
  laneId: string
  canWrite: boolean
  selectedPoId: string | null
  onSelectPo: (poId: string) => void
}) {
  const query = usePurchaseOrdersQuery(containerId)
  const suppliersQuery = useQuery({
    queryKey: ['tower', 'containers', 'suppliers', containerId],
    queryFn: async () => {
      const result = await listSuppliersForContainer(containerId)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    enabled: canWrite,
  })
  const supplierOptions: EntityOption[] = (suppliersQuery.data ?? []).map((s) => ({
    id: s.id,
    label: s.name,
    hint: s.country,
    badge: s.verified ? '✓' : null,
  }))
  const [supplierId, setSupplierId] = useState('')
  const [description, setDescription] = useState('')
  const [qty, setQty] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()
  const poKey = ['tower', 'containers', 'purchase-orders', containerId] as const

  // PO status advance is optimistic — the status stamp flips the instant you
  // click, rolling back only if the server refuses the transition. Scoped per
  // PO so advancing one row never disables the others' buttons.
  const advanceMutation = useMutation({
    mutationFn: async ({ poId, status }: { poId: string; status: PoStatus }) => {
      const result = await advancePOStatus(poId, status)
      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onMutate: async ({ poId, status }) => {
      setError(null)
      await queryClient.cancelQueries({ queryKey: poKey })
      const prev = queryClient.getQueryData<PurchaseOrderRow[]>(poKey)
      if (prev) {
        queryClient.setQueryData<PurchaseOrderRow[]>(
          poKey,
          prev.map((p) => (p.id === poId ? { ...p, status } : p)),
        )
      }
      return { prev }
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(poKey, ctx.prev)
      setError(err.message)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: poKey })
    },
  })

  function submitIssue() {
    setError(null)
    const unitPriceMinor = parseDecimalToMinor(unitPrice)
    const qtyValue = Number(qty)
    if (unitPriceMinor === null || !Number.isFinite(qtyValue) || qtyValue <= 0) {
      setError('Datos inválidos / Invalid data')
      return
    }
    const totalMinor = Math.round(unitPriceMinor * qtyValue)
    startTransition(async () => {
      const result = await issuePO(containerId, {
        supplierId,
        laneId,
        lines: [{ description, qty: qtyValue, unitPriceMinor }],
        totalMinor,
        currency: 'USD',
      })
      if (result.error) {
        setError(`${result.error.code}: ${result.error.message}`)
        return
      }
      setSupplierId('')
      setDescription('')
      setQty('1')
      setUnitPrice('')
      await query.refetch()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        Órdenes de compra / Purchase orders
      </h2>

      {canWrite ? (
        <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Proveedor / Supplier
            </span>
            <EntityCombobox
              className="w-56"
              options={supplierOptions}
              value={supplierId || null}
              onChange={(id) => setSupplierId(id ?? '')}
              loading={suppliersQuery.isLoading}
              placeholder="Buscar proveedor… / Search supplier…"
              ariaLabel="Proveedor / Supplier"
              emptyText="Sin proveedores para esta marca / No suppliers for this brand"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Descripción / Description
            </span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-56 rounded-card border border-line bg-surface-0 px-3 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">Cant. / Qty</span>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputMode="decimal"
              className="w-20 rounded-card border border-line bg-surface-0 px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary">
              Precio unit. (USD) / Unit price
            </span>
            <input
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="w-28 rounded-card border border-line bg-surface-0 px-3 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
            />
          </label>
          <button
            type="button"
            onClick={submitIssue}
            disabled={isPending || !supplierId || !unitPrice}
            className="rounded-card bg-accent px-4 py-1.5 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            {isPending ? 'Emitiendo… / Issuing…' : 'Emitir PO / Issue PO'}
          </button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          {error}
        </p>
      ) : null}

      {query.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudieron cargar las órdenes / Could not load purchase orders: {query.error.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {(query.data ?? []).map((po) => (
          <div
            key={po.id}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-card border p-3 ${
              selectedPoId === po.id ? 'border-lane-accent' : 'border-line'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectPo(po.id)}
              className="flex flex-col items-start gap-1 text-left"
            >
              <span className="font-mono text-t0 text-ink-primary">{po.supplierName ?? po.supplierId}</span>
              <span className="font-mono text-label text-ink-secondary" data-numeric>
                {formatMinor(po.totalMinor, po.currency)}
              </span>
            </button>
            <span className={`font-mono text-label uppercase tracking-[0.08em] ${STATUS_STYLE[po.status]}`}>
              {po.status}
            </span>
            {canWrite && nextStatuses(po.status).length > 0 ? (
              <div className="flex gap-2">
                {nextStatuses(po.status).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => advanceMutation.mutate({ poId: po.id, status: s })}
                    disabled={advanceMutation.isPending && advanceMutation.variables?.poId === po.id}
                    className="rounded-card border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-ink-primary disabled:opacity-40"
                  >
                    → {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {!query.isLoading && (query.data ?? []).length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin órdenes de compra / No purchase orders yet</p>
        ) : null}
      </div>
    </div>
  )
}
