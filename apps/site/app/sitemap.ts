import type { MetadataRoute } from 'next'
import { getRegistry } from '@/lib/component-registry'
import { getAllBlocks } from '@/lib/blocks-registry'
import { getAllShowcases } from '@/lib/showcase-registry'

const SITE_URL = 'https://shilp-sutra.devalok.in'

/**
 * Auto-generated sitemap. Lists every static route the site renders, plus
 * dynamic per-component, per-block, and per-showcase pages.
 *
 * Next 15 routes `/sitemap.xml` to this export at build time.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const components = await getRegistry()
  const blocks = getAllBlocks()
  const showcases = getAllShowcases()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/components`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/showcase`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/theming`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${SITE_URL}/agents`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Time-boxed: drop this entry after the buildathon closes (4 Aug 2026).
    { url: `${SITE_URL}/buildathon`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/aurora`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/lotus`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const componentRoutes: MetadataRoute.Sitemap = components.map((c) => ({
    url: `${SITE_URL}/components/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const blockRoutes: MetadataRoute.Sitemap = blocks.map((b) => ({
    url: `${SITE_URL}/blocks/${b.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const showcaseRoutes: MetadataRoute.Sitemap = showcases.map((s) => ({
    url: `${SITE_URL}/showcase/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...componentRoutes, ...blockRoutes, ...showcaseRoutes]
}
