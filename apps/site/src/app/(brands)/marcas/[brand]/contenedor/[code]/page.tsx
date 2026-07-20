// src/app/(brands)/marcas/[brand]/contenedor/[code]/page.tsx
// Contenedor activo — the public marketing landing for a PROMOTED container
// (container-promotion feature, root CLAUDE.md §5-bis). This is the URL the
// share card and WhatsApp copy point to. Server component: reads the promoted
// container from public.rb_active_containers (fixture fallback without env),
// renders the pitch + slot visualization + specs, and sends the reader into the
// buy-in configurator to reserve. No online payment — the wholesale directive.
import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContainerSliceDiagram } from '@wings/trade-ui'
import { getBrand } from '@/lib/rb/fixtures'
import { getActiveContainer, type RbActiveContainer } from '@/lib/rb/data'

// Same staleness rule as the configurator (SPEC §2.7④): a stale «quedan 3»
// destroys trust — revalidate at most every 60 s.
export const revalidate = 60

interface PageProps {
  params: Promise<{ brand: string; code: string }>
}

function routeLabel(c: RbActiveContainer): string {
  return c.copy.routeLabel ?? `${c.route.origin ?? '—'} → ${c.route.destination ?? 'Callao'}`
}

function specRows(c: RbActiveContainer): { label: string; value: string }[] {
  if (c.copy.specs && c.copy.specs.length) return c.copy.specs
  const f = c.productFacts
  const unit = f.unitNamePlural ?? c.unitNamePlural
  const rows: { label: string; value: string }[] = []
  if (f.packagesPerSlot && f.unitsPerPackage)
    rows.push({ label: 'Por cupo', value: `${f.packagesPerSlot} cajas · ${f.packagesPerSlot * f.unitsPerPackage} ${unit}` })
  if (f.unitsPerPackage) rows.push({ label: 'Por caja', value: `${f.unitsPerPackage} ${unit}` })
  if (f.packetsPerPackage) rows.push({ label: 'Empaques por caja', value: String(f.packetsPerPackage) })
  if (f.packageKg != null) rows.push({ label: 'Peso por caja', value: `${f.packageKg} kg` })
  if (f.gtin) rows.push({ label: 'GTIN', value: f.gtin })
  return rows
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: slug, code } = await params
  const brand = getBrand(slug)
  const c = brand ? await getActiveContainer(slug, code) : null
  if (!brand || !c) return {}
  const headline = c.copy.headline ?? c.productName
  return {
    title: `Contenedor de ${headline} — ${c.slots.available} cupos disponibles`,
    description: `Contenedor de ${headline} en ruta ${routeLabel(c)}: ${c.slots.available} de ${c.slots.total} cupos disponibles. Compra al por mayor${
      c.copy.priceNote ? ` ${c.copy.priceNote}` : ' a precio especial'
    }. Reserva documentada, sin pago en línea.`,
  }
}

export default async function ActiveContainerPage({ params }: PageProps) {
  const { brand: slug, code } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()
  const c = await getActiveContainer(slug, code)
  if (!c) notFound()

  const headline = c.copy.headline ?? c.productName
  const unit = c.copy.unitLabel ?? 'cupos'
  const specs = specRows(c)
  const f = c.productFacts
  const perSlotUnits = f.packagesPerSlot && f.unitsPerPackage ? f.packagesPerSlot * f.unitsPerPackage : undefined
  // Map the diagram's tokens to the brand's --rb-* set (same as the configurator).
  const csdTokens = {
    '--csd-accent': 'var(--rb-accent)',
    '--csd-accent-ink': 'var(--rb-accent-ink)',
    '--csd-accent-soft': 'var(--rb-accent-soft)',
    '--csd-ink': 'var(--rb-ink)',
    '--csd-tint': 'var(--rb-surface-tint)',
  } as CSSProperties

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-widest-2 text-[var(--rb-accent-ink)]">
          {brand.code} · {c.code} · Contenedor activo
        </p>
        <h1 className="mt-5 font-display text-display-md text-neutral-900">Contenedor de {headline}</h1>
        <p className="mt-4 text-body-md text-neutral-600">
          {c.slots.available} de {c.slots.total} {unit} disponibles en ruta {routeLabel(c)}. Compra al por mayor
          {c.copy.priceNote ? ` ${c.copy.priceNote}` : ' a precio especial'}. La reserva es documentada, sin pago en
          línea, y un asesor confirma condiciones dentro de las 72 horas.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Slot visualization — the shared ContainerSliceDiagram organ, themed
            to the brand's --rb-* set (identical grammar to the configurator). */}
        <section>
          <div style={csdTokens}>
            <ContainerSliceDiagram
              kind={c.containerKind}
              slots={{ total: c.slots.total, committed: c.slots.committed, reserved: c.slots.reserved }}
              headline={`${c.containerKind} · ${c.slots.total} ${unit} · vendido ■ reservado ▨ disponible □`}
              caption={
                perSlotUnits
                  ? `1 cupo = ${f.packagesPerSlot} cajas = ${perSlotUnits.toLocaleString('es-PE')} ${f.unitNamePlural ?? c.unitNamePlural} — ${c.slots.available} disponibles`
                  : `${c.slots.available} de ${c.slots.total} ${unit} disponibles`
              }
            />
          </div>
          {c.closesAt ? (
            <p className="mt-3 font-mono text-[12px] tabular-nums text-neutral-500">
              Cierra {new Date(c.closesAt).toLocaleDateString('es-PE')}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/marcas/${brand.slug}/contenedor`}
              className="inline-flex h-12 items-center justify-center rounded-wings bg-[var(--rb-accent-ink)] px-7 text-label-lg font-semibold text-white transition-opacity hover:opacity-90"
            >
              Reservar cupo
            </Link>
            <Link
              href={`/marcas/${brand.slug}/productos`}
              className="inline-flex h-12 items-center justify-center rounded-wings border border-neutral-300 px-7 text-label-lg font-semibold text-neutral-900 transition-colors hover:border-neutral-900"
            >
              Ver productos
            </Link>
          </div>
        </section>

        {/* Specs */}
        <section>
          <span className="font-mono text-[11px] uppercase tracking-widest-2 text-neutral-500">Especificaciones</span>
          <dl className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
            {specs.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-body-sm text-neutral-500">{s.label}</dt>
                <dd className="font-mono text-body-md text-neutral-900">{s.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-body-sm text-neutral-500">Contenedor</dt>
              <dd className="font-mono text-body-md text-neutral-900">{c.containerKind}</dd>
            </div>
          </dl>
          <p className="mt-6 text-body-sm text-neutral-500">
            Representado por Wings Global Trade. Venta mayorista exclusiva por contenedor — completo o por cupos.
          </p>
        </section>
      </div>
    </div>
  )
}
