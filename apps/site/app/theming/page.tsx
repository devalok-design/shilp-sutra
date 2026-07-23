import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemingHub } from '@/components/themer/ThemingHub'

export const metadata: Metadata = {
  title: 'Theming',
  description:
    'Build your own brand on shilp-sutra. Pick an archetype, paste your brand color, take a wizard, or dial OKLCH by hand — one page, one live preview, install + CSS to paste.',
}

export default function ThemingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow="Theming"
              title="One color in. Everything out."
              subtitle="Every component recolors — buttons, badges, alerts, focus rings, light and dark. Move the sliders, pick a preset, or paste your hex. Export the CSS and your whole app follows."
            />

            <Suspense fallback={null}>
              <ThemingHub />
            </Suspense>

            <section className="border-t border-surface-border-subtle pt-ds-08">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-06">
                <div className="flex flex-col gap-ds-02">
                  <Text variant="label-sm" className="text-surface-fg-subtle">
                    Going deeper
                  </Text>
                  <Text variant="heading-sm" className="text-surface-fg">
                    Radius, fonts, spacing.
                  </Text>
                  <Text variant="body-sm" className="text-surface-fg-muted">
                    Every other token follows the same pattern as the accent ramp. Override the
                    primitives you care about, leave the rest alone.
                  </Text>
                  <Link
                    href="/docs/customize-brand"
                    className="text-ds-sm text-surface-fg underline underline-offset-2 hover:text-accent-11"
                  >
                    Read the customize-brand recipe →
                  </Link>
                </div>
                <div className="flex flex-col gap-ds-02">
                  <Text variant="label-sm" className="text-surface-fg-subtle">
                    Why OKLCH
                  </Text>
                  <Text variant="heading-sm" className="text-surface-fg">
                    Perceptually uniform.
                  </Text>
                  <Text variant="body-sm" className="text-surface-fg-muted">
                    Equal lightness numbers read as equal lightness to the eye. A step-9 pink and
                    a step-9 indigo are the same perceived weight; rgb() and hsl() cannot promise
                    that.
                  </Text>
                </div>
              </div>
            </section>

            <section className="border-t border-surface-border-subtle pt-ds-08 flex flex-col gap-ds-03 max-w-2xl">
              <span className="text-ds-xs text-surface-fg-subtle">Under the hood</span>
              <Text variant="heading-sm" className="text-surface-fg">
                CSS variables. No JS theme provider.
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted leading-relaxed">
                Whichever door you pick above, you walk out with the same thing: a CSS block of
                role tokens + an OKLCH accent ramp. Paste into your global stylesheet. Every
                shilp-sutra component follows. Switch themes by toggling a class, or write{' '}
                <code className="font-mono text-ds-sm text-surface-fg">data-archetype=&quot;apple&quot;</code>{' '}
                on the body and reload.
              </Text>
              <div className="flex flex-wrap gap-ds-03 text-ds-sm mt-ds-02">
                <Link href="/docs/customize-brand" className="text-accent-11 underline underline-offset-2 hover:text-accent-12">
                  Customize-brand recipe
                </Link>
                <Link href="/agents" className="text-accent-11 underline underline-offset-2 hover:text-accent-12">
                  AI agent setup
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
