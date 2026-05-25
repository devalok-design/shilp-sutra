import type { MetadataRoute } from 'next'

/**
 * robots.txt. Next 15 routes `/robots.txt` to this export at build time.
 *
 * Public beta — fully crawlable. Storybook (under /storybook/) and the
 * Next image proxy (/_next/*) are excluded; they're not content surfaces.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/api/'],
      },
    ],
    sitemap: 'https://shilp-sutra.devalok.in/sitemap.xml',
    host: 'https://shilp-sutra.devalok.in',
  }
}
