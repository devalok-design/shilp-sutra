import type { Metadata } from 'next'
import { ComponentGrid } from '@/components/component-grid'
import { FeaturedComponents } from '@/components/featured-components'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getRegistry } from '@/lib/component-registry'
import { SHILP_SUTRA_MINOR } from '@/lib/version'

export const metadata: Metadata = {
  title: 'Components',
  description:
    '119 accessible React components from shilp-sutra. UI primitives, composed patterns, app shell. Builder-ready, brand-aware, RSC-safe per import.',
}

export default async function ComponentsPage() {
  const items = await getRegistry()

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow={`Components · v${SHILP_SUTRA_MINOR}`}
              title={`${items.length} pieces. Every one yours.`}
              subtitle="Accessible. Themeable. Animated with intention. Ship the same components your favourite Devalok products ship."
            />
            <FeaturedComponents />
            <div className="flex flex-col gap-ds-04">
              <header className="flex flex-col gap-ds-02 max-w-3xl">
                <span className="text-ds-xs text-surface-fg-subtle">
                  Browse all
                </span>
                <h2 className="text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] text-surface-fg">
                  {items.length} components · filter by group or search by name.
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
