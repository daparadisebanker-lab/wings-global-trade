// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/mister', '/blog', '/catalogo', '/nosotros', '/contacto'],
        disallow: ['/api/', '/_next/', '/catalogo?q='],
        crawlDelay: 1,
      },
      // AI search and answer engine crawlers — explicit allow for AEO
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
    ],
    sitemap: 'https://wingsglobaltrade.com/sitemap.xml',
  }
}
