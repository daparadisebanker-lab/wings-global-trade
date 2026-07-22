'use client'

// Cubicaje — the isometric container fill, surfaced on the ERP container detail
// (shell IA/UI Phase D). Reuses the FitScene organ (previously reachable only
// inside a Mister chat bubble) on a navy "moment tile" so its gold-on-steel
// palette reads on the light ERP ground. Fill % + CBM figures come straight off
// the container row — no new computation, no Mister. Styling is scoped under
// .tower-cubicaje (globals.css), independent of mister-dock.css load order.
import { FitScene } from '@/components/shell/FitScene'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'

export function ContainerCubicaje({
  code,
  committedCbm,
  capacityCbm,
  fillPercent,
  locale = DEFAULT_LOCALE,
}: {
  code: string
  committedCbm: number
  capacityCbm: number
  fillPercent: number
  locale?: Locale
}) {
  const nf = (n: number) => n.toLocaleString(locale === 'es' ? 'es-PE' : 'en-US', { maximumFractionDigits: 2 })
  const available = Math.max(0, capacityCbm - committedCbm)
  return (
    <section aria-label={t({ es: 'Cubicaje', en: 'Container fit' }, locale)} className="flex flex-col gap-3">
      <span className="font-mono text-label uppercase tracking-[0.14em] text-ink-secondary">
        {t({ es: 'Cubicaje / Container fit', en: 'Container fit / Cubicaje' }, locale)}
      </span>
      <div className="tower-cubicaje tower-tile flex flex-col gap-5 rounded-panel p-5 sm:flex-row sm:items-center">
        <div className="w-full max-w-[260px] shrink-0">
          <FitScene pct={fillPercent} label={code} />
        </div>
        <dl className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-0.5">
            <dt className="tile-k font-mono text-label uppercase tracking-[0.1em]">{t({ es: 'Cargado', en: 'Loaded' }, locale)}</dt>
            <dd className="tile-v font-mono text-t2" data-numeric>
              {Math.round(fillPercent)}%
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="tile-k font-mono text-label uppercase tracking-[0.1em]">{t({ es: 'Disponible', en: 'Available' }, locale)}</dt>
            <dd className="tile-v font-mono text-t2" data-numeric>
              {nf(available)} <span className="text-t0">CBM</span>
            </dd>
          </div>
          <div className="col-span-2 flex flex-col gap-0.5">
            <dt className="tile-k font-mono text-label uppercase tracking-[0.1em]">
              {t({ es: 'Comprometido / Capacidad', en: 'Committed / Capacity' }, locale)}
            </dt>
            <dd className="tile-v font-mono text-t1" data-numeric>
              {nf(committedCbm)} / {nf(capacityCbm)} <span className="text-t0">CBM</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
