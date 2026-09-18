// src/components/features/automoviles/VehicleCard.tsx
//
// The single shared model card for the whole lane — brand pages
// (BrandModelGrid) and cross-brand segment pages both render this, never a
// second variant. Toyota-USA-benchmark direction (2026-09 rebuild): the
// vehicle photo IS the card, not a thumbnail on a text card — full-bleed,
// no inner padding box, edge to edge. Replaces the earlier "breakout
// cutout" treatment (MotionCard's imageUrl prop, still used by the
// body-type/brand tiles that aren't a specific vehicle).
//
// Image convention (unchanged, see data/automoviles-catalog.ts header):
// `images[0]` is the white-background studio hero — the one asset shaped
// for a full-bleed card slot. `images[1]` (the transparent cutout) belongs
// to the old breakout treatment, not this one.
//
// Missing photography (24 of 35 nameplates today, root CLAUDE.md §4 Phase
// 0·Q5's typography-and-spec-led interim mode) gets an honest fallback: the
// same fixed-aspect box, a neutral VehicleTypeIcon silhouette (never a
// stock photo, a render, or a placeholder photo — the refused options) on
// a token surface colour. Every card keeps the same footprint either way —
// the grid never collapses around a missing asset.
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { VehicleTypeIcon, type VehicleSegmentSlug } from './VehicleTypeIcon'

export interface VehicleCardSpec {
  label: string
  value: string
}

export interface VehicleCardProps {
  href: string
  imageUrl?: string
  imageAlt: string
  segment?: VehicleSegmentSlug
  dataOem?: string
  /** Shown above the title only in cross-brand contexts (segment pages). */
  brandLabel?: string
  title: string
  specs: VehicleCardSpec[]
  versionsLabel: string
  /** Set on the single above-the-fold card only — next/image LCP hint. */
  priority?: boolean
}

export function VehicleCard({
  href,
  imageUrl,
  imageAlt,
  segment,
  dataOem,
  brandLabel,
  title,
  specs,
  versionsLabel,
  priority,
}: VehicleCardProps) {
  return (
    <article
      data-oem={dataOem}
      data-reveal
      className="group overflow-hidden border border-[color:var(--ink-decoration)] bg-[color:var(--surface-1)] transition-colors hover:border-[color:var(--oem-accent,_var(--accent-border))]"
    >
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--oem-accent,_var(--accent-ink))]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--surface-2)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
              {segment && (
                <VehicleTypeIcon
                  segment={segment}
                  bodyColor="var(--ink-decoration)"
                  accentColor="var(--oem-accent,_var(--accent-ink))"
                  className="h-16 w-28 opacity-70"
                />
              )}
              <span className="font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
                Ficha disponible · foto pendiente
              </span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {brandLabel && (
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-[2px] bg-[color:var(--oem-accent,_var(--accent-ink))]"
              />
              <span className="font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--oem-accent,_var(--accent-ink))]">
                {brandLabel}
              </span>
            </div>
          )}
          <p className={cn('font-display text-2xl text-[color:var(--ink-primary)]', brandLabel && 'mt-2')}>
            {title}
          </p>
          {specs.length > 0 && (
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[12px] leading-relaxed text-[color:var(--ink-secondary)]">
              {specs.map((s) => (
                <div key={s.label} className="flex flex-col gap-0.5">
                  <dt className="text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
                    {s.label}
                  </dt>
                  <dd className="text-[color:var(--ink-primary)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Link>

      <div aria-hidden className="mx-6 h-px bg-[color:var(--ink-decoration)] opacity-60 md:mx-8" />

      <div className="flex items-center justify-between gap-3 px-6 py-4 md:px-8">
        <span className="font-mono text-[10px] uppercase text-[color:var(--oem-accent,_var(--accent-ink))]">
          {versionsLabel}
        </span>
        <Link
          href={href}
          className="group/ficha inline-flex min-h-11 items-center gap-1 font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink-primary)]"
        >
          Ficha técnica
          <span aria-hidden className="transition-transform group-hover/ficha:translate-x-0.5">
            →
          </span>
        </Link>
      </div>
    </article>
  )
}
