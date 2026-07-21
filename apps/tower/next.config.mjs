/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS/TSX — Next must transpile them.
  transpilePackages: ['@wings/trade-ui', '@wings/mister', '@wings/rb-core'],
  // resvg-js is a native (.node) addon used by the share-card route. Keep it
  // external so webpack requires it at runtime instead of trying to bundle (and
  // failing to parse) the platform binary.
  serverExternalPackages: ['@resvg/resvg-js'],
  // The share-card route (resvg) reads the brand font files at runtime — pin
  // them into the serverless function bundle so they exist on the server.
  outputFileTracingIncludes: {
    '/api/promo-card/[code]': ['./public/fonts/**'],
  },
}

export default nextConfig
