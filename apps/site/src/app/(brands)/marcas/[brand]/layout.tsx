// src/app/(brands)/marcas/[brand]/layout.tsx
// Brand segment: applies the brand's token contract via [data-brand] and
// renders the shelf's section nav. Structure is frozen — identity enters
// only through rb-canvas.css tokens (swap test: any brand slug must render
// this layout perfectly).
import { notFound } from 'next/navigation'
import { getBrand, RB_BRANDS } from '@/lib/rb/fixtures'
import { getRbLiveBrandBySlug } from '@/lib/rb/data'
import { rbTokenStyle } from '@/lib/rb/tokens'
import { BrandShelfNav } from '@/components/features/brands/BrandShelfNav'
import { BrandReveal } from '@/components/features/brands/BrandReveal'

export function generateStaticParams() {
  return RB_BRANDS.map((b) => ({ brand: b.slug }))
}

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}) {
  const { brand: slug } = await params
  const brand = getBrand(slug)
  if (!brand) notFound()

  // Live --rb-* tokens from the TOWER kit manifest override the static
  // fixture rule in rb-canvas.css via the same [data-brand] scope. When there
  // is no live brand for this slug (dev without a DB, or an unthemed row) we
  // inject nothing and the CSS fixture rule stands — so Áladín keeps
  // rendering. No brand hex is ever hardcoded here (swap test, §5-bis rule 2).
  const live = await getRbLiveBrandBySlug(slug)
  const liveStyle = live ? rbTokenStyle(live.tokens) : undefined

  return (
    <div data-brand={brand.slug} data-brand-isotipo={brand.logo.isotipo} style={liveStyle}>
      {/* Entry reveal — the clone's preloader with the genie isotipo;
          plays per hard load, SPA navs use BrandCurtain instead */}
      <BrandReveal brand={{ name: brand.name, claim: brand.claim, isotipo: brand.logo.isotipo }} />
      <BrandShelfNav
        brand={{ slug: brand.slug, name: brand.name, code: brand.code, isologo: brand.logo.isologo }}
      />
      {children}
    </div>
  )
}
