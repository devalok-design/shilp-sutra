import type { MetadataRoute } from 'next'

/**
 * robots.txt. Next 15 routes `/robots.txt` to this export at build time.
 *
 * Public beta — fully crawlable. /api/ is excluded. /_next/ is NOT: it
 * holds the JS and CSS Google must fetch to render the pages, and blocking
 * it hid every page's rendered content (estate SEO study, 27 Nov 2026).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://shilp-sutra.devalok.in/sitemap.xml',
    host: 'https://shilp-sutra.devalok.in',
  }
}
