// src/components/features/cubicaje/CubicajeTool.tsx
// The contained cubicaje mode (scoped-experience law): a standalone
// blueprint room. Enter with a product's dims prefilled or type any cargo
// dims by hand; the tool computes and draws how the units fit a container.
// Everything here is estimation for planning — the caveat is structural,
// and no availability or pricing ever appears (wholesale law).
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CONTAINER_KINDS,
  fitInContainer,
  type ContainerKindSpec,
  type UnitDims,
} from '@/lib/cubicaje/fit'
import { ContainerFitDiagram } from '@wings/trade-ui'
import { TechDraw } from '@wings/trade-ui'

interface Props {
  initialDims?: UnitDims | null
  productName?: string | null
  productHref?: string | null
}

const nf = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

export function CubicajeTool({ initialDims, productName, productHref }: Props) {
  const [l, setL] = useState(initialDims ? String(initialDims.l) : '')
  const [w, setW] = useState(initialDims ? String(initialDims.w) : '')
  const [h, setH] = useState(initialDims ? String(initialDims.h) : '')
  const [kg, setKg] = useState(initialDims && initialDims.kg > 0 ? String(initialDims.kg) : '')
  const [rotatable, setRotatable] = useState(true)
  const [stackable, setStackable] = useState(false)
  const [kind, setKind] = useState<ContainerKindSpec['kind']>('40HC')

  const unit: UnitDims = {
    l: Number(l) || 0,
    w: Number(w) || 0,
    h: Number(h) || 0,
    kg: Number(kg) || 0,
  }
  const hasDims = unit.l > 0 && unit.w > 0 && unit.h > 0

  const results = useMemo(
    () =>
      CONTAINER_KINDS.map((c) => ({
        container: c,
        fit: hasDims ? fitInContainer(unit, c, { rotatable, stackable }) : null,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unit.l, unit.w, unit.h, unit.kg, rotatable, stackable, hasDims],
  )
  const active = results.find((r) => r.container.kind === kind) ?? results[2]

  const inputCls =
    'h-12 w-full border border-warm-white/20 bg-transparent px-3 font-mono text-[16px] tabular-nums text-warm-white placeholder:text-warm-white/30 focus:border-gold focus:outline-none'
  const labelCls = 'mb-1.5 block font-mono text-[11px] uppercase tracking-widest-2 text-warm-white/50'

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(300px,380px)_1fr]">
      {/* ── Controls ── */}
      <div className="space-y-7">
        {productName && (
          <p className="border-l-2 border-gold pl-3 text-body-sm text-warm-white/70">
            Dimensiones cargadas de{' '}
            {productHref ? (
              <Link href={productHref} className="font-semibold text-warm-white underline decoration-gold/50 underline-offset-2">
                {productName}
              </Link>
            ) : (
              <span className="font-semibold text-warm-white">{productName}</span>
            )}{' '}
            — puede ajustarlas.
          </p>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="cj-l" className={labelCls}>Longitud · mm</label>
            <input id="cj-l" type="number" min={1} inputMode="numeric" value={l} onChange={(e) => setL(e.target.value)} placeholder="4115" className={inputCls} />
          </div>
          <div>
            <label htmlFor="cj-w" className={labelCls}>Ancho · mm</label>
            <input id="cj-w" type="number" min={1} inputMode="numeric" value={w} onChange={(e) => setW(e.target.value)} placeholder="1910" className={inputCls} />
          </div>
          <div>
            <label htmlFor="cj-h" className={labelCls}>Altura · mm</label>
            <input id="cj-h" type="number" min={1} inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} placeholder="2657" className={inputCls} />
          </div>
        </div>
        <div>
          <label htmlFor="cj-kg" className={labelCls}>Peso por unidad · kg (opcional)</label>
          <input id="cj-kg" type="number" min={0} inputMode="numeric" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="4720" className={inputCls} />
        </div>

        {/* Assumption toggles — the buyer controls them, we never guess */}
        <fieldset className="space-y-2.5">
          <legend className={labelCls}>Supuestos de estiba</legend>
          <Toggle
            id="cj-rot"
            checked={rotatable}
            onChange={setRotatable}
            label="Se puede girar en planta"
            hint="Permite orientar la carga a lo largo o a lo ancho"
          />
          <Toggle
            id="cj-stack"
            checked={stackable}
            onChange={setStackable}
            label="Se puede apilar"
            hint="Maquinaria y vehículos normalmente NO se apilan"
          />
        </fieldset>

        {/* Container kinds */}
        <div>
          <span className={labelCls}>Contenedor</span>
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Tipo de contenedor">
            {results.map(({ container, fit }) => (
              <button
                key={container.kind}
                type="button"
                role="tab"
                aria-selected={kind === container.kind}
                onClick={() => setKind(container.kind)}
                className={`border px-2 py-2.5 text-center transition-colors ${
                  kind === container.kind
                    ? 'border-gold bg-gold/10 text-warm-white'
                    : 'border-warm-white/15 text-warm-white/60 hover:border-warm-white/40'
                }`}
              >
                <span className="block font-mono text-[12px] uppercase tracking-widest-2">{container.kind}</span>
                <span className="block font-mono text-[17px] font-semibold tabular-nums">
                  {fit ? nf.format(fit.count) : '—'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Result ── */}
      <div className="min-w-0">
        {hasDims && active.fit ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-display-lg leading-none text-warm-white">
                {nf.format(active.fit.count)}
              </span>
              <span className="text-body-lg text-warm-white/70">
                unidades en un {active.container.label}
              </span>
            </div>

            <TechDraw>
              <ContainerFitDiagram container={active.container} fit={active.fit} />
            </TechDraw>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-warm-white/15 pt-4 font-mono text-[14px] tabular-nums text-warm-white/80 sm:grid-cols-4">
              <div>
                <dt className="text-[11px] uppercase tracking-widest-2 text-warm-white/45">Disposición</dt>
                <dd>{active.fit.grid.alongL} × {active.fit.grid.alongW} × {active.fit.grid.layers}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest-2 text-warm-white/45">Volumen usado</dt>
                <dd>{Math.round(active.fit.volumeUtilization * 100)} %</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest-2 text-warm-white/45">Peso total</dt>
                <dd>{active.fit.totalKg > 0 ? `${nf.format(active.fit.totalKg)} kg` : 'sin dato'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest-2 text-warm-white/45">Límite</dt>
                <dd>{active.fit.weightBound ? `peso (${nf.format(active.fit.volumetricCount)} por volumen)` : 'volumen'}</dd>
              </div>
            </dl>

            <p className="max-w-xl text-[13px] leading-relaxed text-warm-white/50">
              Estimación geométrica con orientación simple — no es un plan de estiba
              certificado. Embalaje, trincaje y accesos pueden variar el resultado;
              el cálculo definitivo lo confirma el equipo con la ficha real de carga.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/cotizar"
                className="inline-flex h-12 items-center bg-gold px-8 font-mono text-[11px] uppercase tracking-[0.12em] text-navy transition-colors hover:bg-gold-hover"
              >
                Cotizar esta carga
              </Link>
              {productHref && (
                <Link
                  href={productHref}
                  className="inline-flex h-12 items-center border border-warm-white/25 px-6 font-mono text-[11px] uppercase tracking-[0.12em] text-warm-white/80 transition-colors hover:border-warm-white/60"
                >
                  ← Volver al producto
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] items-center justify-center border border-dashed border-warm-white/20 p-10 text-center">
            <p className="max-w-sm text-body-md text-warm-white/50">
              Ingrese las tres dimensiones de su carga — el contenedor se dibuja al
              instante con las unidades que entran.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  hint,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint: string
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
      />
      <span>
        <span className="block text-body-sm font-medium text-warm-white/85">{label}</span>
        <span className="block text-[12px] text-warm-white/45">{hint}</span>
      </span>
    </label>
  )
}
