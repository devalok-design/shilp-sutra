import type { Metadata } from 'next'

import { LotusShowcase } from '@/components/lotus-showcase'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Lotus',
  description:
    'LotusBloom — a five-stage WebGL composition that mimics the daily bloom cycle of Nelumbo nucifera. Sibling to AuroraBloom; same mesh primitives, different choreography.',
}

export default function LotusPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-7xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow="Lotus"
              title="A field of lotuses."
              subtitle="Eight petals out, six petals in."
              description="Each lotus is an SVG flower — explicit petals, each with a base-light to tip-deep gradient drawn from --color-accent-*. The field cascades open in a wave; switch brand from the header to recolour every flower at once."
            />
            <LotusShowcase />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
