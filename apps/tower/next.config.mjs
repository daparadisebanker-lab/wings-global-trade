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
  experimental: {
    serverActions: {
      // Mister's dock sends a pasted screenshot as base64 INSIDE the server-action
      // payload. The default here is 1 MB — under it, a full-resolution phone
      // capture was rejected by the framework before askMister ran, so the
      // action's graceful catch never fired and the operator got the dock's
      // generic client-side failure instead of a real answer.
      //
      // Screenshots are now downscaled client-side (lib/copilot/image-prep.ts),
      // which lands them far under this; the raised limit is the backstop for
      // the fallback path (a browser that can't use a canvas sends the original).
      // 4 MB, not more: Vercel caps a serverless request body at 4.5 MB, so a
      // larger value here would only move the rejection to the platform, where
      // it is even harder to read.
      bodySizeLimit: '4mb',
    },
  },
}

export default nextConfig
