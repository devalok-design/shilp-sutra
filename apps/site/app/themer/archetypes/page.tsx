import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { PreviewFrame } from '@/components/themer/PreviewFrame'
import {
  type ArchetypeName,
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_TITLES,
} from '@/lib/archetype-presets'

export const metadata: Metadata = {
  title: 'Archetype gallery — Themer',
  description:
    'Seven archetype presets, side by side. Click one to see its result page with install commands and CSS to paste.',
}

const ORDER: ArchetypeName[] = [
  'linear',
  'stripe',
  'apple',
  'material',
  'notion',
  'vercel',
  'devalok',
]

const ARCHETYPE_ACCENT: Record<ArchetypeName, { hue: number; chroma: number }> = {
  linear:   { hue: 270, chroma: 0.18 },
  stripe:   { hue: 250, chroma: 0.20 },
  apple:    { hue: 220, chroma: 0.15 },
  material: { hue: 260, chroma: 0.22 },
  notion:   { hue: 30,  chroma: 0.06 },
  vercel:   { hue: 0,   chroma: 0.01 },
  devalok:  { hue: 340, chroma: 0.19 },
}

export default function ArchetypeGalleryPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <div className="flex flex-col gap-ds-08">
            <PageHeader
              eyebrow="Themer · Archetypes"
              title="Pick one that feels right."
              subtitle="Seven presets. Same components, seven personalities."
              description="Each archetype bundles a coherent set of role tokens — corner radius, density, borders, shadows, motion. Click any card to land on its result page with install commands + the CSS snippet to paste."
              meta={
                <Link
                  href="/themer"
                  className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg"
                >
                  ← Back to Themer
                </Link>
              }
            />

            <section
              aria-label="Archetype presets"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-04"
            >
              {ORDER.map((name) => {
                const accent = ARCHETYPE_ACCENT[name]
                return (
                  <Link
                    key={name}
                    href={`/themer/result?archetype=${name}&hue=${accent.hue}&chroma=${accent.chroma}`}
                    className="group flex flex-col gap-ds-03 rounded-surface border border-surface-border-subtle bg-surface-2 p-ds-05 transition-all duration-fast-01 hover:border-accent-7 hover:shadow-raised"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide font-mono">
                        {name}
                      </span>
                      <span className="text-ds-xs text-accent-11 opacity-0 group-hover:opacity-100 transition-opacity">
                        use this →
                      </span>
                    </div>
                    <h2 className="text-ds-lg font-semibold text-surface-fg">
                      {ARCHETYPE_TITLES[name]}
                    </h2>
                    <PreviewFrame
                      archetype={name}
                      hue={accent.hue}
                      chroma={accent.chroma}
                      size="mini"
                    />
                    <p className="text-ds-sm text-surface-fg-muted leading-relaxed">
                      {ARCHETYPE_DESCRIPTIONS[name]}
                    </p>
                  </Link>
                )
              })}
            </section>

            <section className="border-t border-surface-border-subtle pt-ds-08 flex flex-col gap-ds-03 max-w-2xl">
              <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
                Want more control?
              </span>
              <p className="text-ds-md text-surface-fg-muted leading-relaxed">
                Archetypes are a starting point, not a cage. After you pick one, the result page
                exposes the underlying role tokens. Override any of them in your own CSS — radius,
                density, motion, borders. Or start from your{' '}
                <Link href="/themer/brand" className="text-accent-11 underline underline-offset-2">
                  brand color
                </Link>{' '}
                and we'll suggest an archetype to pair with it.
              </p>
            </section>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  )
}
