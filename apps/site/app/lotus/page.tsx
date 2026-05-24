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
              title="The lotus, made of light."
              subtitle="Bud, opening, full bloom, peak, close."
              description="A WebGL composition that follows the developmental biology of Nelumbo nucifera. Same mesh primitives as Aurora — three stacked layers (leaves, petals, stamens) choreographed through five named keyframes with an easeInOutSine glide between each."
            />
            <LotusShowcase />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
