import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CARD_EYEBROW, CARD_INTERACTIVE, CARD_TITLE } from '@/lib/card-recipe'
import { generateRamp } from '@/lib/ramp-generator'
import { getAllShowcases } from '@/lib/showcase-registry'

export const metadata: Metadata = {
  title: 'Showcase',
  description:
    'Six fictional industries, one library. SaaS, fintech, D2C, healthcare, editorial, studio. Mock UI compositions built with shilp-sutra, each with its own brand ramp. For real consumers, see the built-with strip on the homepage.',
}

/**
 * Builds an inline CSS-var style that overrides --color-accent-* with the
 * showcase's brand ramp, so the card swatch reads in the brand's tone
 * without polluting the rest of the page.
 */
function rampSwatchStyle(hue: number, chroma: number): CSSProperties {
  const ramp = generateRamp(hue, chroma)
  const style: Record<string, string> = {}
  ramp.light.forEach((s) => {
    style[`--color-accent-${s.step}`] = s.value
  })
  return style as CSSProperties
}

export default function ShowcaseIndexPage() {
  const entries = getAllShowcases()

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow="Showcase · mock setups"
              title="Six industries. One library."
              subtitle="Same components, six brand ramps, six worlds."
              description="Every screen below is built from the same shilp-sutra primitives. Only the accent ramp changes. The brands are fictional, built to demonstrate breadth, not to claim partnership. For the real products carrying shilp-sutra today, see the built-with strip on the homepage."
            />

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-ds-05">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/showcase/${entry.slug}`}
                    className={CARD_INTERACTIVE + ' flex flex-col gap-ds-04 h-full'}
                  >
                    <header className="flex items-start justify-between gap-ds-03">
                      <div className="flex flex-col">
                        <span className={CARD_EYEBROW + ' mb-0 inline-flex items-center gap-ds-02'}>
                          {entry.industry}
                          <span
                            aria-label="Fictional brand"
                            className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-surface-overlay border border-surface-border-subtle text-[10px] font-mono text-surface-fg-subtle uppercase tracking-wide"
                          >
                            Mock
                          </span>
                        </span>
                        <h3 className={CARD_TITLE}>{entry.product}</h3>
                      </div>
                      <span
                        aria-hidden
                        style={rampSwatchStyle(entry.hue, entry.chroma)}
                        className="shrink-0 mt-1 inline-flex items-center gap-ds-01 rounded-control-inner border border-surface-border-subtle p-ds-01"
                      >
                        <span className="w-3 h-3 rounded-pill bg-accent-5" />
                        <span className="w-3 h-3 rounded-pill bg-accent-9" />
                        <span className="w-3 h-3 rounded-pill bg-accent-11" />
                      </span>
                    </header>

                    <p className="text-ds-sm text-surface-fg-muted line-clamp-2">{entry.tagline}</p>
                    <p className="text-ds-sm text-surface-fg-subtle line-clamp-3">{entry.premise}</p>

                    <div className="flex flex-wrap gap-ds-01 mt-auto pt-ds-02">
                      {entry.uses.slice(0, 3).map((u) => (
                        <span
                          key={u}
                          className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-surface-overlay border border-surface-border-subtle text-ds-xs font-mono text-surface-fg-subtle"
                        >
                          {u}
                        </span>
                      ))}
                      {entry.uses.length > 3 && (
                        <span className="inline-flex items-center text-ds-xs text-surface-fg-subtle">
                          +{entry.uses.length - 3}
                        </span>
                      )}
                    </div>

                    <footer className="flex items-center gap-ds-01 text-ds-sm text-surface-fg-subtle pt-ds-02">
                      <span>See the build</span>
                      <IconArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform duration-fast-02 ease-productive-standard"
                      />
                    </footer>
                  </Link>
                </li>
              ))}
            </ul>

            <section className="rounded-control border border-surface-border-subtle bg-surface-raised p-ds-06 flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                How this works
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                Each showcase swaps a single CSS-var ramp (
                <code className="font-mono text-surface-fg">--color-accent-1</code> through{' '}
                <code className="font-mono text-surface-fg">--color-accent-12</code>) and nothing
                else. Try the{' '}
                <Link href="/theming" className="underline underline-offset-2 hover:text-surface-fg">
                  theming editor
                </Link>{' '}
                to build your own.
              </Text>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
