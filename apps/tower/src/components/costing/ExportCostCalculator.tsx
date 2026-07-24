'use client'

// Export-cost calculator — the ORIGIN archetype's costing surface (root CLAUDE.md
// §3). Inputs on the left, a LIVE cost build-up on the right (the export engine
// runs client-side for instant feedback). Distinct from the import calculator:
// an export sale carries NO destination import taxes, so this is a transparent
// EXW → FOB → CFR → CIF build-up + margin (computeExportCost). Persisting export
// sheets is a follow-up (needs its own table); this cut is a live calculator with
// a copy-the-summary hand-off — no dead controls.
import { useMemo, useState } from 'react'
import { computeExportCost, DEFAULT_EXPORT_INPUTS } from '@/lib/costing/export-engine'
import type { ExportInputs } from '@/lib/costing/export-engine'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

const LABEL = 'font-mono text-label uppercase tracking-[0.08em] text-ink-secondary'
const INPUT =
  'rounded-card border border-line bg-surface-0 px-2 py-1.5 font-mono text-t0 text-ink-primary outline-none focus-visible:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lane-accent'

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Num({ label, value, onChange, step = 'any', hint }: { label: string; value: number; onChange: (v: number) => void; step?: string; hint?: string }) {
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
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </fieldset>
  )
}

/** One build-up row — label · USD amount (mono, tabular). `strong` for the tiers
 *  the quote actually rests on (the quoted Incoterm base + the final offer). */
function Row({ label, value, strong = false, accent = false }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2 ${strong ? 'bg-surface-2' : ''}`}>
      <span className={`font-mono text-label uppercase tracking-[0.08em] ${strong ? 'text-ink-primary' : 'text-ink-secondary'}`}>{label}</span>
      <span className={`font-mono tabular-nums ${accent ? 'text-lane-accent' : strong ? 'text-ink-primary' : 'text-ink-secondary'} ${strong ? 'text-t1' : 'text-t0'}`} data-numeric>
        {value}
      </span>
    </div>
  )
}

const INCOTERMS: ExportInputs['incoterm'][] = ['EXW', 'FOB', 'CFR', 'CIF']

export function ExportCostCalculator({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const [inputs, setInputs] = useState<ExportInputs>(DEFAULT_EXPORT_INPUTS)
  const [copied, setCopied] = useState(false)

  function set<K extends keyof ExportInputs>(key: K, value: ExportInputs[K]) {
    setInputs((p) => ({ ...p, [key]: value }))
  }

  const result = useMemo(() => {
    try {
      return computeExportCost(inputs)
    } catch {
      return null
    }
  }, [inputs])

  async function copySummary() {
    if (!result) return
    const lines = [
      `${inputs.productName || t({ es: 'Oferta de exportación', en: 'Export offer' }, locale)} — ${inputs.originLabel}`,
      `${t({ es: 'Incoterm', en: 'Incoterm' }, locale)}: ${inputs.incoterm}`,
      `EXW: ${money(result.exwCost)}`,
      `FOB: ${money(result.fobCost)}`,
      `CFR: ${money(result.cfrCost)}`,
      `CIF: ${money(result.cifCost)}`,
      `${t({ es: 'Base', en: 'Base' }, locale)} (${inputs.incoterm}): ${money(result.offerBaseCost)}`,
      `${t({ es: 'Margen', en: 'Margin' }, locale)}: ${money(result.marginUSD)} (${(result.marginRate * 100).toFixed(1)}%)`,
      `${t({ es: 'Oferta', en: 'Offer' }, locale)} ${inputs.incoterm}: ${money(result.offerPrice)} · ${money(result.offerPricePerUnit)}/${inputs.unitLabel}`,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — nothing to surface */
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,420px)_1fr]">
      {/* Inputs */}
      <div className="flex flex-col gap-3">
        <Group title={t({ es: 'Identidad', en: 'Identity' }, locale)}>
          <Text label={t({ es: 'Producto', en: 'Product' }, locale)} value={inputs.productName} onChange={(v) => set('productName', v)} />
          <Text label={t({ es: 'Origen', en: 'Origin' }, locale)} value={inputs.originLabel} onChange={(v) => set('originLabel', v)} />
          <label className="flex flex-col gap-1">
            <span className={LABEL}>Incoterm</span>
            <select value={inputs.incoterm} onChange={(e) => set('incoterm', e.target.value as ExportInputs['incoterm'])} className={INPUT}>
              {INCOTERMS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <Num label={t({ es: 'Cantidad', en: 'Quantity' }, locale)} value={inputs.quantity} onChange={(v) => set('quantity', v)} step="1" />
          <Text label={t({ es: 'Unidad', en: 'Unit' }, locale)} value={inputs.unitLabel} onChange={(v) => set('unitLabel', v)} />
        </Group>

        <Group title={t({ es: 'Costos de origen (USD)', en: 'Origin costs (USD)' }, locale)}>
          <Num label={t({ es: 'Mercadería (EXW)', en: 'Goods (EXW)' }, locale)} value={inputs.goodsCost} onChange={(v) => set('goodsCost', v)} />
          <Num label={t({ es: 'Flete interno', en: 'Inland freight' }, locale)} value={inputs.inlandFreight} onChange={(v) => set('inlandFreight', v)} />
          <Num label={t({ es: 'Manipuleo / embarque', en: 'Handling / loading' }, locale)} value={inputs.exportHandling} onChange={(v) => set('exportHandling', v)} />
          <Num label={t({ es: 'Documentación', en: 'Documentation' }, locale)} hint={t({ es: 'certificados', en: 'certificates' }, locale)} value={inputs.documentation} onChange={(v) => set('documentation', v)} />
          <Num label={t({ es: 'Agente de aduana', en: 'Customs broker' }, locale)} value={inputs.customsBrokerageOrigin} onChange={(v) => set('customsBrokerageOrigin', v)} />
          <Num label={t({ es: 'Otros', en: 'Other' }, locale)} value={inputs.otherOriginCharges} onChange={(v) => set('otherOriginCharges', v)} />
        </Group>

        <Group title={t({ es: 'Flete y seguro', en: 'Freight & insurance' }, locale)}>
          <Num label={t({ es: 'Flete internacional', en: 'Int’l freight' }, locale)} hint="CFR/CIF" value={inputs.internationalFreight} onChange={(v) => set('internationalFreight', v)} />
          <Num label={t({ es: 'Seguro %', en: 'Insurance %' }, locale)} hint="CIF" value={inputs.insuranceRate * 100} onChange={(v) => set('insuranceRate', v / 100)} />
        </Group>

        <Group title={t({ es: 'Margen', en: 'Margin' }, locale)}>
          <label className="flex flex-col gap-1">
            <span className={LABEL}>{t({ es: 'Modo', en: 'Mode' }, locale)}</span>
            <select value={inputs.marginMode} onChange={(e) => set('marginMode', e.target.value as ExportInputs['marginMode'])} className={INPUT}>
              <option value="percent">percent</option>
              <option value="target_price">target_price</option>
            </select>
          </label>
          {inputs.marginMode === 'percent' ? (
            <Num label={t({ es: 'Margen %', en: 'Margin %' }, locale)} value={inputs.marginPercent * 100} onChange={(v) => set('marginPercent', v / 100)} />
          ) : (
            <Num label={t({ es: 'Precio objetivo', en: 'Target price' }, locale)} value={inputs.targetOfferPrice} onChange={(v) => set('targetOfferPrice', v)} />
          )}
        </Group>
      </div>

      {/* Live build-up */}
      <div className="flex flex-col gap-4">
        {result ? (
          <>
            <div className="flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line">
              <Row label="EXW" value={money(result.exwCost)} />
              <Row label={`FOB${inputs.incoterm === 'FOB' ? ' ◂' : ''}`} value={money(result.fobCost)} strong={inputs.incoterm === 'FOB'} />
              <Row label={`CFR${inputs.incoterm === 'CFR' ? ' ◂' : ''}`} value={money(result.cfrCost)} strong={inputs.incoterm === 'CFR'} />
              <Row label={t({ es: 'Seguro', en: 'Insurance' }, locale)} value={money(result.insurance)} />
              <Row label={`CIF${inputs.incoterm === 'CIF' ? ' ◂' : ''}`} value={money(result.cifCost)} strong={inputs.incoterm === 'CIF'} />
              <Row label={`${t({ es: 'Base', en: 'Base' }, locale)} · ${inputs.incoterm}${inputs.incoterm === 'EXW' ? ' ◂' : ''}`} value={money(result.offerBaseCost)} strong={inputs.incoterm === 'EXW'} />
              <Row label={`${t({ es: 'Margen', en: 'Margin' }, locale)} · ${(result.marginRate * 100).toFixed(1)}%`} value={money(result.marginUSD)} />
              <Row label={`${t({ es: 'Oferta', en: 'Offer' }, locale)} · ${inputs.incoterm}`} value={money(result.offerPrice)} strong accent />
              <Row label={`${t({ es: 'Por', en: 'Per' }, locale)} ${inputs.unitLabel}`} value={money(result.offerPricePerUnit)} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copySummary}
                className="rounded-card border border-line px-3 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-primary hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
              >
                {copied ? t({ es: 'Copiado ✓', en: 'Copied ✓' }, locale) : t({ es: 'Copiar resumen', en: 'Copy summary' }, locale)}
              </button>
              <span className="font-mono text-label text-ink-secondary">
                {t({ es: 'Guardar la hoja de exportación llega pronto.', en: 'Saving the export sheet is coming soon.' }, locale)}
              </span>
            </div>
          </>
        ) : (
          <p className="font-ui text-t0 text-ink-secondary">{t({ es: 'Revisa los valores para ver el cálculo.', en: 'Check the values to see the calculation.' }, locale)}</p>
        )}
      </div>
    </div>
  )
}
