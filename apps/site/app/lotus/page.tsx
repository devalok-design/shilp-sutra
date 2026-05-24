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
              subtitle="Devalok colour, the way nature carries it."
              description="Each lotus is a single WebGL mesh masked into a circle. The colour ramp pulls live from --color-accent-* — white at the centre, pink at the edge — so the lotuses follow your brand without losing their shape."
            />
            <LotusShowcase />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
