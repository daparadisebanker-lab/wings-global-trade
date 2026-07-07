'use client'

// Register a new lane (COMPONENT_TREE §6 LaneRegistry). The code is allocated
// append-only server-side; this form previews it (nextLaneCode) but the action
// is authoritative. Archetype must be one of the six (lib/archetypes) — the
// select reads the list, never hardcodes it.
import { useMemo, useState, useTransition } from 'react'
import { listArchetypes, getArchetypeConfig } from '@/lib/archetypes'
import { nextLaneCode, suggestLanePrefix, slugify } from '@/lib/actions/admin-logic'
import { registerLane, type BrandRow, type LaneAdminRow } from '@/lib/actions/admin'
import { t } from '@/lib/i18n'

export function RegisterLaneForm({
  brands,
  lanes,
  onRegistered,
}: {
  brands: BrandRow[]
  lanes: LaneAdminRow[]
  onRegistered: () => void
}) {
  const [brandId, setBrandId] = useState<string>(brands[0]?.id ?? '')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [prefix, setPrefix] = useState('')
  const [prefixTouched, setPrefixTouched] = useState(false)
  const [archetype, setArchetype] = useState<string>(listArchetypes()[0] ?? 'EQUIPMENT')
  const [scope, setScope] = useState('')
  const [banner, setBanner] = useState<{ tone: 'positive' | 'negative'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const allCodes = useMemo(() => lanes.map((l) => l.code), [lanes])
  const selectedBrand = brands.find((b) => b.id === brandId) ?? null

  // Suggested prefix follows the selected brand's existing codes until the
  // operator edits it (append-only WGT/NN — the suggestion, then their call).
  const suggestedPrefix = useMemo(() => {
    if (!selectedBrand) return ''
    const brandCodes = lanes.filter((l) => l.brandId === selectedBrand.id).map((l) => l.code)
    return suggestLanePrefix(selectedBrand.slug, brandCodes)
  }, [selectedBrand, lanes])

  const effectivePrefix = prefixTouched ? prefix : suggestedPrefix
  const codePreview = effectivePrefix ? nextLaneCode(allCodes, effectivePrefix) : '—'
  const slugPreview = slug.trim() || (name.trim() ? slugify(name) : '—')

  function submit() {
    if (!brandId || !name.trim()) return
    startTransition(async () => {
      const result = await registerLane({
        brandId,
        name: name.trim(),
        slug: slug.trim() || undefined,
        archetype: archetype as Parameters<typeof registerLane>[0]['archetype'],
        codePrefix: effectivePrefix,
        scope: scope.trim() || undefined,
      })
      if (result.error) {
        setBanner({ tone: 'negative', text: `No se pudo registrar / Could not register: ${result.error.message}` })
        return
      }
      setBanner({ tone: 'positive', text: `Lane ${result.data.code} registrada (OPENING) / registered.` })
      setName('')
      setSlug('')
      setScope('')
      setPrefixTouched(false)
      onRegistered()
    })
  }

  const fieldClass =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary focus-visible:border-lane-accent'
  const labelClass = 'font-mono text-label uppercase tracking-[0.1em] text-ink-secondary'

  return (
    <section className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4">
      <span className={labelClass}>Registrar lane / Register lane</span>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Marca / Brand</span>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={`${fieldClass} font-mono`}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.slug})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Arquetipo / Archetype</span>
          <select value={archetype} onChange={(e) => setArchetype(e.target.value)} className={`${fieldClass} font-mono`}>
            {listArchetypes().map((code) => (
              <option key={code} value={code}>
                {code} · {t(getArchetypeConfig(code).label)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Nombre / Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medical & Clinical" className={fieldClass} />
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

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Prefijo código / Code prefix</span>
          <input
            value={effectivePrefix}
            onChange={(e) => {
              setPrefixTouched(true)
              setPrefix(e.target.value.toUpperCase())
            }}
            placeholder="WGT"
            className={`${fieldClass} font-mono uppercase`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClass}>Alcance / Scope (opcional)</span>
          <input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Una línea ES/EN" className={fieldClass} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-3">
        <span className="font-mono text-t0 text-ink-secondary">
          Código / Code:{' '}
          <span className="text-ink-primary" data-numeric>
            {codePreview}
          </span>
        </span>
        <span className="font-mono text-t0 text-ink-secondary">
          Slug: <span className="text-ink-primary">{slugPreview}</span>
        </span>
      </div>

      {banner ? (
        <p role="status" className={`font-ui text-t0 ${banner.tone === 'positive' ? 'text-positive' : 'text-negative'}`}>
          {banner.text}
        </p>
      ) : null}

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !brandId || name.trim().length === 0 || !effectivePrefix}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
        >
          Registrar / Register
        </button>
      </div>
    </section>
  )
}
