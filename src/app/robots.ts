// src/app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/catalogo?q='],
        crawlDelay: 2,
      },
    ],
    sitemap: 'https://wingsglobaltrade.com/sitemap.xml',
  }
}
