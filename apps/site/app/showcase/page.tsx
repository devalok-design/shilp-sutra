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
              eyebrow="Showcase"
              title="Real pages, then real brands."
              subtitle="Full-page blocks first. Then six industries, one library."
              description="Blocks are multi-component surfaces lifted from real work — copy the source, ship it. The showcase library below demonstrates brand breadth: same components, six different OKLCH ramps."
            />

            <section className="flex flex-col gap-ds-05">
              <header className="flex flex-col gap-ds-02 max-w-3xl">
                <span className="text-ds-xs text-surface-fg-subtle">Blocks</span>
                <h2 className="font-display text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] text-surface-fg">
                  Real pages, not toys.
                </h2>
                <Text variant="body-sm" className="text-surface-fg-muted">
                  Multi-component surfaces lifted from real work. Dashboards, sign-up flows,
                  pricing pages. Each recolours with the brand switcher — copy the source, paste,
                  ship.
                </Text>
              </header>

              <BlocksCanvas blocks={blocks} />
            </section>

            <section className="rounded-control border border-surface-border-subtle bg-surface-raised p-ds-06 flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                How this works
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                Blocks are full pages, copy-pasted as-is. The library below swaps a single
                CSS-var ramp (
                <code className="font-mono text-surface-fg">--color-accent-1</code> through{' '}
                <code className="font-mono text-surface-fg">--color-accent-12</code>) and nothing
                else — everything else on the screen is the same shilp-sutra components. Try the{' '}
                <Link href="/theming" className="underline underline-offset-2 hover:text-surface-fg">
                  theming editor
                </Link>{' '}
                to build your own, or jump straight into a brand's ramp from the tabs below.
              </Text>
            </section>
          </div>
        </div>

        <UnifiedCanvas />

        <div className="mx-auto max-w-6xl px-page-x pb-ds-09">
          <div className="rounded-control border border-surface-border-subtle bg-surface-raised p-ds-06 flex flex-col gap-ds-02">
            <Text variant="label-sm" className="text-surface-fg-subtle">
              More coming
            </Text>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Settings + data-table blocks land in the next site update, and more showcase
              brands are on the way. If a block or industry you wish existed isn&apos;t here,
              file it at{' '}
              <Link
                href="https://github.com/devalok-design/shilp-sutra/issues/new?template=ai-agent-feedback.yml&labels=block-request"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-surface-fg"
              >
                github.com/devalok-design/shilp-sutra/issues
              </Link>
              .
            </Text>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
