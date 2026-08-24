// WGT/07 Automóviles — the lane layout.
//
// `data-lane="automoviles"` is the hook the livery needs: white ground,
// asphalt ink, ion-blue accent, blueprint-grid texture, compressed-caps
// posture — declared in packages/liveries/automoviles/livery.css and
// derived by the §Phase-2 rules (re-derived light 2026-08-24, showroom
// pivot — see packages/liveries/registry.md).
//
// Reuses the RB (brands) route group's curtain + scroll-choreography
// mechanics rather than forking them (root law §1 — same box, different
// livery): BrandCurtain is generalized (packages… no, apps/site/src/
// components/features/brands/BrandChoreography.tsx) to accept a scope
// selector and accent var, so this mount floods in the *entering OEM
// brand's* color via [data-oem]/--oem-accent instead of RB's
// [data-brand]/--rb-accent — same component, different configuration, RB's
// own call site untouched.
//
// pt-16/md:pt-18 offsets the fixed site header, same reasoning (brands)/
// layout.tsx uses: this canvas has no dark hero for the transparent nav to
// float over, so it goes solid immediately (SiteNav's forceSolid list
// includes this route for the same reason it includes /interiores).
// oem-canvas.css is already imported globally in globals.css (same pattern
// every other lane's livery.css follows) — not re-imported here.
import type { Metadata } from 'next'
import { BrandChoreography, BrandCurtain } from '@/components/features/brands/BrandChoreography'

export const metadata: Metadata = {
  title: 'Automóviles — WGT/07',
  description:
    'Autos de pasajeros 0 km importados desde China: sedanes, SUV, MPV e híbridos de 11 marcas, vendidos por unidad configurada o por contenedor.',
}

export default function AutomovilesLaneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-lane="automoviles" className="pt-16 md:pt-18">
      <BrandCurtain
        scopeSelector="[data-oem]"
        accentVar="--oem-accent"
        markDataKey="oemMark"
        fallbackColor="var(--chrome-ground)"
      />
      <BrandChoreography>{children}</BrandChoreography>
    </div>
  )
}
