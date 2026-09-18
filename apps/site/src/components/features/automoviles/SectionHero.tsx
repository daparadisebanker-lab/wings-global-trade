// src/components/features/automoviles/SectionHero.tsx
//
// Shared hero header for the lane root, the brand roster, every brand page
// and every segment page — one component instead of four hand-rolled
// headers drifting out of sync on spacing/type scale. Restrained and
// typographic by design (root CLAUDE.md §4 Phase 0·Q5's interim mode: no
// OEM brand-hero photography exists in this repo for any of the 11
// brands — never a stock photo or a fabricated one in its place). The
// per-model ficha page has its own full-bleed hero (real photography where
// it exists) built separately — this component is for the section headers,
// not the document page.
import type { ReactNode } from 'react'

interface SectionHeroProps {
  kicker: string
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  /** 'lg' — lane root only. 'md' — every sub-page (roster/brand/segment). */
  size?: 'lg' | 'md'
  /** Overrides the kicker/underline colour — pass var(--oem-accent) on a
   *  brand-scoped page so the header carries the arrival curtain's colour
   *  into persistent content, not just the chrome. */
  accentColor?: string
}

export function SectionHero({
  kicker,
  title,
  description,
  meta,
  icon,
  actions,
  size = 'md',
  accentColor,
}: SectionHeroProps) {
  const accentStyle = accentColor ? ({ color: accentColor } as const) : undefined

  return (
    <section className="border-b border-[color:var(--ink-decoration)]">
      <div
        className={
          size === 'lg'
            ? 'mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32'
            : 'mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16 lg:py-20'
        }
      >
        <p
          className="font-mono text-mono-sm uppercase tracking-[var(--lane-label-tracking)] text-[color:var(--accent-ink)]"
          style={accentStyle}
        >
          {kicker}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {icon}
          <h1
            data-split={size === 'lg' ? true : undefined}
            className={
              size === 'lg'
                ? 'max-w-3xl text-5xl uppercase text-[color:var(--ink-primary)] tracking-[var(--lane-display-tracking)] font-[var(--lane-display-weight)] md:text-6xl'
                : 'font-display text-display-md text-[color:var(--ink-primary)] md:text-display-lg'
            }
          >
            {title}
          </h1>
        </div>

        {meta && (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
            {meta}
          </p>
        )}

        {description && (
          <p data-reveal className="mt-6 max-w-2xl text-body-lg text-[color:var(--ink-secondary)]">
            {description}
          </p>
        )}

        {actions && <div className="mt-10 flex flex-wrap items-center gap-4">{actions}</div>}
      </div>
    </section>
  )
}
