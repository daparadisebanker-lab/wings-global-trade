/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS/TSX — Next must transpile them.
  transpilePackages: ['@wings/trade-ui', '@wings/mister', '@wings/rb-core'],
  // The share-card route (resvg) reads the brand font files at runtime — pin
  // them into the serverless function bundle so they exist on the server.
  outputFileTracingIncludes: {
    '/api/promo-card/[code]': ['./public/fonts/**'],
  },
}

export default nextConfig
