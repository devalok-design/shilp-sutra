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
              subtitle="Thirty-two petals, three rings, one receptacle."
              description="Modelled on Nelumbo nucifera — broad ovate petals in spiralling rings (14 outer · 10 middle · 8 inner), sixteen stamen filaments around the centre, and the Devalok paper grain woven into every petal via a single SVG filter. Each flower spins, floats, and breathes on its own clock."
            />
            <LotusShowcase />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
