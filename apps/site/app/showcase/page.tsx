import type { Metadata } from 'next'
import Link from 'next/link'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { BlocksCanvas } from '@/components/blocks-canvas'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { UnifiedCanvas } from '@/components/unified-canvas'
import { getAllBlocks, getBlockSource } from '@/lib/blocks-registry'

export const metadata: Metadata = {
  title: 'Showcase',
  description:
    'Real pages, plus six fictional industries, one library. Dashboards and blocks lifted from real work, then SaaS/fintech/D2C/healthcare/editorial/studio brand mocks — each with its own OKLCH ramp.',
}

export default async function ShowcaseIndexPage() {
  const blocks = await Promise.all(
    getAllBlocks().map(async (b) => ({ ...b, source: (await getBlockSource(b.slug)) ?? '' })),
  )

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem]">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              title="Real pages, then real brands."
              subtitle="Full-page blocks lifted from real work. Then six industries, one library."
              description="Blocks are multi-component surfaces you copy and ship. The library below proves the range: the same shilp-sutra components under six different OKLCH ramps."
            />

            <section className="flex flex-col gap-ds-05">
              <header className="flex flex-col gap-ds-02 max-w-2xl">
                <h2 className="font-display text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] text-surface-fg">
                  Real pages, not toys.
                </h2>
                <Text variant="body-sm" className="text-surface-fg-muted">
                  Dashboards, sign-up flows, pricing. Each one recolours with the brand
                  switcher. Copy the source, paste, ship.
                </Text>
              </header>

              <BlocksCanvas blocks={blocks} />
            </section>
          </div>
        </div>

        <UnifiedCanvas />

        <div className="mx-auto max-w-6xl px-page-x pb-ds-09">
          <p className="max-w-2xl text-ds-sm text-surface-fg-muted leading-relaxed">
            Everything on that canvas is one CSS-var ramp swap:{' '}
            <code className="font-mono text-surface-fg">--color-accent-1</code> through{' '}
            <code className="font-mono text-surface-fg">--color-accent-12</code>, over the same
            components. Build your own in the{' '}
            <Link href="/theming" className="text-accent-11 underline underline-offset-2 hover:text-accent-12">
              theming editor
            </Link>
            , or request a block or industry on{' '}
            <Link
              href="https://github.com/devalok-design/shilp-sutra/issues/new?template=ai-agent-feedback.yml&labels=block-request"
              target="_blank"
              rel="noreferrer"
              className="text-accent-11 underline underline-offset-2 hover:text-accent-12"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
