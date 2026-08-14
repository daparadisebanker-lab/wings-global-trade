'use client'

// Peru SUNAT cost calculator — the Costing module's hero surface. Inputs on the
// left, a LIVE preview waterfall on the right (the engine runs client-side for
// instant feedback), Save persists an append-only sheet (the server recomputes
// authoritatively). Standalone calculator mode; attach-to-container is a later
// wave. Rates are entered as percentages for the operator and converted to the
// engine's fractions.
import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { computeImportCost, DEFAULT_INPUTS } from '@/lib/costing/engine'
import type { ImportInputs } from '@/lib/costing/types'
import { toMinor } from '@/lib/costing/persistence'
import {
  getCostingReference,
  listCostingContainers,
  saveCostCalculation,
  type CostCalculationRow,
  type CostingContainer,
  type CostingLane,
  type CostingReference,
} from '@/lib/actions/costing'
import { listAccountsForBrand, createRFQ, upsertLines, type AccountOption } from '@/lib/actions/pipeline'
import { getDefaultUnit, type Archetype } from '@/lib/archetypes'
import { resolveAdValoremRate } from '@/lib/costing/ad-valorem'
import {
  GOODS_PROFILES,
  GOODS_PROFILE_ORDER,
  defaultProfileForArchetype,
  inferProfileFromInputs,
  type GoodsProfileId,
} from '@/lib/costing/profiles'
import type { SupplierOfferListItem } from '@/lib/actions/suppliers-logic'
import type { ProductRow } from '@/lib/actions/catalog'
import { exportCostSheetXlsx } from './export'
import { CostWaterfall } from './CostWaterfall'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent'

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Fraction → percent for a controlled input, rounded to kill IEEE dust
 *  (0.29 * 100 = 28.999…, which would rewrite the field under the operator). */
function pct(frac: number): number {
  return Math.round(frac * 1e8) / 1e6
}

function Num({
  label,
  value,
  onChange,
  step = 'any',
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: string
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL}>
        {label}
        {hint ? <span className="ml-1 lowercase text-ink-secondary">· {hint}</span> : null}
      </span>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        data-numeric
        className={`w-full ${INPUT}`}
      />
    </label>
  )
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={`w-full ${INPUT} font-ui`} />
    </label>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-card border border-line bg-surface-1 p-3">
      <legend className="px-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">{title}</legend>
      {/* Stack to one full-width column on phones; pair up only when there is room. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

const VALID_INCOTERMS = new Set(['EXW', 'FOB', 'CFR', 'CIF'])

export function CostCalculator({
  lanes,
  initialHistory,
  prefillOffer = null,
  prefillProduct = null,
}: {
  lanes: CostingLane[]
  initialHistory: CostCalculationRow[]
  /** A Suppliers price-book offer to prefill the form from (the "Costear" hand-off). */
  prefillOffer?: SupplierOfferListItem | null
  /** A Catalog product to prefill the form from (its own "Costear" hand-off) — no
   *  FOB (products don't carry price), but identity, HS code, and the product's own
   *  lane/archetype prefill the profile. */
  prefillProduct?: ProductRow | null
}) {
  const router = useRouter()

  // Goods-type profile — the lane-logic layer. Defaults from the first lane's
  // archetype (never vehicles unless explicitly picked); the operator overrides
  // per calculation. It decides which driver fields show + how ISC is set. A
  // Suppliers price-book hand-off always opens on `vehiculos` — every offer in
  // the catalog today is a vehicle. A Catalog product hand-off opens on ITS OWN
  // lane's archetype instead — products span every archetype, not just vehicles.
  const initialProfile: GoodsProfileId = prefillOffer
    ? 'vehiculos'
    : prefillProduct
      ? defaultProfileForArchetype(prefillProduct.laneArchetype)
      : defaultProfileForArchetype(lanes[0]?.archetype)
  const [profileId, setProfileId] = useState<GoodsProfileId>(initialProfile)
  const [inputs, setInputs] = useState<ImportInputs>(() => ({
    ...DEFAULT_INPUTS,
    // Non-vehicle profiles carry an explicit ISC (0) so the preview + saved sheet
    // agree; vehicles leave it unset so the fuel/CC rule (and its parity) runs.
    iscRate: GOODS_PROFILES[initialProfile].isc === 'auto_fuel_cc' ? undefined : 0,
    ...(prefillOffer
      ? {
          productName: prefillOffer.productLabel,
          origin: 'china' as const,
          incoterm: (prefillOffer.incoterm && VALID_INCOTERMS.has(prefillOffer.incoterm)
            ? prefillOffer.incoterm
            : 'FOB') as ImportInputs['incoterm'],
          fob: prefillOffer.unitPriceMinor !== null ? prefillOffer.unitPriceMinor / 100 : 0,
        }
      : {}),
    ...(prefillProduct
      ? {
          productName: prefillProduct.name.es || prefillProduct.name.en || '',
        }
      : {}),
  }))
  const [laneId, setLaneId] = useState(() => {
    // Prefer the product's own lane when the operator has costing access to it —
    // that's the lane whose IGV/percepción/Ad Valorem config actually applies.
    if (prefillProduct && lanes.some((l) => l.id === prefillProduct.laneId)) return prefillProduct.laneId
    return lanes[0]?.id ?? ''
  })
  const [label, setLabel] = useState(
    prefillOffer ? prefillOffer.productLabel : prefillProduct ? (prefillProduct.name.es || prefillProduct.name.en) : '',
  )
  const [hsCode, setHsCode] = useState(prefillProduct?.hsCode ?? '')
  const [supplierOfferId, setSupplierOfferId] = useState<string | null>(prefillOffer?.id ?? null)
  const [reference, setReference] = useState<CostingReference | null>(null)
  const [containers, setContainers] = useState<CostingContainer[]>([])
  const [containerId, setContainerId] = useState('')
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [accountId, setAccountId] = useState('')
  const [history, setHistory] = useState(initialHistory)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isQuotePending, startQuoteTransition] = useTransition()

  // Config-sourced rate defaults per lane's brand (G5): IGV / percepción /
  // insurance come from versioned costing_config; the Ad Valorem table is used
  // to resolve a rate from the HS code. Applied on lane change; the operator can
  // still override any rate for a one-off.
  useEffect(() => {
    if (!laneId) return
    let active = true
    // Re-default the goods profile from the lane's archetype (operator can override).
    const lane = lanes.find((l) => l.id === laneId)
    const pid = defaultProfileForArchetype(lane?.archetype)
    setProfileId(pid)
    setInputs((p) => ({
      ...p,
      iscRate: GOODS_PROFILES[pid].isc === 'auto_fuel_cc' ? undefined : (p.iscRate ?? 0),
    }))
    getCostingReference(laneId).then((res) => {
      if (!active || res.error) return
      setReference(res.data)
      setInputs((p) => ({
        ...p,
        igvRate: res.data.igvRate,
        percepcionRate: res.data.percepcionRate,
        insuranceRate: res.data.insuranceRate,
        paCuentaRentaRate: res.data.paCuentaRentaRate,
        adValoremRate: resolveAdValoremRate(res.data.adValoremRates, hsCode),
      }))
    })
    setContainerId('')
    listCostingContainers(laneId).then((res) => {
      if (active && res.data) setContainers(res.data)
    })
    setAccountId('')
    if (lane?.brandId) {
      listAccountsForBrand(lane.brandId).then((res) => {
        if (active && res.data) setAccounts(res.data)
      })
    } else {
      setAccounts([])
    }
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laneId])

  function reopen(row: CostCalculationRow) {
    setInputs(row.inputs)
    setProfileId(inferProfileFromInputs(row.inputs))
    setLabel(row.label ?? '')
    setSupplierOfferId(row.supplierOfferId)
    setSaved(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Switch the goods profile: reconcile ISC to the profile's rule — vehicles hand
  // ISC back to the fuel/CC derivation (unset it); others keep an explicit rate
  // (preserve the entered value, default 0). Driver fields never carried by the
  // engine simply stop rendering; their stored values are inert.
  function applyProfile(id: GoodsProfileId) {
    setProfileId(id)
    setInputs((p) => ({
      ...p,
      iscRate: GOODS_PROFILES[id].isc === 'auto_fuel_cc' ? undefined : (p.iscRate ?? 0),
    }))
    setSaved(null)
  }

  const profile = GOODS_PROFILES[profileId]

  function applyHsCode(code: string) {
    setHsCode(code)
    if (reference) set('adValoremRate', resolveAdValoremRate(reference.adValoremRates, code))
  }

  const preview = useMemo(() => {
    try {
      return computeImportCost(inputs)
    } catch {
      return null
    }
  }, [inputs])

  function set<K extends keyof ImportInputs>(key: K, value: ImportInputs[K]) {
    setInputs((p) => ({ ...p, [key]: value }))
    setSaved(null)
  }

  function handleSave() {
    if (!laneId) {
      setError('Selecciona un lane / Select a lane')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await saveCostCalculation({
        laneId,
        containerId: containerId || null,
        supplierOfferId,
        label: label.trim() || null,
        inputs,
      })
      if (result.error) {
        setError(result.error.message)
        return
      }
      setHistory((h) => [result.data, ...h])
      setSaved(result.data.id)
    })
  }

  // Costing → Client → Quotation, one sequenced dynamic: pick who this landed
  // cost is for, open an RFQ against them (createRFQ), seed it with a single
  // line at this calculation's final sale price (upsertLines), then hand off to
  // the Pipeline card where QuoteComposer turns it into the formal quotation —
  // the existing RFQ → quote → send flow, not a second one.
  function handleCreateQuote() {
    if (!laneId || !accountId || !preview) {
      setError('Selecciona un lane y un cliente / Select a lane and a client')
      return
    }
    setError(null)
    startQuoteTransition(async () => {
      const rfqRes = await createRFQ(laneId, { accountId, source: 'MANUAL', currency: 'USD' })
      if (rfqRes.error) {
        setError(rfqRes.error.message)
        return
      }
      const archetype = lanes.find((l) => l.id === laneId)?.archetype as Archetype | undefined
      const unit = archetype ? getDefaultUnit(archetype).id : 'unit'
      const linesRes = await upsertLines(rfqRes.data.id, [
        {
          description: label.trim() || inputs.productName || 'Cotización',
          qty: 1,
          unit,
          targetPriceMinor: toMinor(preview.salePriceFinal),
          currency: 'USD',
        },
      ])
      if (linesRes.error) {
        setError(linesRes.error.message)
        return
      }
      router.push(`/pipeline/${rfqRes.data.id}`)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {prefillOffer ? (
        <p className="rounded-card border border-lane-accent bg-surface-2 px-4 py-2 font-mono text-label uppercase tracking-[0.08em] text-lane-accent">
          Precargado desde Proveedores / Prefilled from Suppliers: {prefillOffer.productLabel} ·{' '}
          {prefillOffer.supplierName || '—'}
        </p>
      ) : null}
      {prefillProduct ? (
        <p className="rounded-card border border-lane-accent bg-surface-2 px-4 py-2 font-mono text-label uppercase tracking-[0.08em] text-lane-accent">
          Precargado desde Catálogo / Prefilled from Catalog: {prefillProduct.name.es || prefillProduct.name.en}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_1fr]">
        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <Group title="Identidad">
            {/* Goods type — filters the form to this kind of cargo's cost drivers. */}
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className={LABEL}>
                Tipo de mercancía
                <span className="ml-1 lowercase text-ink-secondary">· {profile.hintEs}</span>
              </span>
              <select
                value={profileId}
                onChange={(e) => applyProfile(e.target.value as GoodsProfileId)}
                className={INPUT}
              >
                {GOODS_PROFILE_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {GOODS_PROFILES[id].labelEs}
                  </option>
                ))}
              </select>
            </label>

            {profile.identity.map((f) => (
              <Text key={f.key} label={f.labelEs} value={inputs[f.key]} onChange={(v) => set(f.key, v)} />
            ))}

            {profile.vehicleDrivers ? (
              <>
                <label className="flex flex-col gap-1">
                  <span className={LABEL}>Combustible</span>
                  <select
                    value={inputs.fuelType}
                    onChange={(e) => set('fuelType', e.target.value as ImportInputs['fuelType'])}
                    className={INPUT}
                  >
                    <option value="gasoline">gasoline</option>
                    <option value="diesel">diesel</option>
                    <option value="hybrid">hybrid</option>
                    <option value="electric">electric</option>
                  </select>
                </label>
                <Num label="Cilindrada CC" value={inputs.engineCC} onChange={(v) => set('engineCC', v)} step="1" />
                <Num label="Año" value={inputs.year} onChange={(v) => set('year', v)} step="1" />
              </>
            ) : null}
          </Group>

          <Group title="Valores">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Incoterm</span>
              <select
                value={inputs.incoterm}
                onChange={(e) => set('incoterm', e.target.value as ImportInputs['incoterm'])}
                className={INPUT}
              >
                <option value="EXW">EXW</option>
                <option value="FOB">FOB</option>
                <option value="CFR">CFR</option>
                <option value="CIF">CIF</option>
              </select>
            </label>
            <Num label="FOB / valor" value={inputs.fob} onChange={(v) => set('fob', v)} />
            <Num
              label="Transporte origen"
              hint="solo EXW"
              value={inputs.transportOrigin}
              onChange={(v) => set('transportOrigin', v)}
            />
            <Num
              label="Flete internacional"
              hint="EXW/FOB"
              value={inputs.freightInternational}
              onChange={(v) => set('freightInternational', v)}
            />
          </Group>

          <Group title="Gastos locales">
            <Num label="Flete Zofratacna" value={inputs.freightZofratacna} onChange={(v) => set('freightZofratacna', v)} />
            <Num label="Gastos portuarios" value={inputs.portExpenses} onChange={(v) => set('portExpenses', v)} />
            <Num label="Agencia de aduanas" value={inputs.customsAgency} onChange={(v) => set('customsAgency', v)} />
            <Num label="Manipuleo / estiba" value={inputs.handlingStowage} onChange={(v) => set('handlingStowage', v)} />
          </Group>

          <Group title="Tasas (%)">
            <Text label="HS code → Ad Valorem" value={hsCode} onChange={applyHsCode} />
            <Num label="Ad Valorem" value={pct(inputs.adValoremRate)} onChange={(v) => set('adValoremRate', v / 100)} />
            {profile.isc === 'zero_editable' ? (
              <Num label="ISC" value={pct(inputs.iscRate ?? 0)} onChange={(v) => set('iscRate', v / 100)} />
            ) : (
              <label className="flex flex-col gap-1">
                <span className={LABEL}>
                  ISC<span className="ml-1 lowercase text-ink-secondary">· combustible/cc</span>
                </span>
                <div className={`${INPUT} text-ink-secondary`} data-numeric>
                  {pct(preview?.iscRate ?? 0)}
                </div>
              </label>
            )}
            <Num label="IGV" value={pct(inputs.igvRate)} onChange={(v) => set('igvRate', v / 100)} />
            <Num label="Percepción" value={pct(inputs.percepcionRate)} onChange={(v) => set('percepcionRate', v / 100)} />
            <Num label="Seguro" value={pct(inputs.insuranceRate)} onChange={(v) => set('insuranceRate', v / 100)} />
            <Num
              label="Pago a cuenta IR"
              hint="renta"
              value={pct(inputs.paCuentaRentaRate ?? 0.0177)}
              onChange={(v) => set('paCuentaRentaRate', v / 100)}
            />
            <Num label="Tipo de cambio" hint="PEN/USD" value={inputs.exchangeRate} onChange={(v) => set('exchangeRate', v)} />
          </Group>

          <Group title="Margen">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Modo</span>
              <select
                value={inputs.marginMode}
                onChange={(e) => set('marginMode', e.target.value as ImportInputs['marginMode'])}
                className={INPUT}
              >
                <option value="percent">Margen %</option>
                <option value="target_price">Precio objetivo</option>
              </select>
            </label>
            {inputs.marginMode === 'percent' ? (
              <Num label="Margen %" value={pct(inputs.marginPercent)} onChange={(v) => set('marginPercent', v / 100)} />
            ) : (
              <Num label="Precio objetivo" value={inputs.targetSalePrice} onChange={(v) => set('targetSalePrice', v)} />
            )}
          </Group>
        </div>

        {/* Preview + save */}
        <div className="flex flex-col gap-4">
          {preview ? (
            <CostWaterfall result={preview} />
          ) : (
            <p className="font-ui text-t0 text-ink-secondary">Revisa los valores para ver el cálculo.</p>
          )}

          <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-4">
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Lane</span>
              <select value={laneId} onChange={(e) => setLaneId(e.target.value)} className={INPUT}>
                {lanes.length === 0 ? <option value="">— sin acceso —</option> : null}
                {lanes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={LABEL}>Contenedor</span>
              <select value={containerId} onChange={(e) => setContainerId(e.target.value)} className={INPUT}>
                <option value="">— sin contenedor —</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.status}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className={LABEL}>Etiqueta / Label</span>
              <input value={label} onChange={(e) => setLabel(e.target.value)} className={`${INPUT} font-ui`} />
            </label>
            <button
              type="button"
              onClick={() => preview && void exportCostSheetXlsx(inputs, preview, label)}
              disabled={!preview}
              className="rounded-card border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent disabled:opacity-40"
            >
              Exportar XLSX ↓
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !preview}
              className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              Guardar cálculo / Save
            </button>
            {saved ? <span className="font-mono text-label uppercase tracking-[0.08em] text-positive">Guardado</span> : null}
          </div>

          {/* Costing → Client → Quotation, one sequenced dynamic: pick who this
              is for and open the formal quotation directly from the calculation —
              no separate re-entry of the sale price into the pipeline. */}
          <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface-1 p-4">
            <label className="flex flex-1 flex-col gap-1">
              <span className={LABEL}>Cliente / Client</span>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={accounts.length === 0}
                className={`${INPUT} disabled:opacity-40`}
              >
                <option value="">
                  {accounts.length === 0 ? '— sin clientes en este lane —' : '— selecciona cliente / select client —'}
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                    {a.country ? ` · ${a.country}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleCreateQuote}
              disabled={isQuotePending || !preview || !accountId}
              title="Abre un RFQ para este cliente con una línea a este precio de venta / Opens an RFQ for this client with one line at this sale price"
              className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-40"
            >
              Crear cotización →
            </button>
          </div>
          {error ? (
            <p role="alert" className="font-ui text-t0 text-negative">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      {/* History */}
      <section className="flex flex-col gap-2">
        <h3 className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
          Historial / Saved calculations
        </h3>
        {history.length === 0 ? (
          <p className="font-ui text-t0 text-ink-secondary">Sin cálculos guardados / No saved calculations.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line">
            {history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                <button
                  type="button"
                  onClick={() => reopen(h)}
                  title="Reabrir en la calculadora / Re-open in the calculator"
                  className="text-left font-ui text-t0 text-ink-primary hover:text-lane-accent"
                >
                  {h.label || h.inputs.productName || h.inputs.brand || 'Cálculo'}
                  <span className="ml-2 font-mono text-label text-ink-secondary">{h.incoterm}</span>
                </button>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-t0 tabular-nums text-ink-secondary" data-numeric>
                    landed {money(h.landedMinor / 100)} · venta {money(h.salePriceMinor / 100)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void exportCostSheetXlsx(h.inputs, h.result, h.label)}
                    className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
                    title="Re-exportar XLSX / Re-export XLSX"
                  >
                    XLSX ↓
                  </button>
                  <a
                    href={`/cost-sheet/${h.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-label uppercase tracking-[0.08em] text-ink-secondary hover:text-lane-accent"
                    title="Hoja imprimible / Printable sheet (PDF)"
                  >
                    PDF ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
