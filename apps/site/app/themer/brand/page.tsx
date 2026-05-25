import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { BrandImportPanel } from '@/components/themer/BrandImportPanel'

export const metadata: Metadata = {
  title: 'Use my brand — Themer',
  description:
    'Paste a hex or dial OKLCH. shilp-sutra generates the 12-step ramp and suggests an archetype that pairs with your color.',
}

export default function BrandImportPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-08">
            <PageHeader
              eyebrow="Themer · Brand"
              title="Start from your color."
              subtitle="Hex in. Ramp + archetype out."
              description="Paste a hex or move the OKLCH sliders. We compute the full 12-step ramp using the same algorithm shilp-sutra ships with, and suggest an archetype that pairs with your hue."
              meta={
                <Link
                  href="/themer"
                  className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg"
                >
                  ← Back to Themer
                </Link>
              }
            />

            <BrandImportPanel />

            <section className="border-t border-surface-border-subtle pt-ds-08 flex flex-col gap-ds-03 max-w-2xl">
              <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                Why OKLCH?
              </span>
              <p className="text-ds-md text-surface-fg-muted leading-relaxed">
                OKLCH lets us hold lightness steady across the ramp while you change the hue.
                That's what keeps step 1 and step 12 readable on the same backgrounds at every hue —
                something the old HSL/HSV ramps couldn't do. If you only have a hex, that's fine:
                we approximate the hue from RGB and let you fine-tune from there.
              </p>
            </section>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  )
}
