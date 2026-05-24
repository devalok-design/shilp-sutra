import type { Metadata } from 'next'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { ComponentGrid } from '@/components/component-grid'
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
          <div className="flex flex-col gap-ds-08">
            <div className="flex flex-col gap-ds-03">
              <Text variant="label-md" className="text-surface-fg-subtle">
                Components · v0.39
              </Text>
              <Text variant="heading-2xl" className="text-surface-fg">
                {items.length} components, one consistent API.
              </Text>
              <Text variant="body-md" className="text-surface-fg-muted max-w-2xl">
                Every component is accessible, themeable, and ships with framer-motion animations
                tuned for craft. Click any card to see live examples in Storybook.
              </Text>
              <div className="mt-ds-02 inline-flex items-center gap-ds-02 rounded-ds-sm border border-surface-border-subtle bg-surface-raised px-ds-04 py-ds-02 max-w-fit">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning-9" />
                <Text variant="body-xs" className="text-surface-fg-muted">
                  v1: cards link to Storybook. Live previews on the page itself land in v2.
                </Text>
              </div>
            </div>
            <ComponentGrid items={items} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
