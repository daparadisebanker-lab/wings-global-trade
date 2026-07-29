// Azulejos — the aisle, and the first catalogue of WGT/02 Interiores.
//
// This subtree takes none of the site chrome: no SiteNav, no Footer, no
// CompareBar, no Mister launcher, no Lenis smooth scroll (SiteFrame gates on
// isAislePath()). The aisle is a full-viewport sourcing tool with its own drag
// loop and its own thumb zone; a fixed site header would take the bottom bar the
// muestrario tab needs, and a smooth-scroll hijack would fight the swipe.
//
// It also suppresses its own lane's livery. WGT/02 renders bone/walnut/oxblood
// everywhere else, but here the product IS colour: an oxblood "collected" mark
// would vanish on the terracotta tiles and clash with the cobalt ones, and a
// warm bone ground shifts perceived hue on a purchase buyers reject over colour
// variance. `data-app="pasillo"` is the single hook the achromatic token set
// hangs off, and it stops exactly at this wrapper — the lane page one level up
// is untouched. Registered as an exception in packages/liveries/registry.md, on
// the same argument and the same scoping the (brands) group already carries
// (root CLAUDE.md §5-bis).

import type { Metadata } from 'next'
import { RecordProvider } from '@/pasillo/lib/record'
import '@/pasillo/pasillo.css'

export const metadata: Metadata = {
  title: 'Azulejos — WGT/02 Interiores',
  description:
    'El catálogo de azulejos recorrido como un pasillo: revisa las series, guarda las que sirven y sal con un muestrario que ya sabe cuántos m², cuántas cajas, cuántos kilos y cuánto contenedor.',
  // A sourcing tool carrying supplier data, not a landing page. The lane page
  // at /interiores is the indexable surface.
  robots: { index: false, follow: false },
}

export default function AzulejosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-app="pasillo">
      <RecordProvider>{children}</RecordProvider>
    </div>
  )
}
