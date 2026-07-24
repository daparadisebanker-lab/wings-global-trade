'use client'

// Ajustes-lite (Mister Torre A4): the policy driving the quote run, made visible and
// editable. Host-Tower chrome (light tokens, no World-B here — this is Tower config,
// not a Mister artifact). Shows the lane's freight/insurance rate tables, tariff (HS)
// positions and org_rules; lets an operator add a dated freight rate (RLS enforces the
// write role — a VIEWER's insert simply fails and the banner says so).
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@wings/trade-ui'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { useTorrePolicyLanesQuery, useTorrePolicyQuery } from './useTorrePolicyQuery'
import { addFreightRate } from '@/lib/actions/torre-policy'

function money(minor: number, currency: string): string {
  return `${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

const TH = 'px-2 py-1 text-left font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const TD = 'px-2 py-1 font-mono text-label text-ink-primary'

export function TorrePolicyPanel({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const lanes = useTorrePolicyLanesQuery()
  const [laneId, setLaneId] = useState<string | null>(null)
  useEffect(() => {
    if (!laneId && lanes.data && lanes.data.length > 0) setLaneId(lanes.data[0].id)
  }, [lanes.data, laneId])

  const policy = useTorrePolicyQuery(laneId)
  const qc = useQueryClient()
  const [pending, startTransition] = useTransition()
  const [banner, setBanner] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null)

  // add-freight-rate form
  const [form, setForm] = useState({ route: '', mode: 'SEA', containerType: '40HC', rate: '', validFrom: '', validTo: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const canSubmit = useMemo(
    () =>
      !!laneId &&
      !!form.route.trim() &&
      Number(form.rate) > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(form.validFrom) &&
      // a typed-but-malformed validTo is rejected, never silently dropped (would make an
      // open-ended rate that the expiry blocker can never fire on)
      (form.validTo.trim() === '' || (/^\d{4}-\d{2}-\d{2}$/.test(form.validTo) && form.validTo >= form.validFrom)),
    [laneId, form],
  )

  function submit() {
    if (!laneId || !canSubmit) return
    startTransition(async () => {
      const r = await addFreightRate({
        laneId,
        kind: 'FREIGHT',
        route: form.route.trim(),
        mode: form.mode as 'SEA' | 'AIR' | 'LAND',
        containerType: (form.containerType || null) as '20GP' | '40GP' | '40HC' | 'LCL' | 'RORO' | null,
        rateMinor: Math.round(Number(form.rate) * 100),
        validFrom: form.validFrom,
        validTo: form.validTo && /^\d{4}-\d{2}-\d{2}$/.test(form.validTo) ? form.validTo : null,
        source: null,
      })
      if (r.error) setBanner({ text: r.error.message, tone: 'err' })
      else {
        setBanner({ text: t({ es: 'Tarifa agregada', en: 'Rate added' }, locale), tone: 'ok' })
        setForm((f) => ({ ...f, route: '', rate: '' }))
        void qc.invalidateQueries({ queryKey: ['tower', 'intelligence', 'torre-policy', laneId] })
      }
    })
  }

  if (lanes.isLoading) return <p className="font-ui text-t0 text-ink-secondary">{t({ es: 'Cargando…', en: 'Loading…' }, locale)}</p>
  if (lanes.isError) return <p className="font-ui text-t0 text-negative">{lanes.error?.message}</p>
  if (lanes.data && lanes.data.length === 0)
    return <p className="font-ui text-t0 text-ink-secondary">{t({ es: 'Sin lanes accesibles.', en: 'No accessible lanes.' }, locale)}</p>

  const p = policy.data
  // Showing the previous lane's policy while the new one loads → dim so numbers are
  // never mistaken for the selected lane's.
  const stale = policy.isPlaceholderData && policy.isFetching

  return (
    <div className="flex flex-col gap-5">
      {/* Lane picker */}
      <label className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
        Lane
        <select
          value={laneId ?? ''}
          onChange={(e) => setLaneId(e.target.value)}
          className="rounded-control border border-line bg-surface-1 px-2 py-1 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent"
        >
          {(lanes.data ?? []).map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} · {l.name}
            </option>
          ))}
        </select>
        <span aria-hidden className="font-mono text-label text-ink-tertiary">{stale ? '…' : ''}</span>
      </label>

      {policy.isError && <p className="font-ui text-t0 text-negative">{policy.error?.message}</p>}

      {/* Org rules summary */}
      {p?.orgRules && (
        <section className={cn('rounded-card-lg border border-line bg-surface-1 p-4', stale && 'opacity-60 transition-opacity')}>
          <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-lane-accent">{t({ es: 'Reglas comerciales', en: 'Commercial rules' }, locale)}</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-label text-ink-primary sm:grid-cols-4">
            <div>
              <span className="text-ink-tertiary">{t({ es: 'Margen', en: 'Margin' }, locale)}</span> {(p.orgRules.marginDefaultBps / 100).toFixed(0)}%
            </div>
            <div>
              <span className="text-ink-tertiary">Incoterm</span> {p.orgRules.incotermDefault}
            </div>
            <div>
              <span className="text-ink-tertiary">{t({ es: 'Validez', en: 'Validity' }, locale)}</span> {p.orgRules.validityDays}d
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-ink-tertiary">{t({ es: 'Reglas margen', en: 'Margin rules' }, locale)}</span>{' '}
              {Object.keys(p.orgRules.marginRules).length}
            </div>
          </div>
        </section>
      )}

      {/* Rate tables */}
      <section className={cn('rounded-card-lg border border-line bg-surface-1 p-4', stale && 'opacity-60 transition-opacity')}>
        <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-lane-accent">{t({ es: 'Tarifas (flete/seguro)', en: 'Rates (freight/insurance)' }, locale)}</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className={TH}>{t({ es: 'Ruta', en: 'Route' }, locale)}</th>
                <th className={TH}>{t({ es: 'Modo', en: 'Mode' }, locale)}</th>
                <th className={TH}>{t({ es: 'Cont.', en: 'Cont.' }, locale)}</th>
                <th className={cn(TH, 'text-right')}>{t({ es: 'Tarifa', en: 'Rate' }, locale)}</th>
                <th className={TH}>{t({ es: 'Vigencia', en: 'Validity' }, locale)}</th>
              </tr>
            </thead>
            <tbody>
              {(p?.rateTables ?? []).map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className={TD}>{r.route}</td>
                  <td className={TD}>{r.mode}</td>
                  <td className={TD}>{r.containerType ?? '—'}</td>
                  <td className={cn(TD, 'text-right tabular-nums')}>{money(r.rateMinor, r.currency)}</td>
                  <td className={TD}>
                    {r.validFrom} → {r.validTo ?? '∞'}
                  </td>
                </tr>
              ))}
              {(p?.rateTables ?? []).length === 0 && (
                <tr>
                  <td className={cn(TD, 'text-ink-tertiary')} colSpan={5}>
                    {t({ es: 'Sin tarifas.', en: 'No rates.' }, locale)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* add freight rate */}
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <input aria-label={t({ es: 'Ruta', en: 'Route' }, locale)} value={form.route} onChange={set('route')} placeholder={t({ es: 'Ruta p.ej. CN-SHANGHAI>PE-CALLAO', en: 'Route e.g. CN-SHANGHAI>PE-CALLAO' }, locale)} className="min-w-[180px] flex-1 rounded-control border border-line bg-surface-0 px-2 py-1 font-mono text-label text-ink-primary outline-none focus-visible:border-lane-accent" />
          <select aria-label={t({ es: 'Modo', en: 'Mode' }, locale)} value={form.mode} onChange={set('mode')} className="rounded-control border border-line bg-surface-0 px-2 py-1 font-mono text-label text-ink-primary">
            <option>SEA</option>
            <option>AIR</option>
            <option>LAND</option>
          </select>
          <select aria-label={t({ es: 'Contenedor', en: 'Container' }, locale)} value={form.containerType} onChange={set('containerType')} className="rounded-control border border-line bg-surface-0 px-2 py-1 font-mono text-label text-ink-primary">
            <option value="">—</option>
            <option>20GP</option>
            <option>40GP</option>
            <option>40HC</option>
            <option>LCL</option>
            <option>RORO</option>
          </select>
          <input aria-label={t({ es: 'Tarifa USD', en: 'Rate USD' }, locale)} value={form.rate} onChange={set('rate')} inputMode="decimal" placeholder="USD" className="w-24 rounded-control border border-line bg-surface-0 px-2 py-1 font-mono text-label text-ink-primary outline-none focus-visible:border-lane-accent" />
          <input aria-label={t({ es: 'Vigente desde', en: 'Valid from' }, locale)} value={form.validFrom} onChange={set('validFrom')} placeholder={t({ es: 'desde AAAA-MM-DD', en: 'from YYYY-MM-DD' }, locale)} className="w-36 rounded-control border border-line bg-surface-0 px-2 py-1 font-mono text-label text-ink-primary outline-none focus-visible:border-lane-accent" />
          <input aria-label={t({ es: 'Vigente hasta', en: 'Valid to' }, locale)} value={form.validTo} onChange={set('validTo')} placeholder={t({ es: 'hasta AAAA-MM-DD', en: 'to YYYY-MM-DD' }, locale)} className="w-36 rounded-control border border-line bg-surface-0 px-2 py-1 font-mono text-label text-ink-primary outline-none focus-visible:border-lane-accent" />
          <button
            type="button"
            disabled={!canSubmit || pending}
            onClick={submit}
            className={cn('rounded-control px-3 py-1 font-ui text-t0 outline-none', canSubmit && !pending ? 'bg-accent text-accent-ink hover:opacity-90' : 'cursor-not-allowed bg-surface-2 text-ink-tertiary')}
          >
            {t({ es: 'Agregar tarifa', en: 'Add rate' }, locale)}
          </button>
        </div>
        {banner && (
          <div role="status" aria-live="polite" className={cn('mt-2 font-ui text-t0', banner.tone === 'ok' ? 'text-positive' : 'text-negative')}>
            {banner.text}
          </div>
        )}
      </section>

      {/* Tariff positions */}
      <section className={cn('rounded-card-lg border border-line bg-surface-1 p-4', stale && 'opacity-60 transition-opacity')}>
        <h3 className="mb-2 font-mono text-label uppercase tracking-[0.1em] text-lane-accent">{t({ es: 'Partidas arancelarias (HS)', en: 'Tariff positions (HS)' }, locale)}</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className={TH}>HS</th>
                <th className={TH}>{t({ es: 'Descripción', en: 'Description' }, locale)}</th>
                <th className={cn(TH, 'text-right')}>Ad Val.</th>
                <th className={TH}>{t({ es: 'Verificada', en: 'Verified' }, locale)}</th>
              </tr>
            </thead>
            <tbody>
              {(p?.tariffPositions ?? []).map((tp) => (
                <tr key={tp.hsCode} className="border-b border-line">
                  <td className={TD}>{tp.hsCode}</td>
                  <td className={cn(TD, 'whitespace-normal')}>{tp.description}</td>
                  <td className={cn(TD, 'text-right tabular-nums')}>{(tp.dutyBps / 100).toFixed(0)}%</td>
                  <td className={cn(TD, tp.verifiedAt ? 'text-positive' : 'text-negative')}>{tp.verifiedAt ? tp.verifiedAt.slice(0, 10) : t({ es: 'no', en: 'no' }, locale)}</td>
                </tr>
              ))}
              {(p?.tariffPositions ?? []).length === 0 && (
                <tr>
                  <td className={cn(TD, 'text-ink-tertiary')} colSpan={4}>
                    {t({ es: 'Sin partidas.', en: 'No positions.' }, locale)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
