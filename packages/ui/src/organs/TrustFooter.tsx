// @wings/trade-ui · TrustFooter — the shared site/lane footer (ecosystem §2).
// Extracted from apps/site navigation/Footer (M3). Markup is byte-identical to the
// original; all lane-specific content (logo, tagline, links, zones, markets,
// contact, colophon) is injected as props so the organ carries no Wings hardcodes.
// Token-styled only. Server Component (no client interactivity) so the app's
// server-rendered footer can pass render callbacks without an RSC boundary error.

import type { ReactNode } from 'react'

export interface FooterCategory {
  id: string
  slug: string
  name: string
}

export interface FooterLink {
  href: string
  label: string
}

export interface FooterZone {
  name: string
  location: string
}

export interface TrustFooterProps {
  /** Renders a link. Injected so the organ stays framework-agnostic (app passes next/link). */
  renderLink: (href: string, className: string, children: ReactNode) => ReactNode
  logoSrc: string
  logoAlt: string
  tagline: string
  categories: FooterCategory[]
  catalogAllHref: string
  catalogAllLabel: string
  catalogHref: (slug: string) => string
  services: FooterLink[]
  zones: FooterZone[]
  marketsLabel: string
  markets: string[]
  email: string
  whatsappHref: string
  whatsappLabel: string
  quoteHref: string
  quoteLabel: string
  originLabel: string
  origins: string
  colophon: ReactNode
  labels: {
    catalog: string
    services: string
    operations: string
    markets: string
    contact: string
  }
}

export function TrustFooter({
  renderLink,
  logoSrc,
  logoAlt,
  tagline,
  categories,
  catalogAllHref,
  catalogAllLabel,
  catalogHref,
  services,
  zones,
  marketsLabel,
  markets,
  email,
  whatsappHref,
  whatsappLabel,
  quoteHref,
  quoteLabel,
  originLabel,
  origins,
  colophon,
  labels,
}: TrustFooterProps) {
  return (
    <footer className="bg-[#000C1F] text-warm-white">
      {/* Brand strip — full width with gold rule */}
      <div className="border-b border-warm-white/[0.05] px-6 py-16 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-14 w-auto brightness-0 invert opacity-90"
            />
            <p className="mt-4 max-w-xs font-body text-sm font-light leading-relaxed text-warm-white/30 tracking-wide">
              {tagline}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-gold/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-warm-white/60 transition-all duration-200 hover:border-gold/60 hover:text-gold"
            >
              <span className="h-px w-4 bg-gold/40" aria-hidden />
              {whatsappLabel}
            </a>
            {renderLink(
              quoteHref,
              'inline-flex items-center gap-3 bg-gold px-6 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-navy transition-colors duration-200 hover:bg-gold-hover',
              <>
                <span className="h-px w-4 bg-current" aria-hidden />
                {quoteLabel}
              </>,
            )}
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-6 py-10 md:px-10 md:py-12">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 md:grid-cols-4">
          {/* Catálogo */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              {labels.catalog}
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                {renderLink(
                  catalogAllHref,
                  'font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white',
                  catalogAllLabel,
                )}
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  {renderLink(
                    catalogHref(c.slug),
                    'font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white',
                    c.name,
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              {labels.services}
            </p>
            <ul className="flex flex-col gap-2">
              {services.map((s) => (
                <li key={s.href}>
                  {renderLink(
                    s.href,
                    'font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white',
                    s.label,
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Operaciones */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              {labels.operations}
            </p>
            <ul className="flex flex-col gap-2">
              {zones.map((z) => (
                <li key={z.name} className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] text-warm-white/50">{z.name}</span>
                  <span className="font-mono text-[10px] text-warm-white/30">{z.location}</span>
                </li>
              ))}
              <li className="mt-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
                  {marketsLabel}
                </p>
                <p className="font-mono text-[10px] leading-loose text-warm-white/30">
                  {markets.join(' · ')}
                </p>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold/35">
              {labels.contact}
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="font-mono text-[11px] text-warm-white/50 transition-colors duration-150 hover:text-warm-white"
                >
                  {email}
                </a>
              </li>
              <li className="pt-2">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/20">
                  {originLabel}
                </p>
                <p className="font-mono text-[10px] leading-loose text-warm-white/30">
                  {origins}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-warm-white/[0.05] px-6 py-6 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-warm-white/20">
            {colophon}
          </p>
        </div>
      </div>
    </footer>
  )
}
