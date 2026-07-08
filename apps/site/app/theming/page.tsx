import type { Metadata } from 'next'
import Link from 'next/link'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ThemingEditor } from '@/components/theming-editor'

export const metadata: Metadata = {
  title: 'Theming',
  description:
    'Build your own brand on shilp-sutra. Live OKLCH editor. Pick a hue, see every component recolour, export the CSS.',
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
              title="Be yourself in OKLCH."
              subtitle="Pick a hue. Set the chroma. The twelve-step ramp generates itself."
              description="Every component on the site recolours live as you move the sliders. Buttons, badges, alerts, focus rings. Drop the exported CSS into your project and your whole app follows."
              meta={
                <Text variant="body-sm" className="text-surface-fg-subtle">
                  No theme provider, CSS-vars only. Light and dark generate together, from the same
                  algorithm shilp-sutra ships with.
                </Text>
              }
            />

            <ThemingEditor />

            <section className="border-t border-surface-border-subtle pt-ds-08">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-ds-04 rounded-surface border border-surface-border-subtle bg-surface-2 p-ds-05">
                <div className="flex flex-col gap-ds-02">
                  <Text variant="label-sm" className="text-surface-fg-subtle">
                    Not sure where to start?
                  </Text>
                  <Text variant="heading-sm" className="text-surface-fg">
                    Try the Themer.
                  </Text>
                  <Text variant="body-sm" className="text-surface-fg-muted">
                    Four entry doors: pick an archetype, paste your brand color, take a wizard, or
                    just see a result page. Each drops you at install + CSS to paste, no editing
                    required.
                  </Text>
                </div>
                <Link
                  href="/themer"
                  className="inline-flex shrink-0 items-center gap-ds-02 rounded-control bg-accent-9 px-ds-05 py-ds-03 text-ds-sm font-medium text-accent-fg hover:bg-accent-10"
                >
                  Open the Themer →
                </Link>
              </div>
            </section>

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
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
