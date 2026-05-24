import type { Metadata } from 'next'
import { ComponentGrid } from '@/components/component-grid'
import { FeaturedComponents } from '@/components/featured-components'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getRegistry } from '@/lib/component-registry'

export const metadata: Metadata = {
  title: 'Components',
  description:
    '119 accessible React components from the shilp-sutra design system. UI primitives, composed patterns, and app shell.',
}

export default async function ComponentsPage() {
  const items = await getRegistry()

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-ds-page-x py-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow="Components · v0.39"
              title={`${items.length} components, one consistent API.`}
              subtitle="Every component is accessible, themeable, and ships with framer-motion animations tuned for craft."
            />
            <FeaturedComponents />
            <div className="flex flex-col gap-ds-04">
              <header className="flex flex-col gap-ds-02 max-w-3xl">
                <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                  Browse all
                </span>
                <h2 className="text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] text-surface-fg">
                  {items.length} components · filter by layer or search by name.
                </h2>
              </header>
              <ComponentGrid items={items} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
