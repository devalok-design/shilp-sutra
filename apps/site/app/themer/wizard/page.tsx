import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { WizardFlow } from '@/components/themer/WizardFlow'

export const metadata: Metadata = {
  title: 'Wizard · Themer',
  description:
    'Five questions. We pick the archetype, density, shape, motion, and accent for you, then drop you at a result page.',
}

export default function WizardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-08">
            <PageHeader
              eyebrow="Themer · Wizard"
              title="Five questions."
              subtitle="Answer what you can. Defaults fill the rest."
              description="The wizard composes archetype + density + shape + motion + accent from your answers and drops you at a result page with install commands and CSS to paste."
              meta={
                <Link
                  href="/themer"
                  className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg"
                >
                  ← Back to Themer
                </Link>
              }
            />

            <WizardFlow />
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  )
}
