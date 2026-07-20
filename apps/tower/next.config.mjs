/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS/TSX — Next must transpile them.
  transpilePackages: ['@wings/trade-ui', '@wings/mister', '@wings/rb-core'],
}

export default nextConfig
