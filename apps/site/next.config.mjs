// WGT/07 Automóviles route migration (programs/automobiles/SCOPE.md §5,
// landed 2026-08-24): /catalogo/automoviles moved to its own lane route,
// /automoviles. Every first-party link on the site now points at the new
// URL directly (@/lib/category-href.ts) — these redirects exist for
// anything external that already linked or indexed the old one (bookmarks,
// search engines, any outbound link Wings doesn't control).
//
// Brand slugs are duplicated from @/lib/automoviles/oem-brands.ts rather
// than imported: next.config.mjs is a plain ESM file evaluated by Node
// outside the app's TS/Next pipeline, so it can't safely import the app's
// .ts source. Keep the two in sync if a 12th brand is ever added.
const AUTOMOVILES_BRAND_REDIRECTS = [
  { filterBrand: 'Toyota', slug: 'toyota' },
  { filterBrand: 'Jetour', slug: 'jetour' },
  { filterBrand: 'KIA', slug: 'kia' },
  { filterBrand: 'Audi', slug: 'audi' },
  { filterBrand: 'BMW', slug: 'bmw' },
  { filterBrand: 'Hyundai', slug: 'hyundai' },
  { filterBrand: 'Mercedes-Benz', slug: 'mercedes-benz' },
  { filterBrand: 'MG', slug: 'mg' },
  { filterBrand: 'Star 5', slug: 'star-5' },
  { filterBrand: 'Changan', slug: 'changan' },
  { filterBrand: 'Wuling', slug: 'wuling' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS/TSX — Next must transpile them.
  transpilePackages: ['@wings/trade-ui', '@wings/mister', '@wings/rb-core'],
  async redirects() {
    return [
      // Brand deep-links first (more specific — Next matches redirects in
      // array order and stops at the first match): /catalogo/automoviles?
      // brand=Toyota → the real brand page, not the generic lane root.
      ...AUTOMOVILES_BRAND_REDIRECTS.map(({ filterBrand, slug }) => ({
        source: '/catalogo/automoviles',
        has: [{ type: 'query', key: 'brand', value: filterBrand }],
        destination: `/automoviles/marcas/${slug}`,
        permanent: true,
      })),
      // No dedicated hybrid view exists in the new lane IA yet (see
      // MegaMenu.tsx's same note) — lane root is the honest destination.
      {
        source: '/catalogo/automoviles',
        has: [{ type: 'query', key: 'fuel', value: 'hibrido' }],
        destination: '/automoviles',
        permanent: true,
      },
      // The bare category page, no query params.
      {
        source: '/catalogo/automoviles',
        destination: '/automoviles',
        permanent: true,
      },
    ]
  },
  // resvg-js is a native (.node) addon used by the brand container OG image.
  // Keep it external so webpack requires it at runtime instead of trying to
  // bundle (and failing to parse) the platform binary — same as apps/tower.
  serverExternalPackages: ['@resvg/resvg-js'],
  // The OG route (resvg) reads the brand font files at runtime — pin them into
  // the serverless function bundle so they exist on the server.
  outputFileTracingIncludes: {
    '/marcas/[brand]/contenedor/[code]/opengraph-image': ['./public/fonts/**'],
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
