/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS/TSX — Next must transpile them.
  transpilePackages: ['@wings/trade-ui', '@wings/mister', '@wings/rb-core'],
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
