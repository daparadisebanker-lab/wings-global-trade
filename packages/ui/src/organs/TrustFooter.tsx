// @wings/trade-ui · TrustFooter — the shared site/lane footer (ecosystem §2).
//
// A NAVIGATION HUB, not a link dump. The ecosystem is a branded house of coded
// divisions and the footer is the one surface that has to show all of them at
// once — so its content model is a list of SECTIONS, and opening WGT/03 means
// appending a section, never editing this organ.
//
// COLLAPSIBLE WITHOUT JAVASCRIPT. Each section is a native <details>. On a phone
// it collapses to a row of headings a thumb can scan; from `md` up a CSS rule
// forces every panel open and neutralises the summary, so the desktop reads as
// the column grid it always was. This organ is a Server Component by contract
// (the app passes render callbacks across the RSC boundary), so an accordion
// that needed state would have forced it client-side — and a footer that only
// works after hydration is a footer that does not work.
//
// Themeable, never forkable (root §1.1): a lane sets --chrome-* and the footer
// follows. Every surface that sets nothing renders the house navy it always had.

import type { ReactNode } from 'react'

export interface FooterCategory {
  id: string
  slug: string
  name: string
}

export interface FooterLink {
  href: string
  label: string
  /** External links open in a new tab and skip the router. */
  external?: boolean
  /** A coded division shows its lane code as a stamp beside the label. */
  code?: string
  /** OPENING renders as a dimmed, non-interactive stamp — a promise not yet kept. */
  status?: 'ACTIVE' | 'OPENING'
}

export interface FooterZone {
  name: string
  location: string
}

/** One collapsible group in the hub. */
export interface FooterSection {
  id: string
  label: string
  links?: FooterLink[]
  /** Free-form content for sections that are not a link list (zones, markets). */
  body?: ReactNode
}

export interface TrustFooterProps {
  /** Renders a link. Injected so the organ stays framework-agnostic (app passes next/link). */
  renderLink: (href: string, className: string, children: ReactNode) => ReactNode
  logoSrc: string
  logoAlt: string
  tagline: string
  /** The hub. Order is the reading order; each entry becomes one collapsible group. */
  sections: FooterSection[]
  whatsappHref: string
  whatsappLabel: string
  quoteHref: string
  quoteLabel: string
  colophon: ReactNode
}

const LABEL =
  'font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--chrome-label,rgba(196,147,63,0.35))]'
const ITEM =
  'font-mono text-[11px] text-[color:var(--chrome-ink,#F8F6F0)]/50 transition-colors duration-150 hover:text-[color:var(--chrome-ink,#F8F6F0)]'

export function TrustFooter({
  renderLink,
  logoSrc,
  logoAlt,
  tagline,
  sections,
  whatsappHref,
  whatsappLabel,
  quoteHref,
  quoteLabel,
  colophon,
}: TrustFooterProps) {
  return (
    <footer className="bg-[var(--chrome-ground,#000C1F)] text-[color:var(--chrome-ink,#F8F6F0)]">
      {/* Brand strip */}
      <div className="border-b border-[color:var(--chrome-ink,#F8F6F0)]/[0.05] px-6 py-16 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-14 w-auto opacity-90 brightness-0 invert"
            />
            <p className="mt-4 max-w-xs font-body text-sm font-light leading-relaxed tracking-wide text-[color:var(--chrome-ink,#F8F6F0)]/30">
              {tagline}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-[var(--chrome-label,rgba(196,147,63,0.20))] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--chrome-ink,#F8F6F0)]/60 transition-all duration-200 hover:border-[var(--chrome-accent,var(--color-gold))] hover:text-[color:var(--chrome-ink,#F8F6F0)]"
            >
              <span
                className="h-px w-4 bg-[var(--chrome-accent,var(--color-gold))] opacity-40"
                aria-hidden
              />
              {whatsappLabel}
            </a>
            {renderLink(
              quoteHref,
              'inline-flex items-center gap-3 bg-[var(--chrome-accent,var(--color-gold))] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--chrome-accent-ink,var(--color-navy))] transition-colors duration-200 hover:opacity-90',
              <>
                <span className="h-px w-4 bg-current" aria-hidden />
                {quoteLabel}
              </>,
            )}
          </div>
        </div>
      </div>

      {/* ── The hub ──────────────────────────────────────────────────────────
          Collapsible on a phone, a column grid on desktop, and NO JavaScript in
          either — this organ is a Server Component by contract, and a footer
          that only works after hydration is a footer that does not work.

          Each section renders twice, and that is deliberate. The obvious move is
          one <details> forced open by a media query, but Chrome hides disclosure
          content through the element's own slot, so overriding the child's
          `display` reveals nothing — the desktop footer came back with four
          headings and four empty columns. Rather than chase `::details-content`
          across engines, the panel is authored ONCE as `panel()` and mounted in
          two shells: a real <details> below md, a plain column from md up. Only
          one is ever in the layout, so assistive tech sees one. */}
      <div className="px-6 py-10 md:px-10 md:py-12">
        <nav
          aria-label="Navegación del pie"
          className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-x-10 md:grid-cols-4 md:gap-y-10"
        >
          {sections.map((s) => {
            const panel = (
              <>
                {s.links && (
                  <ul className="flex flex-col gap-2">
                    {s.links.map((l) =>
                      l.status === 'OPENING' ? (
                        // Not a link. An OPENING division has no page behind it,
                        // and a footer entry that navigates nowhere is worse than
                        // one that plainly says "not yet".
                        <li
                          key={l.href}
                          className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] text-[color:var(--chrome-ink,#F8F6F0)]/25"
                        >
                          {l.code && <span>{l.code}</span>}
                          <span>{l.label}</span>
                          <span className="text-[10px] uppercase tracking-[0.12em]">en apertura</span>
                        </li>
                      ) : (
                        <li key={l.href}>
                          {l.external
                            ? renderExternal(l, ITEM)
                            : renderLink(
                                l.href,
                                `${ITEM} inline-flex items-baseline gap-2`,
                                <>
                                  {l.code && (
                                    <span className="text-[color:var(--chrome-ink,#F8F6F0)]/30">
                                      {l.code}
                                    </span>
                                  )}
                                  {l.label}
                                </>,
                              )}
                        </li>
                      ),
                    )}
                  </ul>
                )}
                {s.body}
              </>
            )

            return (
              <div key={s.id}>
                {/* Phone: a real disclosure. Keyboard and screen-reader
                    behaviour comes from the browser, not from us. */}
                <details className="group border-b border-[color:var(--chrome-ink,#F8F6F0)]/[0.07] md:hidden">
                  <summary
                    className={`${LABEL} flex cursor-pointer list-none items-center justify-between py-4
                                marker:content-none [&::-webkit-details-marker]:hidden`}
                  >
                    {s.label}
                    {/* + rotates to × on open. */}
                    <span
                      aria-hidden
                      className="relative h-3 w-3 shrink-0 opacity-50 transition-transform duration-200 group-open:rotate-45"
                    >
                      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                    </span>
                  </summary>
                  <div className="pb-5">{panel}</div>
                </details>

                {/* Desktop: a static column. Nothing is collapsed here, so there
                    is no control — a disclosure widget that never discloses is a
                    lie told to a keyboard user. */}
                <div className="hidden md:block">
                  <p className={`${LABEL} mb-5`}>{s.label}</p>
                  {panel}
                </div>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[color:var(--chrome-ink,#F8F6F0)]/[0.05] px-6 py-6 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--chrome-ink,#F8F6F0)]/20">
            {colophon}
          </p>
        </div>
      </div>
    </footer>
  )
}

function renderExternal(l: FooterLink, className: string) {
  return (
    <a href={l.href} target="_blank" rel="noopener noreferrer" className={className}>
      {l.label}
    </a>
  )
}
