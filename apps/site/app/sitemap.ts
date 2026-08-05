import type { MetadataRoute } from 'next'
import { getRegistry } from '@/lib/component-registry'
import { getAllBlocks } from '@/lib/blocks-registry'
import { getAllShowcases } from '@/lib/showcase-registry'
import { CLOSES_AT, isOpen } from '@/lib/buildathon'

const SITE_URL = 'https://shilp-sutra.devalok.in'

/**
 * One entry below depends on the buildathon deadline, so this route revalidates
 * for the same reason /buildathon does. Literal, not an imported constant —
 * Next rejects an identifier here. See the HARD RULE in lib/buildathon.ts.
 */
export const revalidate = 900

/**
 * Auto-generated sitemap. Lists every static route the site renders, plus
 * dynamic per-component, per-block, and per-showcase pages.
 *
 * Next 15 routes `/sitemap.xml` to this export at build time.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const buildathonIsOpen = isOpen()
  const components = await getRegistry()
  const blocks = getAllBlocks()
  const showcases = getAllShowcases()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/components`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/showcase`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/theming`, lastModified: now, changeFrequency: 'monthly', priority: 0.95 },
    { url: `${SITE_URL}/agents`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Time-boxed, and self-demoting rather than a manual TODO: while entries are
    // open this is a daily-changing landing page worth a high priority; once they
    // close the URL still resolves (it carries the result), so it stays listed but
    // stops claiming freshness or competing with the docs for crawl budget.
    buildathonIsOpen
      ? { url: `${SITE_URL}/buildathon`, lastModified: now, changeFrequency: 'daily', priority: 0.9 }
      : {
          url: `${SITE_URL}/buildathon`,
          lastModified: new Date(CLOSES_AT),
          changeFrequency: 'yearly',
          priority: 0.5,
        },
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
