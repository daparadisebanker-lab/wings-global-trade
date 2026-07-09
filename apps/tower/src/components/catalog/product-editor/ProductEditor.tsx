'use client'

// The Catalog Studio product editor (COMPONENT_TREE §1 <ProductEditor>):
// name (ES/EN), category_path, archetype-driven SpecForm, media, save-draft /
// submit / (director) publish, version history + rollback. Composes this
// wave's other four owned components; SpecForm is a sibling contract (stub
// until the real schema-driven form lands — see components/catalog/spec-form).
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createProduct,
  getProductVersions,
  publishProduct,
  retireProduct,
  rollbackProduct,
  submitForReview,
  updateProduct,
  type EditableLane,
  type ProductInput,
  type ProductRow,
  type ProductVersionRow,
} from '@/lib/actions/catalog'
import type { ProductCapabilities } from '@/lib/actions/catalog-logic'
import type { ProductMediaRow } from '@/lib/actions/media'
import { getSpecSchema } from '@/lib/schemas/spec'
import { SpecForm } from '@/components/catalog/spec-form'
import type { Localized } from '@/lib/archetypes'
import { PublishBar, type RevalidateState } from '../publish-bar'
import { VersionHistory } from '../version-history'
import { MediaManager } from '../media-manager'
import { NameFields } from './NameFields'
import { CategoryPathEditor } from './CategoryPathEditor'

interface FormState {
  slug: string
  name: Localized
  categoryPath: string[]
  specs: Record<string, unknown>
  hsCode: string
  moq: string
  cbmPerUnit: string
}

function toFormState(product: ProductRow | null): FormState {
  return {
    slug: product?.slug ?? '',
    name: product?.name ?? { es: '', en: '' },
    categoryPath: product?.categoryPath ?? [],
    specs: product?.specs ?? {},
    hsCode: product?.hsCode ?? '',
    moq: product?.moq !== null && product?.moq !== undefined ? String(product.moq) : '',
    cbmPerUnit: product?.cbmPerUnit !== null && product?.cbmPerUnit !== undefined ? String(product.cbmPerUnit) : '',
  }
}

function toInput(form: FormState): ProductInput {
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

export function ProductEditor({
  mode,
  product,
  laneOptions,
  initialLaneId,
  capabilities,
  initialVersions,
  initialMedia,
  publicSiteBaseUrl,
}: {
  mode: 'new' | 'edit'
  product: ProductRow | null
  /** Only used in 'new' mode — which lane the product is created in. */
  laneOptions: EditableLane[]
  initialLaneId?: string
  capabilities: ProductCapabilities
  initialVersions: ProductVersionRow[]
  initialMedia: ProductMediaRow[]
  publicSiteBaseUrl?: string
}) {
  const router = useRouter()
  const [laneId, setLaneId] = useState<string | undefined>(initialLaneId ?? laneOptions[0]?.laneId)
  const [currentProduct, setCurrentProduct] = useState<ProductRow | null>(product)
  const [form, setForm] = useState<FormState>(() => toFormState(product))
  const [versions, setVersions] = useState<ProductVersionRow[]>(initialVersions)
  const [error, setError] = useState<string | null>(null)
  const [revalidateState, setRevalidateState] = useState<RevalidateState>('idle')
  const [isPending, startTransition] = useTransition()

  const lane = laneOptions.find((l) => l.laneId === laneId)
  const archetype = currentProduct?.laneArchetype ?? lane?.archetype ?? 'EQUIPMENT'
  const specSchema = useMemo(() => getSpecSchema(archetype, laneId), [archetype, laneId])

  const publicUrl =
    currentProduct?.status === 'PUBLISHED'
      ? `${publicSiteBaseUrl ?? ''}/catalogo/${currentProduct.laneSlug}/${currentProduct.slug}`
      : undefined

  async function refreshVersions(productId: string) {
    const result = await getProductVersions(productId)
    if (result.data) setVersions(result.data)
  }

  function handleSaveDraft() {
    setError(null)
    startTransition(async () => {
      if (mode === 'new' || !currentProduct) {
        if (!laneId) {
          setError('Selecciona una lane / Select a lane')
          return
        }
        const result = await createProduct(laneId, toInput(form))
        if (result.error) {
          setError(result.error.message)
          return
        }
        setCurrentProduct(result.data)
        router.replace(`/catalog/${result.data.id}`)
        return
      }

      const result = await updateProduct(currentProduct.id, toInput(form))
      if (result.error) {
        setError(result.error.message)
        return
      }
      setCurrentProduct(result.data)
    })
  }

  function handleSubmitForReview() {
    if (!currentProduct) return
    setError(null)
    startTransition(async () => {
      const result = await submitForReview(currentProduct.id)
      if (result.error) {
        setError(result.error.message)
        return
      }
      setCurrentProduct(result.data)
    })
  }

  function handlePublish() {
    if (!currentProduct) return
    setError(null)
    setRevalidateState('pending')
    startTransition(async () => {
      const result = await publishProduct(currentProduct.id)
      if (result.error) {
        setError(result.error.message)
        setRevalidateState('error')
        return
      }
      setCurrentProduct(result.data.product)
      setRevalidateState('done')
      await refreshVersions(currentProduct.id)
    })
  }

  function handleRetire() {
    if (!currentProduct) return
    setError(null)
    startTransition(async () => {
      const result = await retireProduct(currentProduct.id)
      if (result.error) {
        setError(result.error.message)
        return
      }
      setCurrentProduct(result.data)
    })
  }

  function handleRollback(version: number) {
    if (!currentProduct) return
    setError(null)
    setRevalidateState('pending')
    startTransition(async () => {
      const result = await rollbackProduct(currentProduct.id, version)
      if (result.error) {
        setError(result.error.message)
        setRevalidateState('error')
        return
      }
      setCurrentProduct(result.data.product)
      setForm(toFormState(result.data.product))
      setRevalidateState('done')
      await refreshVersions(currentProduct.id)
    })
  }

  const canEditFields = currentProduct ? capabilities.canEdit : capabilities.canCreate
  const editingDisabled = !canEditFields || (currentProduct ? currentProduct.status === 'PUBLISHED' || currentProduct.status === 'RETIRED' : false)

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {mode === 'new' && !currentProduct ? (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Lane</span>
              <select
                value={laneId ?? ''}
                onChange={(e) => setLaneId(e.target.value || undefined)}
                className="w-64 rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
              >
                {laneOptions.map((l) => (
                  <option key={l.laneId} value={l.laneId}>
                    {l.laneCode} · {l.laneName}
                  </option>
                ))}
              </select>
            </label>
          ) : currentProduct ? (
            <p className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              {currentProduct.slug} · lane {currentProduct.laneSlug}
            </p>
          ) : null}

          <NameFields value={form.name} onChange={(name) => setForm((f) => ({ ...f, name }))} disabled={editingDisabled} />

          <label className="flex flex-col gap-1">
            <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">Slug</span>
            <input
              value={form.slug}
              disabled={editingDisabled}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="derivado del nombre si se deja vacío / derived from name if left blank"
              className="w-72 rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent disabled:opacity-50"
            />
          </label>

          <CategoryPathEditor
            value={form.categoryPath}
            onChange={(categoryPath) => setForm((f) => ({ ...f, categoryPath }))}
            disabled={editingDisabled}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">HS Code</span>
              <input
                value={form.hsCode}
                disabled={editingDisabled}
                onChange={(e) => setForm((f) => ({ ...f, hsCode: e.target.value }))}
                className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">MOQ</span>
              <input
                type="number"
                min={0}
                value={form.moq}
                disabled={editingDisabled}
                onChange={(e) => setForm((f) => ({ ...f, moq: e.target.value }))}
                className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
                data-numeric
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">CBM / unidad</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.cbmPerUnit}
                disabled={editingDisabled}
                onChange={(e) => setForm((f) => ({ ...f, cbmPerUnit: e.target.value }))}
                className="rounded-card border border-line bg-surface-1 px-3 py-2 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent disabled:opacity-50"
                data-numeric
              />
            </label>
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              Especificación / Spec ({archetype})
            </h2>
            <SpecForm
              schema={specSchema}
              value={form.specs}
              onChange={(specs) => setForm((f) => ({ ...f, specs }))}
              locale="es"
              disabled={editingDisabled}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              Material / Media
            </h2>
            <MediaManager
              productId={currentProduct?.id ?? null}
              initialMedia={initialMedia}
              disabled={!capabilities.canEdit}
            />
          </section>

          {currentProduct ? (
            <section className="flex flex-col gap-2">
              <h2 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                Historial de versiones / Version history
              </h2>
              <VersionHistory
                versions={versions}
                currentVersion={versions[0]?.version}
                canRollback={capabilities.canRollback}
                busy={isPending}
                onRollback={handleRollback}
              />
            </section>
          ) : null}

          {error ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <PublishBar
        status={currentProduct?.status ?? 'DRAFT'}
        capabilities={capabilities}
        publicUrl={publicUrl}
        revalidateState={revalidateState}
        busy={isPending}
        onSaveDraft={handleSaveDraft}
        onSubmitForReview={handleSubmitForReview}
        onPublish={handlePublish}
        onRetire={handleRetire}
      />
    </div>
  )
}
