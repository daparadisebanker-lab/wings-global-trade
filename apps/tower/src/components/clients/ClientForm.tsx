'use client'

import { useState, useTransition } from 'react'
import { t, type Locale } from '@/lib/i18n'
import {
  createClient,
  updateClient,
  type ClientBrandOption,
  type ClientOwnerOption,
} from '@/lib/actions/clients'
import {
  SOURCE_OPTIONS,
  STAGE_OPTIONS,
  ARCHETYPE_OPTIONS,
  type ClientListItem,
  type ClientSource,
  type ClientStage,
  type BuyerArchetype,
} from '@/lib/actions/clients-logic'

const CURRENCIES = ['USD', 'PEN', 'EUR', 'CNY']

export interface ClientFormInitial {
  id?: string
  brandId?: string
  name?: string
  source?: ClientSource | ''
  country?: string
  region?: string
  city?: string
  archetype?: BuyerArchetype | ''
  category?: string
  demand?: string
  currency?: string
  stage?: ClientStage
  ownerId?: string
  score?: number
  notes?: string
  contactName?: string
  contactWhatsapp?: string
  contactEmail?: string
  contactRole?: string
}

/** Build the form's starting values from an existing client (edit). */
export function initialFromClient(c: ClientListItem): ClientFormInitial {
  return {
    id: c.id,
    name: c.name,
    source: c.source ?? '',
    country: c.country ?? '',
    region: c.region ?? '',
    city: c.city ?? '',
    archetype: c.archetype ?? '',
    category: c.category ?? '',
    demand: c.demand ?? '',
    currency: c.currency,
    stage: c.stage,
    ownerId: c.ownerId ?? '',
    score: c.score,
    notes: c.notes ?? '',
    contactName: c.primaryContact?.name ?? '',
    contactWhatsapp: c.primaryContact?.whatsapp ?? '',
    contactEmail: c.primaryContact?.email ?? '',
    contactRole: c.primaryContact?.role ?? '',
  }
}

/**
 * The client create/edit form. Create (no initial.id) → createClient; edit
 * (initial.id) → updateClient. Also the review surface for a WhatsApp-extracted
 * draft: `aiFilled` names the fields Mister populated, so each is badged "IA" and
 * a banner surfaces what's still blank (Directive 7 — the human reviews + saves).
 */
export function ClientForm({
  locale,
  brands,
  roster,
  initial = {},
  aiFilled,
  onDone,
  onCancel,
}: {
  locale: Locale
  brands: ClientBrandOption[]
  roster: ClientOwnerOption[]
  initial?: ClientFormInitial
  aiFilled?: Set<string>
  onDone: (item: ClientListItem) => void
  onCancel: () => void
}) {
  const isEdit = Boolean(initial.id)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSave] = useTransition()

  const [brandId, setBrandId] = useState(initial.brandId ?? (brands.length === 1 ? brands[0].id : ''))
  const [name, setName] = useState(initial.name ?? '')
  const [source, setSource] = useState<ClientSource | ''>(initial.source ?? '')
  const [country, setCountry] = useState(initial.country ?? '')
  const [region, setRegion] = useState(initial.region ?? '')
  const [city, setCity] = useState(initial.city ?? '')
  const [archetype, setArchetype] = useState<BuyerArchetype | ''>(initial.archetype ?? '')
  const [category, setCategory] = useState(initial.category ?? '')
  const [demand, setDemand] = useState(initial.demand ?? '')
  const [currency, setCurrency] = useState(initial.currency ?? 'USD')
  const [stage, setStage] = useState<ClientStage>(initial.stage ?? 'lead')
  const [ownerId, setOwnerId] = useState(initial.ownerId ?? '')
  const [score, setScore] = useState(initial.score ?? 0)
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [contactName, setContactName] = useState(initial.contactName ?? '')
  const [contactWhatsapp, setContactWhatsapp] = useState(initial.contactWhatsapp ?? '')
  const [contactEmail, setContactEmail] = useState(initial.contactEmail ?? '')
  const [contactRole, setContactRole] = useState(initial.contactRole ?? '')

  function onSave() {
    setError(null)
    startSave(async () => {
      const payload = {
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
      }
      const res = isEdit ? await updateClient({ id: initial.id!, ...payload }) : await createClient(payload)
      if (res.error) {
        setError(res.error.message)
        return
      }
      onDone(res.data)
    })
  }

  const field =
    'rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary'
  const lbl = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
  const legend = 'font-mono text-label uppercase tracking-[0.12em] text-lane-accent'
  const canSave = Boolean(brandId) && name.trim().length > 0 && !saving
  const L = (o: { es: string; en: string }) => (locale === 'es' ? o.es : o.en)
  const ai = (k: string) => Boolean(aiFilled?.has(k))

  // Live "still to complete" list — the important fields Mister can't fill (brand)
  // or didn't find, shown so the reviewer sees the gaps at a glance.
  const missing: string[] = []
  if (!brandId) missing.push(t({ es: 'Marca (obligatoria)', en: 'Brand (required)' }, locale))
  if (!country.trim()) missing.push(t({ es: 'País', en: 'Country' }, locale))
  if (!category.trim()) missing.push(t({ es: 'Categoría', en: 'Category' }, locale))
  if (!demand.trim()) missing.push(t({ es: 'Demanda', en: 'Demand' }, locale))
  if (!contactName.trim()) missing.push(t({ es: 'Contacto', en: 'Contact' }, locale))

  function Field({ label, k, children }: { label: string; k?: string; children: React.ReactNode }) {
    return (
      <label className="flex flex-col gap-1">
        <span className={`flex items-center gap-1.5 ${lbl}`}>
          {label}
          {k && ai(k) ? <IaChip locale={locale} /> : null}
        </span>
        {children}
      </label>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {aiFilled ? (
        <div className="flex flex-col gap-1 rounded-card border border-lane-accent bg-surface-2 p-3">
          <span className="font-mono text-label uppercase tracking-[0.1em] text-lane-accent">
            ✨ {t({ es: 'Perfil extraído por Mister', en: 'Profile extracted by Mister' }, locale)}
          </span>
          <span className="font-ui text-label text-ink-secondary">
            {t(
              {
                es: `Completó ${aiFilled.size} campos (marcados IA). Revísalos y completa lo que falte.`,
                en: `Filled ${aiFilled.size} fields (marked AI). Review them and complete the rest.`,
              },
              locale,
            )}
          </span>
          {missing.length ? (
            <span className="font-ui text-label text-ink-secondary">
              <span className="text-negative">
                {t({ es: 'Falta por completar', en: 'Still to complete' }, locale)}:
              </span>{' '}
              {missing.join(' · ')}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Identity & origin */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Identidad y origen', en: 'Identity & origin' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t({ es: 'Marca', en: 'Brand' }, locale)}>
            <select
              className={`${field} ${aiFilled && !brandId ? 'border-negative' : ''}`}
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">{t({ es: '— Marca —', en: '— Brand —' }, locale)}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t({ es: 'Nombre o razón social', en: 'Name / company' }, locale)} k="name">
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t({ es: 'Origen del lead', en: 'Lead source' }, locale)} k="source">
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
            <Field label={t({ es: 'País', en: 'Country' }, locale)} k="country">
              <input className={field} value={country} onChange={(e) => setCountry(e.target.value)} />
            </Field>
            <Field label={t({ es: 'Región', en: 'Region' }, locale)} k="region">
              <input className={field} value={region} onChange={(e) => setRegion(e.target.value)} />
            </Field>
            <Field label={t({ es: 'Ciudad', en: 'City' }, locale)} k="city">
              <input className={field} value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* What they buy */}
      <div className="flex flex-col gap-2">
        <span className={legend}>{t({ es: 'Qué compra', en: 'What they buy' }, locale)}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t({ es: 'Perfil de compra', en: 'Buyer archetype' }, locale)} k="archetype">
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
          <Field label={t({ es: 'Categoría de interés', en: 'Category of interest' }, locale)} k="category">
            <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className={`flex items-center gap-1.5 ${lbl}`}>
              {t({ es: 'Demanda', en: 'Demand' }, locale)}
              {ai('demand') ? <IaChip locale={locale} /> : null}
            </span>
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
          <Field label={t({ es: 'Moneda', en: 'Currency' }, locale)} k="currency">
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
          <span className={`flex items-center gap-1.5 ${lbl}`}>
            {t({ es: 'Notas', en: 'Notes' }, locale)}
            {ai('notes') ? <IaChip locale={locale} /> : null}
          </span>
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
          <Field label={t({ es: 'Nombre', en: 'Name' }, locale)} k="contactName">
            <input className={field} value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </Field>
          <Field label={t({ es: 'Cargo', en: 'Role' }, locale)} k="contactRole">
            <input className={field} value={contactRole} onChange={(e) => setContactRole(e.target.value)} />
          </Field>
          <Field label="WhatsApp" k="contactWhatsapp">
            <input className={field} value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} />
          </Field>
          <Field label="Email" k="contactEmail">
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
          {saving
            ? t({ es: 'Guardando…', en: 'Saving…' }, locale)
            : isEdit
              ? t({ es: 'Guardar cambios', en: 'Save changes' }, locale)
              : t({ es: 'Guardar', en: 'Save' }, locale)}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
        >
          {t({ es: 'Cancelar', en: 'Cancel' }, locale)}
        </button>
      </div>
    </div>
  )
}

/** A small "IA" badge marking a field Mister auto-filled from the chat. */
function IaChip({ locale }: { locale: Locale }) {
  return (
    <span
      className="rounded-pill border border-lane-accent px-1 font-mono text-[10px] leading-tight tracking-[0.08em] text-lane-accent"
      title={locale === 'es' ? 'Completado por Mister' : 'Filled by Mister'}
    >
      IA
    </span>
  )
}
