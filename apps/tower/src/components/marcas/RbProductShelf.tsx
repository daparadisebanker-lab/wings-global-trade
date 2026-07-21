'use client'

// RB product shelf — the represented-brand (RB/xx) product editor (RB Console
// Wave 2, Ch 02). An INTERNAL management surface: a rep adds / edits / submits /
// publishes / retires their brand's products and captures each one's ALLOCATION
// spec through the SAME schema-driven organs the lane Catalog Studio uses —
// SpecForm, PublishBar, StatusStamp, NameFields, CategoryPathEditor are reused
// by props, never forked. Capabilities HIDE actions; RLS (has_rb_role) is the
// real gate. TOWER control-room styling only — tokens, radius ≤2px, no shadows;
// status reads by dot+label, never color alone (StatusStamp).
import { useMemo, useState, useTransition } from 'react'
import type { Localized } from '@/lib/archetypes'
import type { JsonSchema } from '@/lib/schemas/spec'
import type { ProductCapabilities } from '@/lib/actions/catalog-logic'
import {
  createRbProduct,
  updateRbProduct,
  submitRbForReview,
  publishRbProduct,
  retireRbProduct,
  type RbProductInput,
  type RbProductRow,
} from '@/lib/actions/rb-catalog'
import { SpecForm } from '@/components/catalog/spec-form'
import { PublishBar, type RevalidateState } from '@/components/catalog/publish-bar'
import { StatusStamp } from '@/components/catalog/product-table/StatusStamp'
import { NameFields } from '@/components/catalog/product-editor/NameFields'
import { CategoryPathEditor } from '@/components/catalog/product-editor/CategoryPathEditor'
import { RbMediaManager } from './RbMediaManager'
import { RbPackingProfileForm } from './RbPackingProfileForm'
import { RbDiagramGeometryForm } from './RbDiagramGeometryForm'

const LABEL = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent disabled:opacity-50'

interface FormState {
  slug: string
  name: Localized
  categoryPath: string[]
  specs: Record<string, unknown>
  hsCode: string
  moq: string
  cbmPerUnit: string
}

function toFormState(product: RbProductRow | null): FormState {
  return {
    slug: product?.slug ?? '',
    name: product?.name ?? { es: '', en: '' },
    categoryPath: product?.categoryPath ?? [],
    specs: product?.specs ?? {},
    hsCode: product?.hsCode ?? '',
    moq: product?.moq != null ? String(product.moq) : '',
    cbmPerUnit: product?.cbmPerUnit != null ? String(product.cbmPerUnit) : '',
  }
}

function toInput(form: FormState): RbProductInput {
  return {
    slug: form.slug || undefined,
    name: form.name,
    categoryPath: form.categoryPath,
    specs: form.specs,
    hsCode: form.hsCode.trim() ? form.hsCode.trim() : null,
    moq: form.moq.trim() ? Number(form.moq) : null,
    cbmPerUnit: form.cbmPerUnit.trim() ? Number(form.cbmPerUnit) : null,
  }
}

export function RbProductShelf({
  brandId,
  brandCode,
  brandName,
  specSchema,
  capabilities,
  initialProducts,
}: {
  brandId: string
  brandCode: string
  brandName: string
  specSchema: JsonSchema
  capabilities: ProductCapabilities
  initialProducts: RbProductRow[]
}) {
  const [products, setProducts] = useState<RbProductRow[]>(initialProducts)
  const [selectedId, setSelectedId] = useState<string | null>(initialProducts[0]?.id ?? null)
  const [mode, setMode] = useState<'edit' | 'new'>(initialProducts.length ? 'edit' : 'new')
  const [form, setForm] = useState<FormState>(() => toFormState(initialProducts[0] ?? null))
  const [error, setError] = useState<string | null>(null)
  const [revalidateState, setRevalidateState] = useState<RevalidateState>('idle')
  const [isPending, startTransition] = useTransition()

  const current = useMemo(() => products.find((p) => p.id === selectedId) ?? null, [products, selectedId])

  function select(product: RbProductRow) {
    setError(null)
    setRevalidateState('idle')
    setMode('edit')
    setSelectedId(product.id)
    setForm(toFormState(product))
  }

  function startNew() {
    setError(null)
    setRevalidateState('idle')
    setMode('new')
    setSelectedId(null)
    setForm(toFormState(null))
  }

  function upsertLocal(row: RbProductRow) {
    setProducts((prev) => {
      const next = prev.some((p) => p.id === row.id) ? prev.map((p) => (p.id === row.id ? row : p)) : [row, ...prev]
      return next
    })
    setSelectedId(row.id)
    setMode('edit')
    setForm(toFormState(row))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      if (mode === 'new' || !current) {
        const res = await createRbProduct(brandId, toInput(form))
        if (res.error) return setError(res.error.message)
        upsertLocal(res.data)
        return
      }
      const res = await updateRbProduct(current.id, toInput(form))
      if (res.error) return setError(res.error.message)
      upsertLocal(res.data)
    })
  }

  function handleSubmit() {
    if (!current) return
    setError(null)
    startTransition(async () => {
      const res = await submitRbForReview(current.id)
      if (res.error) return setError(res.error.message)
      upsertLocal(res.data)
    })
  }

  function handlePublish() {
    if (!current) return
    setError(null)
    setRevalidateState('pending')
    startTransition(async () => {
      const res = await publishRbProduct(current.id)
      if (res.error) {
        setError(res.error.message)
        setRevalidateState('error')
        return
      }
      upsertLocal(res.data.product)
      setRevalidateState('done')
    })
  }

  function handleRetire() {
    if (!current) return
    setError(null)
    startTransition(async () => {
      const res = await retireRbProduct(current.id)
      if (res.error) return setError(res.error.message)
      upsertLocal(res.data)
    })
  }

  const status = current?.status ?? 'DRAFT'
  const editingDisabled = current
    ? !capabilities.canEdit || current.status === 'PUBLISHED' || current.status === 'RETIRED'
    : !capabilities.canCreate

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      {/* Shelf list */}
      <aside className="flex w-full flex-col gap-2 lg:w-72">
        <div className="flex items-center justify-between">
          <h2 className={LABEL}>Productos · {brandCode}</h2>
          {capabilities.canCreate ? (
            <button
              type="button"
              onClick={startNew}
              className="rounded-card border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
            >
              + Nuevo
            </button>
          ) : null}
        </div>
        {products.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin productos todavía / No products yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
            {products.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => select(p)}
                  aria-current={p.id === selectedId}
                  className={`flex w-full flex-col items-start gap-1 px-3 py-2 text-left hover:bg-surface-1 ${p.id === selectedId ? 'bg-surface-1' : ''}`}
                >
                  <span className="font-ui text-t0 text-ink-primary">{p.name.es || p.name.en || p.slug}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-label text-ink-secondary">{p.slug}</span>
                    <StatusStamp status={p.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Editor */}
      <div className="flex min-h-0 flex-1 flex-col rounded-card border border-line">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            <p className={LABEL}>
              {mode === 'new' ? `Nuevo producto · ${brandName}` : `${current?.slug ?? ''} · ${brandName}`}
            </p>

            <NameFields value={form.name} onChange={(name) => setForm((f) => ({ ...f, name }))} disabled={editingDisabled} />

            <label className="flex flex-col gap-1">
              <span className={LABEL}>Slug</span>
              <input
                value={form.slug}
                disabled={editingDisabled}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="derivado del nombre si se deja vacío / derived from name if blank"
                className={`w-72 ${INPUT}`}
              />
            </label>

            <CategoryPathEditor
              value={form.categoryPath}
              onChange={(categoryPath) => setForm((f) => ({ ...f, categoryPath }))}
              disabled={editingDisabled}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className={LABEL}>HS Code</span>
                <input value={form.hsCode} disabled={editingDisabled} onChange={(e) => setForm((f) => ({ ...f, hsCode: e.target.value }))} className={INPUT} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>MOQ</span>
                <input type="number" min={0} value={form.moq} disabled={editingDisabled} onChange={(e) => setForm((f) => ({ ...f, moq: e.target.value }))} className={INPUT} data-numeric />
              </label>
              <label className="flex flex-col gap-1">
                <span className={LABEL}>CBM / unidad</span>
                <input type="number" min={0} step="0.01" value={form.cbmPerUnit} disabled={editingDisabled} onChange={(e) => setForm((f) => ({ ...f, cbmPerUnit: e.target.value }))} className={INPUT} data-numeric />
              </label>
            </div>

            <section className="flex flex-col gap-2">
              <h3 className={LABEL}>Especificación / Spec (ALLOCATION)</h3>
              <SpecForm schema={specSchema} value={form.specs} onChange={(specs) => setForm((f) => ({ ...f, specs }))} locale="es" disabled={editingDisabled} />
            </section>

            {/* Media + packing profile — the Wave-2 tails. Both are separate,
                append-only tables (rb_product_media / rb_packing_profiles) with
                their own RLS, so they stay editable even once the product row is
                locked; they only require a saved product (id + slug). */}
            <section className="flex flex-col gap-2 border-t border-line pt-5">
              <h3 className={LABEL}>Imágenes / Images</h3>
              {current ? (
                <RbMediaManager key={current.id} productId={current.id} initialMedia={[]} disabled={!capabilities.canEdit} />
              ) : (
                <p className="font-ui text-t0 text-ink-secondary">
                  Guarda el producto como borrador antes de subir imágenes. / Save the product as a draft before uploading images.
                </p>
              )}
            </section>

            <section className="flex flex-col gap-2 border-t border-line pt-5">
              <h3 className={LABEL}>Perfil de empaque / Packing profile</h3>
              <p className="font-ui text-t0 text-ink-secondary">
                Números que alimentan la matemática de cupos (ALLOCATION) y la ficha pública. / Numbers that drive the
                ALLOCATION slot math and the public fiche.
              </p>
              {current ? (
                <RbPackingProfileForm
                  key={current.id}
                  brandId={brandId}
                  productSlug={current.slug}
                  productName={current.name.es || current.name.en || current.slug}
                  disabled={!capabilities.canEdit}
                />
              ) : (
                <p className="font-ui text-t0 text-ink-secondary">
                  Guarda el producto como borrador para definir su perfil de empaque. / Save the product as a draft to
                  define its packing profile.
                </p>
              )}
            </section>

            {/* Diagram geometry — the BOUNDED numeric model (rb_diagram_specs,
                tower_41 / R1) the technical package drawing on the fiche + tech
                sheet is derived from. Its own append-only table + RLS, so it stays
                editable once the product row is locked; only needs a saved product. */}
            <section className="flex flex-col gap-2 border-t border-line pt-5">
              <h3 className={LABEL}>Geometría del dibujo / Diagram geometry</h3>
              <p className="font-ui text-t0 text-ink-secondary">
                Dimensiones y conteos que dibujan el empaque máster en la ficha técnica y la ficha pública. / Dimensions
                and counts that draw the master package on the tech sheet and the public fiche.
              </p>
              {current ? (
                <RbDiagramGeometryForm
                  key={current.id}
                  rbProductId={current.id}
                  productName={current.name.es || current.name.en || current.slug}
                  disabled={!capabilities.canEdit}
                />
              ) : (
                <p className="font-ui text-t0 text-ink-secondary">
                  Guarda el producto como borrador para definir su geometría. / Save the product as a draft to define its
                  diagram geometry.
                </p>
              )}
            </section>

            {error ? (
              <p role="alert" className="font-ui text-t0 text-negative">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <PublishBar
          status={status}
          capabilities={capabilities}
          revalidateState={revalidateState}
          busy={isPending}
          onSaveDraft={handleSave}
          onSubmitForReview={handleSubmit}
          onPublish={handlePublish}
          onRetire={handleRetire}
        />
      </div>
    </div>
  )
}
