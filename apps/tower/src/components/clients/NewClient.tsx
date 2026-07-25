'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { t, type Locale } from '@/lib/i18n'
import {
  createClient,
  listClientBrands,
  listTeamRoster,
  type ClientBrandOption,
  type ClientOwnerOption,
} from '@/lib/actions/clients'
import {
  SOURCE_OPTIONS,
  STAGE_OPTIONS,
  ARCHETYPE_OPTIONS,
  type ClientSource,
  type ClientStage,
  type BuyerArchetype,
} from '@/lib/actions/clients-logic'

const CURRENCIES = ['USD', 'PEN', 'EUR', 'CNY']

/**
 * "+ Nuevo cliente" — the manual create path for the Clients CRM (the other path
 * is Mister's save-draft). A toggled inline form capturing the full profile:
 * identity + origin, what they buy (archetype/category/demand), relationship
 * (stage/owner/score) and a primary contact. RLS gates the write.
 */
export function NewClient({ locale }: { locale: Locale }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [brands, setBrands] = useState<ClientBrandOption[]>([])
  const [roster, setRoster] = useState<ClientOwnerOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  // Identity & origin
  const [brandId, setBrandId] = useState('')
  const [name, setName] = useState('')
  const [source, setSource] = useState<ClientSource | ''>('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  // What they buy
  const [archetype, setArchetype] = useState<BuyerArchetype | ''>('')
  const [category, setCategory] = useState('')
  const [demand, setDemand] = useState('')
  const [currency, setCurrency] = useState('USD')
  // Relationship
  const [stage, setStage] = useState<ClientStage>('lead')
  const [ownerId, setOwnerId] = useState('')
  const [score, setScore] = useState(0)
  const [notes, setNotes] = useState('')
  // Primary contact
  const [contactName, setContactName] = useState('')
  const [contactWhatsapp, setContactWhatsapp] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactRole, setContactRole] = useState('')

  useEffect(() => {
    if (!open) return
    let live = true
    listClientBrands().then((res) => {
      if (!live || res.error) return
      setBrands(res.data)
      if (res.data.length === 1) setBrandId(res.data[0].id)
    })
    listTeamRoster().then((res) => {
      if (live && !res.error) setRoster(res.data)
    })
    return () => {
      live = false
    }
  }, [open])

  function reset() {
    setName('')
    setSource('')
    setCountry('')
    setRegion('')
    setCity('')
    setArchetype('')
    setCategory('')
    setDemand('')
    setCurrency('USD')
    setStage('lead')
    setOwnerId('')
    setScore(0)
    setNotes('')
    setContactName('')
    setContactWhatsapp('')
    setContactEmail('')
    setContactRole('')
    setError(null)
  }

  function onSave() {
    setError(null)
    startSave(async () => {
      const res = await createClient({
        brandId,
        name: name.trim(),
        source: source || null,
        country: country.trim() || null,
        region: region.trim() || null,
        city: city.trim() || null,
        archetype: archetype || null,
        category: category.trim() || null,
        demand: demand.trim() || null,
        currency,
        stage,
        ownerId: ownerId || null,
        score,
        notes: notes.trim() || null,
        contactName: contactName.trim() || null,
        contactWhatsapp: contactWhatsapp.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactRole: contactRole.trim() || null,
      })
      if (res.error) {
        setError(res.error.message)
        return
      }
      reset()
      setOpen(false)
      router.refresh()
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'
  const lbl = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
  const legend = 'font-mono text-label uppercase tracking-[0.12em] text-lane-accent'

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
      >
        {t({ es: '+ Nuevo cliente', en: '+ New client' }, locale)}
      </button>
    )
  }

  const canSave = Boolean(brandId) && name.trim().length > 0 && !saving
  const L = (o: { es: string; en: string }) => (locale === 'es' ? o.es : o.en)

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <label className="flex flex-col gap-1">
        <span className={lbl}>{label}</span>
        {children}
      </label>
    )
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 rounded-card-lg border border-line bg-surface-1 p-4 shadow-elevation-2">
      <span className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        {t({ es: 'Nuevo cliente', en: 'New client' }, locale)}
      </span>

      {/* Identity & origin */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Identidad y origen', en: 'Identity & origin' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t({ es: 'Marca', en: 'Brand' }, locale)}>
            <select className={field} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              <option value="">{t({ es: '— Marca —', en: '— Brand —' }, locale)}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t({ es: 'Nombre o razón social', en: 'Name / company' }, locale)}>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t({ es: 'Origen del lead', en: 'Lead source' }, locale)}>
            <select className={field} value={source} onChange={(e) => setSource(e.target.value as ClientSource | '')}>
              <option value="">{t({ es: '— Origen —', en: '— Source —' }, locale)}</option>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {L(o)}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label={t({ es: 'País', en: 'Country' }, locale)}>
              <input className={field} value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
            <Field label={t({ es: 'Región', en: 'Region' }, locale)}>
              <input className={field} value={region} onChange={(e) => setRegion(e.target.value)} />
            </Field>
            <Field label={t({ es: 'Ciudad', en: 'City' }, locale)}>
              <input className={field} value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* What they buy */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Qué compra', en: 'What they buy' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t({ es: 'Perfil de compra', en: 'Buyer archetype' }, locale)}>
            <select
              className={field}
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as BuyerArchetype | '')}
            >
              <option value="">{t({ es: '— Perfil —', en: '— Archetype —' }, locale)}</option>
              {ARCHETYPE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {L(o)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t({ es: 'Categoría de interés', en: 'Category of interest' }, locale)}>
            <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className={lbl}>{t({ es: 'Demanda', en: 'Demand' }, locale)}</span>
            <textarea
              className={`${field} min-h-[64px] resize-y`}
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              placeholder={t(
                { es: 'p. ej. 2 contenedores/mes de molduras 600×120', en: 'e.g. 2 containers/mo of 600×120 moldings' },
                locale,
              )}
            />
          </label>
          <Field label={t({ es: 'Moneda', en: 'Currency' }, locale)}>
            <select className={field} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Relationship */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Relación', en: 'Relationship' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label={t({ es: 'Etapa', en: 'Stage' }, locale)}>
            <select className={field} value={stage} onChange={(e) => setStage(e.target.value as ClientStage)}>
              {STAGE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {L(o)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t({ es: 'Responsable', en: 'Owner' }, locale)}>
            <select className={field} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">{t({ es: 'Yo', en: 'Me' }, locale)}</option>
              {roster.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t({ es: 'Score (0–100)', en: 'Score (0–100)' }, locale)}>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              className={`${field} tabular-nums`}
              value={score}
              onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              data-numeric
            />
          </Field>
        </div>
        <label className="flex flex-col gap-1">
          <span className={lbl}>{t({ es: 'Notas', en: 'Notes' }, locale)}</span>
          <textarea
            className={`${field} min-h-[56px] resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      {/* Primary contact */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Contacto principal', en: 'Primary contact' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t({ es: 'Nombre', en: 'Name' }, locale)}>
            <input className={field} value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Field>
          <Field label={t({ es: 'Cargo', en: 'Role' }, locale)}>
            <input className={field} value={contactRole} onChange={(e) => setContactRole(e.target.value)} />
          </Field>
          <Field label="WhatsApp">
            <input className={field} value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={field} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </Field>
        </div>
      </div>

      {error ? <p className="font-ui text-t0 text-negative">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-50"
        >
          {saving ? t({ es: 'Guardando…', en: 'Saving…' }, locale) : t({ es: 'Guardar', en: 'Save' }, locale)}
        </button>
        <button
          type="button"
          onClick={() => {
            reset()
            setOpen(false)
          }}
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
        </button>
      </div>
    </div>
  )
}
