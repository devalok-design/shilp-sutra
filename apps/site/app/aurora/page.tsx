import type { Metadata } from 'next'

import { AuroraPlayground } from '@/components/aurora-playground'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Aurora',
  description:
    'Interactive playground for AuroraBloom, the theme-reactive WebGL aurora curtain from @devalok/shilp-sutra-brand/aurora.',
}

export default function AuroraPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-7xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow="Aurora"
              title="Aurora, your way."
              subtitle="Curtain or halo. Top or full. Subtle or loud."
              description="Every prop on AuroraBloom is live below. The preview pulls the same brand ramp the rest of the system uses, so changes flow through colour, theme, and motion in one place."
            />
            <AuroraPlayground />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
