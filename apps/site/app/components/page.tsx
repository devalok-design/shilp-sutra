import type { Metadata } from 'next'
import { ComponentGrid } from '@/components/component-grid'
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
              meta={
                <span className="inline-flex items-center gap-ds-02 rounded-ds-sm border border-surface-border-subtle bg-surface-raised px-ds-04 py-ds-02 max-w-fit">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning-9" />
                  <span className="text-ds-xs text-surface-fg-subtle">
                    Detail pages live; live previews ship in waves.
                  </span>
                </span>
              }
            />
            <ComponentGrid items={items} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
