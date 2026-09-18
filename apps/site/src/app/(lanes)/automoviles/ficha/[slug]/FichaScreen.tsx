// src/app/(lanes)/automoviles/ficha/[slug]/FichaScreen.tsx
//
// The on-screen ficha técnica — the conversion page (rebuild brief §3):
// full-bleed hero, sticky sub-nav (Resumen · Versiones · Especificaciones ·
// Cotizar), a real trim/version table, spec block grouped by real fields,
// and a persistent "Solicitar cotización" CTA carrying the model name into
// the quote form. Print stays entirely separate — the existing
// FichaAutomovilDocument + PrintBar (page.tsx) render alongside this, in a
// `hidden print:block` sibling never shown on screen, so window.print()
// keeps producing the same verified A4 sheet this route already shipped.
// This tree gets `print:hidden` so the two never appear together.
import Image from 'next/image'
import Link from 'next/link'
import type { FichaDocument } from '@/lib/automoviles/ficha'
import { pluralizeCount } from '@/lib/pluralize'
import { SpecTable, TrimTable } from '@/components/features/automoviles/SpecTable'
import { VehicleTypeIcon, type VehicleSegmentSlug } from '@/components/features/automoviles/VehicleTypeIcon'

const SUB_NAV = [
  { href: '#resumen', label: 'Resumen' },
  { href: '#versiones', label: 'Versiones' },
  { href: '#especificaciones', label: 'Especificaciones' },
  { href: '#cotizar', label: 'Cotizar' },
] as const

export function FichaScreen({ doc, heroImage }: { doc: FichaDocument; heroImage?: string }) {
  const quoteHref = `/cotizar?producto=${encodeURIComponent(`${doc.brand ? `${doc.brand.name} ` : ''}${doc.nameEs}`)}`
  const backHref = doc.brand ? `/automoviles/marcas/${doc.brand.slug}` : '/automoviles/marcas'

  return (
    <div data-oem={doc.brand?.slug} className="print:hidden">
      {heroImage ? (
        <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-[color:var(--surface-2)]">
          <Image
            src={heroImage}
            alt={`${doc.nameEs} — ${doc.segmentLabel ? `${doc.segmentLabel}, ` : ''}vista tres cuartos`}
            fill
            priority
            sizes="100vw"
            className="object-contain object-center p-8 md:p-16"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[color:var(--surface-0)] to-transparent"
          />
          <div className="relative z-[1] mx-auto w-full max-w-4xl px-5 pb-10 md:px-8">
            {doc.brand && (
              <p className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--oem-accent,_var(--accent-ink))]">
                {doc.brand.name}
              </p>
            )}
            <h1 className="mt-2 font-display text-display-lg text-[color:var(--ink-primary)] md:text-display-xl">
              {doc.nameEs}
            </h1>
          </div>
        </section>
      ) : (
        <section className="border-b border-[color:var(--ink-decoration)]">
          <div className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-20">
            {doc.brand && (
              <p className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--oem-accent,_var(--accent-ink))]">
                {doc.brand.name}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {doc.segmentSlug && (
                <VehicleTypeIcon
                  segment={doc.segmentSlug as VehicleSegmentSlug}
                  bodyColor="var(--ink-decoration)"
                  accentColor="var(--oem-accent,_var(--accent-ink))"
                  className="h-12 w-20 shrink-0"
                />
              )}
              <h1 className="font-display text-display-lg text-[color:var(--ink-primary)] md:text-display-xl">
                {doc.nameEs}
              </h1>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
              Ficha disponible · foto pendiente
            </p>
          </div>
        </section>
      )}

      {/* Sticky sub-nav — offset below the fixed SiteNav + AutoLaneNav
          chrome, same two-bar height budget FilterBar's sticky offset
          already uses on brand/segment pages. */}
      <nav
        aria-label="Secciones de la ficha técnica"
        className="sticky top-[6.5rem] z-20 border-b border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)]/95 backdrop-blur md:top-[7rem]"
      >
        <div className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-5 md:px-8">
          {SUB_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 px-3 py-3.5 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink-primary)]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
        <section id="resumen" className="scroll-mt-32">
          <h2 className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
            Resumen
          </h2>
          {doc.descriptionEs && (
            <p className="mt-4 max-w-2xl text-body-lg text-[color:var(--ink-secondary)]">{doc.descriptionEs}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
            <span>{doc.reference}</span>
            {doc.segmentLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{doc.segmentLabel}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{pluralizeCount(doc.trims.length, 'versión', 'versiones')}</span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={quoteHref}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--oem-accent,_var(--btn-primary-bg))] px-8 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              Solicitar cotización
            </Link>
            <Link
              href={backHref}
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] border border-[color:var(--btn-outline-border)] px-8 font-mono text-sm uppercase tracking-wide text-[color:var(--btn-outline-ink)] transition-colors hover:bg-[color:var(--btn-outline-bg-hover)]"
            >
              {doc.brand ? `Ver catálogo ${doc.brand.name}` : 'Ver catálogo'}
            </Link>
          </div>
        </section>

        <section id="versiones" className="mt-16 scroll-mt-32">
          <h2 className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
            Versiones {doc.trims.length > 0 ? `(${doc.trims.length})` : ''}
          </h2>
          <div className="mt-6">
            <TrimTable trims={doc.trims} commonSpecs={doc.specs.filter((s) => s.label !== 'Segmento')} />
          </div>
        </section>

        <section id="especificaciones" className="mt-16 scroll-mt-32">
          <h2 className="font-mono text-mono-sm uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
            Especificaciones
          </h2>
          <div className="mt-6">
            <SpecTable groups={doc.specGroups} />
          </div>
          {doc.sourceMarkets.length > 0 && (
            <p className="mt-6 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
              Origen: {doc.sourceMarkets.join(' · ')}
            </p>
          )}
          <p className="mt-6 max-w-2xl text-body-sm text-[color:var(--ink-secondary)]">
            Ficha de referencia — especificación básica de catálogo. La configuración final,
            disponibilidad y condiciones se confirman con un asesor al cotizar. Este documento no
            exhibe precio.
          </p>
        </section>

        <section
          id="cotizar"
          className="mt-16 scroll-mt-32 flex flex-col gap-6 border border-[color:var(--ink-decoration)] bg-[color:var(--surface-2)] p-8 md:flex-row md:items-center md:justify-between"
        >
          <div className="max-w-xl">
            <h2 className="font-display text-display-sm text-[color:var(--ink-primary)]">
              Cotizar {doc.nameEs}
            </h2>
            <p className="mt-3 text-body-md text-[color:var(--ink-secondary)]">
              Por unidad configurada o por contenedor — un asesor confirma especificación exacta y
              condiciones. Sin precio publicado, sin registro previo.
            </p>
          </div>
          <Link
            href={quoteHref}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--oem-accent,_var(--btn-primary-bg))] px-8 font-mono text-sm uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            Solicitar cotización
          </Link>
        </section>
      </div>

      {/* Persistent mobile CTA bar — desktop already keeps the CTA within
          one scroll of the sub-nav at all times; on a short mobile
          viewport the anchor sections can push it further away, so this
          stays pinned instead. Right padding clears the site-wide Mister
          launcher (fixed bottom-6 right-6, 96px wide — MisterLauncher.tsx),
          which is mounted on every page and must never be hidden or moved
          for one route; this bar accommodates it instead. */}
      <div className="sticky bottom-0 z-20 border-t border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)]/95 py-4 pl-4 pr-32 backdrop-blur md:hidden">
        <Link
          href={quoteHref}
          className="flex h-12 w-full items-center justify-center rounded-[var(--radius-control)] bg-[color:var(--oem-accent,_var(--btn-primary-bg))] font-mono text-sm uppercase tracking-wide text-white"
        >
          Solicitar cotización
        </Link>
      </div>
    </div>
  )
}
