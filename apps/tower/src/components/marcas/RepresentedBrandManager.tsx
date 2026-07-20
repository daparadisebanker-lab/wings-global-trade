'use client'

// Represented-Brands console — brand registry + retire (RB Console Wave 1, Ch 01).
// Models on the admin BrandManager: create-form mints an append-only RB/xx code,
// the table shows each brand's status + kit gate with the legal next-status flips
// (retire = PAUSED/ENDED, never delete). The kit panel + membership matrix are
// separate reused-organ surfaces (Wave 1b). Capabilities hide UI only — the DB
// (column revoke + RLS + validators) is the real gate.
import { useState, useTransition } from 'react'
import {
  listRepresentedBrands,
  registerRepresentedBrand,
  setRepresentedBrandStatus,
  type RepresentedBrandRow,
} from '@/lib/actions/represented-brands'
import { nextRbStatuses, type RbStatus } from '@/lib/actions/represented-brands-logic'
import { BrandKitPanel } from './BrandKitPanel'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT = 'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

const STATUS_STYLE: Record<RbStatus, string> = {
  PROSPECT: 'text-ink-secondary',
  NEGOTIATION: 'text-ink-secondary',
  SIGNED: 'text-ink-secondary',
  ONBOARDING: 'text-accent',
  BRAND_REVIEW: 'text-accent',
  LIVE: 'text-positive',
  PAUSED: 'text-ink-secondary',
  ENDED: 'text-negative line-through',
}

export function RepresentedBrandManager({ initialBrands }: { initialBrands: RepresentedBrandRow[] }) {
  const [brands, setBrands] = useState(initialBrands)
  const [name, setName] = useState('')
  const [categories, setCategories] = useState('')
  const [registryLine, setRegistryLine] = useState<string | null>(null)
  const [kitFor, setKitFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function refresh() {
    startTransition(async () => {
      const res = await listRepresentedBrands()
      if (res.data) setBrands(res.data)
    })
  }

  function handleCreate() {
    if (!name.trim()) {
      setError('Ingresa un nombre / Enter a name')
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await registerRepresentedBrand({
        name: name.trim(),
        categories: categories.split(',').map((c) => c.trim()).filter(Boolean),
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      setBrands((b) => [...b, res.data].sort((x, y) => x.code.localeCompare(y.code)))
      setRegistryLine(res.data.registryLine)
      setName('')
      setCategories('')
    })
  }

  function handleStatus(brand: RepresentedBrandRow, to: RbStatus) {
    setError(null)
    startTransition(async () => {
      const res = await setRepresentedBrandStatus(brand.id, to)
      if (res.error) {
        setError(res.error.message)
        return
      }
      setBrands((b) => b.map((x) => (x.id === res.data.id ? res.data : x)))
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Create */}
      <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-4">
        <label className="flex flex-col gap-1">
          <span className={LABEL}>Nombre de marca</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={`w-56 ${INPUT}`} />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className={LABEL}>Categorías (coma)</span>
          <input value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="higiene, hogar" className={`w-full ${INPUT}`} />
        </label>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          Registrar marca / Register
        </button>
      </div>

      {registryLine ? (
        <div className="rounded-card border border-line bg-surface-1 p-3">
          <p className={LABEL}>Pega esta línea en packages/liveries/registry.md · Represented brands</p>
          <code className="mt-1 block font-mono text-t0 text-ink-primary">{registryLine}</code>
        </div>
      ) : null}

      {error ? <p role="alert" className="font-ui text-t0 text-negative">{error}</p> : null}

      {/* Registry table */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className={LABEL}>Marcas representadas</h3>
          <button type="button" onClick={refresh} className={`${LABEL} hover:text-lane-accent`}>Recargar</button>
        </div>
        {brands.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin marcas todavía / No brands yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
            {brands.map((b) => (
              <li key={b.id} className="flex flex-col gap-3 px-4 py-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-t0 text-ink-primary" data-numeric>{b.code}</span>
                    <span className="font-ui text-t0 text-ink-primary">{b.name}</span>
                    <span className="font-mono text-label text-ink-secondary">{b.slug}</span>
                    <span className={`font-mono text-label uppercase tracking-[0.1em] ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                    <span className={`font-mono text-label uppercase tracking-[0.08em] ${b.kitComplete ? 'text-positive' : 'text-ink-secondary'}`}>
                      {b.kitComplete ? 'kit ✓' : 'kit —'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setKitFor((v) => (v === b.id ? null : b.id))}
                      aria-expanded={kitFor === b.id}
                      className="rounded-card border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent"
                    >
                      {kitFor === b.id ? 'Cerrar kit' : 'Kit'}
                    </button>
                    {nextRbStatuses(b.status, b.kitComplete).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatus(b, s)}
                        disabled={isPending}
                        className="rounded-card border border-line px-2 py-1 font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:border-lane-accent disabled:opacity-40"
                      >
                        → {s}
                      </button>
                    ))}
                  </div>
                </div>
                {kitFor === b.id ? <BrandKitPanel brand={b} /> : null}
              </li>
            ))}
          </ul>
        )}
        <p className="font-ui text-label text-ink-secondary">
          Kit de marca y asignación de representantes: Wave 1b (paneles reutilizando MediaManager + UserManager).
        </p>
      </section>
    </div>
  )
}
