'use client'

// BrandManager (COMPONENT_TREE §6): tenants table (wings, aladin, …), create a
// brand, and retire/reinstate (append-only spirit — retire, never delete). The
// RETIRE/REINSTATE control depends on the proposed brands.status column
// (wave5-admin.sql); until it lands, setBrandStatus returns a clear error and
// the list simply reads every brand as ACTIVE.
import { useMemo, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { slugify, type BrandStatus } from '@/lib/actions/admin-logic'
import { createBrand, setBrandStatus } from '@/lib/actions/admin'
import { ADMIN_BRANDS_KEY, useAdminBrandsQuery } from './useAdminBrandsQuery'
import { BrandStatusChip } from '../StatusChip'

export function BrandManager() {
  const queryClient = useQueryClient()
  const brandsQuery = useAdminBrandsQuery()
  const brands = useMemo(() => brandsQuery.data ?? [], [brandsQuery.data])

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isCreating, startCreate] = useTransition()
  const [, startFlip] = useTransition()

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ADMIN_BRANDS_KEY })
  }

  const slugPreview = slug.trim() || (name.trim() ? slugify(name) : '—')

  function submitCreate() {
    if (!name.trim()) return
    startCreate(async () => {
      const result = await createBrand({ name: name.trim(), slug: slug.trim() || undefined })
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo crear / Could not create: ${result.error.message}` })
        return
      }
      setBanner({ tone: 'positive', text: `Marca ${result.data.slug} creada / Brand created.` })
      setName('')
      setSlug('')
      invalidate()
    })
  }

  function flipStatus(brandId: string, to: BrandStatus) {
    setPendingId(brandId)
    startFlip(async () => {
      const result = await setBrandStatus(brandId, to)
      setPendingId(null)
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo cambiar el estado / Could not change status: ${result.error.message}` })
        return
      }
      setBanner({ tone: 'positive', text: `Marca → ${result.data.status}.` })
      invalidate()
    })
  }

  const fieldClass =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent'
  const labelClass = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">ADM · Marcas / Brands</span>
        <h1 className="font-display text-t3 text-ink-primary">Marcas / Tenant brands</h1>
        <p className="max-w-2xl font-ui text-t0 text-ink-secondary">
          Cada marca es un tenant aislado (Wings, Áladín, …). Se retiran, nunca se eliminan. / Each brand is an
          isolated tenant. Retire, never delete.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
        <span className={labelClass}>Crear marca / Create brand</span>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Nombre / Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Áladín Exports" className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Slug (opcional / optional)</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={slugPreview}
              className={`${fieldClass} font-mono`}
            />
          </label>
        </div>
        <div>
          <button
            type="button"
            onClick={submitCreate}
            disabled={isCreating || name.trim().length === 0}
            className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
          >
            Crear / Create
          </button>
        </div>
      </section>

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      {brandsQuery.error ? (
        <p role="alert" className="font-ui text-t0 text-negative">
          No se pudieron cargar las marcas / Could not load brands: {brandsQuery.error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full border-collapse">
          <thead className="bg-surface-1">
            <tr className="border-b border-line">
              {['Slug', 'Nombre / Name', 'Estado / Status', 'Acciones / Actions'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => {
              const target: BrandStatus = brand.status === 'ACTIVE' ? 'RETIRED' : 'ACTIVE'
              return (
                <tr key={brand.id} className="border-b border-line last:border-b-0 hover:bg-surface-1">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-t0 text-ink-primary">{brand.slug}</td>
                  <td className="px-3 py-2 font-ui text-t0 text-ink-secondary">{brand.name}</td>
                  <td className="px-3 py-2">
                    <BrandStatusChip status={brand.status} />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => flipStatus(brand.id, target)}
                      disabled={pendingId === brand.id}
                      className="rounded-card border border-line px-2.5 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-ink-primary disabled:opacity-40"
                    >
                      {target === 'RETIRED' ? 'Retirar / Retire' : 'Reactivar / Reinstate'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!brandsQuery.isLoading && brands.length === 0 ? (
          <div className="px-3 py-6 text-center font-ui text-t0 text-ink-secondary">
            Sin marcas todavía / No brands yet.
          </div>
        ) : null}
      </div>
    </div>
  )
}
