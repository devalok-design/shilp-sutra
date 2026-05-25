import type { CSSProperties } from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CARD_EYEBROW, CARD_INTERACTIVE, CARD_TITLE } from '@/lib/card-recipe'
import { generateRamp } from '@/lib/ramp-generator'

import { getAllShowcases } from '@/lib/showcase-registry'

const BRANDS = getAllShowcases().map((s) => ({
  slug: s.slug,
  industry: s.industry,
  productName: s.product,
  tagline: s.tagline,
  hue: s.hue,
  chroma: s.chroma,
}))

function rampInlineStyle(hue: number, chroma: number): CSSProperties {
  const ramp = generateRamp(hue, chroma)
  const style: Record<string, string> = {}
  ramp.light.forEach((s) => {
    style[`--color-accent-${s.step}`] = s.value
  })
  const accent9L = Number.parseFloat(ramp.light[8].value.match(/oklch\(\s*([0-9.]+)/)?.[1] ?? '0.55')
  style['--color-accent-fg'] = accent9L < 0.62 ? 'oklch(0.99 0 0)' : 'oklch(0.13 0 0)'
  return style as CSSProperties
}

export function BrandShowcase() {
  return (
    <section id="showcase" className="mx-auto max-w-6xl px-page-x py-ds-12">
      <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-08">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Same library. Six different products.
        </Text>
        <Text variant="heading-xl" className="text-surface-fg">
          See it fit your kind of work.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          Each tile is a full example. A dashboard, a checkout, a patient record. All built from
          the same shilp-sutra components. Click in to see it run.
        </Text>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
        {BRANDS.map((b) => (
          <Link
            key={b.slug}
            href={`/showcase/${b.slug}`}
            style={rampInlineStyle(b.hue, b.chroma)}
            className={CARD_INTERACTIVE + ' flex flex-col gap-ds-04'}
          >
            <header className="flex items-center justify-between gap-ds-02">
              <span className={CARD_EYEBROW + ' mb-0'}>{b.industry}</span>
              <span
                aria-hidden
                className="w-5 h-5 rounded-full border border-surface-border shrink-0"
                style={{ background: `oklch(0.55 ${b.chroma} ${b.hue})` }}
              />
            </header>
            <div className="flex flex-col gap-ds-02">
              <h3 className={CARD_TITLE}>{b.productName}</h3>
              <p className="text-ds-sm text-surface-fg-subtle line-clamp-2">{b.tagline}</p>
            </div>
            <footer className="mt-auto pt-ds-02">
              <span className="inline-flex items-center gap-ds-02 text-ds-sm text-accent-11 group-hover:underline underline-offset-2">
                See the example
                <IconArrowUpRight
                  size={14}
                  className="transition-transform duration-fast-02 ease-productive-standard group-hover:translate-x-0.5"
                />
              </span>
            </footer>
          </Link>
        ))}
      </div>

      <footer className="mt-ds-08 text-center">
        <Text variant="body-sm" className="text-surface-fg-muted">
          Karm, the project tool that runs Devalok, uses this same library. The pink you see here is the pink Karm ships.
        </Text>
      </footer>
    </section>
  )
}
