// WGT/02 Interiores — the lane layout.
//
// `data-lane="interiores"` is the only hook the livery needs: bone ground,
// walnut ink, oxblood accent, linen-paper texture, editorial-light posture, all
// declared in packages/liveries/interiores/livery.css and derived by the §Phase-2
// rules rather than chosen. Zero component forking happens below this line —
// the lane themes the shared organs, it never forks them.
//
// This layout sets the lane attribute and NOTHING else — deliberately no
// padding. The header offset that light lane pages need lives on the page that
// needs it, because the aisle beneath this layout is `h-dvh` and drops the site
// header entirely: a 64px pad here pushed the aisle a full header below the
// fold, which put the muestrario tab on top of the collect button. A layout
// that assumes every child is a scrolling page is a layout that breaks the one
// child that is a viewport.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interiores | Wings Global Trade',
  description:
    'FF&E, OS&E, acabados duros, textiles e iluminación para proyectos de hospitalidad y residenciales. Importación directa por contenedor, con cobertura en m² y llenado declarado antes de cotizar.',
}

export default function InterioresLaneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-lane="interiores">{children}</div>
  )
}
