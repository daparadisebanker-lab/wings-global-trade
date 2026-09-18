// src/app/(lanes)/automoviles/explorar/page.tsx
// WGT/07 vertical discovery feed — a new entry point alongside the roster/
// segment/brand grids (never a replacement for them; see
// programs/automobiles/SCOPE.md §0h). One nameplate per full-screen card,
// scroll/swipe/keyboard to move — the mechanics live in ExplorarFeed
// (client component); this route only fetches and hands off.
import type { Metadata } from 'next'
import { getProducts } from '@/lib/catalog-data'
import { ExplorarFeed } from '@/components/features/automoviles/ExplorarFeed'

const TITLE = 'Explorar — Automóviles | Wings Global Trade'
const DESCRIPTION =
  'Recorre las líneas de modelo del catálogo de automóviles Wings, una a la vez: marca, segmento, especificación y versiones disponibles.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: 'es_PE',
    type: 'website',
    url: 'https://wingsglobaltrade.com/automoviles/explorar',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
  alternates: { canonical: '/automoviles/explorar' },
}

export default async function AutomovilesExplorarPage() {
  const { products } = await getProducts({ category: 'automoviles', limit: 100 })

  return <ExplorarFeed products={products} />
}
