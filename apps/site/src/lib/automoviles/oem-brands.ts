// src/lib/automoviles/oem-brands.ts
//
// The 11 OEM brands WGT/07 imports from — distinct from RB_BRANDS
// (@/lib/rb/fixtures), which are brands Wings hosts/represents. Never merge
// these lists; the concepts don't collide (see programs/automobiles/
// SCOPE.md §3). `slug` matches the [data-oem] value in
// packages/liveries/automoviles/oem-canvas.css; `filterBrand` matches the
// exact `filter_attrs.brand` string on each product (data/seed.json), which
// is the brand's plain name, not its slug.

export interface OemBrand {
  slug: string
  filterBrand: string
  name: string
  /** One line, honest about what's actually known — no invented brand copy. */
  note: string
}

export const OEM_BRANDS: OemBrand[] = [
  { slug: 'toyota', filterBrand: 'Toyota', name: 'Toyota', note: '5 líneas de modelo · gasolina e híbridos' },
  { slug: 'jetour', filterBrand: 'Jetour', name: 'Jetour', note: '4 líneas de modelo · SUV y todoterreno' },
  { slug: 'kia', filterBrand: 'KIA', name: 'KIA', note: '4 líneas de modelo · sedán y SUV compacto' },
  { slug: 'audi', filterBrand: 'Audi', name: 'Audi', note: '7 líneas de modelo · producción China para exportación' },
  { slug: 'bmw', filterBrand: 'BMW', name: 'BMW', note: '3 líneas de modelo · batalla larga para el mercado chino' },
  { slug: 'hyundai', filterBrand: 'Hyundai', name: 'Hyundai', note: '3 líneas de modelo · sedán y SUV compacto' },
  { slug: 'mercedes-benz', filterBrand: 'Mercedes-Benz', name: 'Mercedes-Benz', note: 'Clase C batalla larga' },
  { slug: 'mg', filterBrand: 'MG', name: 'MG', note: 'MG5 · sedán deportivo compacto' },
  { slug: 'star-5', filterBrand: 'Star 5', name: 'Star 5', note: 'Compacto urbano, familia Changan' },
  { slug: 'changan', filterBrand: 'Changan', name: 'Changan', note: 'M60 · MPV comercial' },
  { slug: 'wuling', filterBrand: 'Wuling', name: 'Wuling', note: 'Hongguang V · furgoneta comercial' },
]

export function getOemBrand(slug: string): OemBrand | undefined {
  return OEM_BRANDS.find((b) => b.slug === slug)
}
