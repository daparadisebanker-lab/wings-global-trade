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
  // This route is noindex, but the description still renders in WhatsApp and
  // Slack link previews — which is exactly how a buyer shares this URL with a
  // colleague. So it is a buyer-facing string, and "pasillo" may not appear in
  // one. ("un muestrario que ya sabe" also anthropomorphised the tool.)
  description:
    'Recorre el catálogo de azulejos serie por serie, guarda las que sirven y sal con un muestrario resuelto: m², cajas enteras, kilos y llenado de contenedor, listos para cotizar.',
  // A sourcing tool carrying supplier data, not a landing page. The lane page
  // at /interiores is the indexable surface.
  robots: { index: false, follow: false },
}

export default function AzulejosLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-app-root marks THIS as the ground-owning wrapper. The sheet-dock
    // carries data-app too (so the token layer reaches through vaul's portal)
    // but must not inherit a painted background — see pasillo.css.
    <div data-app="pasillo" data-app-root>
      <RecordProvider>{children}</RecordProvider>
    </div>
  )
}
