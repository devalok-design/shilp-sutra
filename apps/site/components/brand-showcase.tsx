import type { CSSProperties } from 'react'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { generateRamp } from '@/lib/ramp-generator'

type IndustryBrand = {
  industry: string
  productName: string
  hue: number
  chroma: number
  ctaLabel: string
  tag: string
}

const BRANDS: IndustryBrand[] = [
  { industry: 'SaaS · B2B', productName: 'Atlas', hue: 245, chroma: 0.19, ctaLabel: 'Open workspace', tag: 'Workspaces' },
  { industry: 'Fintech', productName: 'Lendis', hue: 145, chroma: 0.16, ctaLabel: 'View ledger', tag: 'KYC live' },
  { industry: 'Consumer · D2C', productName: 'Mira', hue: 55, chroma: 0.18, ctaLabel: 'Browse pieces', tag: 'New arrivals' },
  { industry: 'Healthcare', productName: 'Vaidya', hue: 200, chroma: 0.15, ctaLabel: 'See chart', tag: 'In care' },
  { industry: 'Editorial', productName: 'Patrika', hue: 15, chroma: 0.2, ctaLabel: 'Read essay', tag: 'Vol. iv' },
  { industry: 'Devalok house', productName: 'shilp-sutra', hue: 360, chroma: 0.19, ctaLabel: 'Install', tag: 'v0.39' },
]

/**
 * Builds an inline-style record with --color-accent-{1..12} + --color-accent-fg
 * set to the ramp values for the given hue. The CSS-vars cascade down to any
 * descendant DS component, so wrapping a Button/Badge/Card in a div with these
 * styles recolours that subtree without touching the rest of the page.
 */
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
    <section className="mx-auto max-w-6xl px-ds-page-x py-ds-12">
      <header className="flex flex-col gap-ds-03 max-w-3xl mb-ds-08">
        <Text variant="label-md" className="text-surface-fg-subtle">
          Same components. Six brands.
        </Text>
        <Text variant="heading-xl" className="text-surface-fg">
          shilp-sutra disappears into the brand it lives inside.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          One accent ramp drives the entire library. Swap the hue, change the chroma — the rest
          of the system follows, perceptually balanced. The tiles below are the same Card,
          Button, and Badge, rendered six times across industries.
        </Text>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
        {BRANDS.map((b) => (
          <article
            key={b.productName}
            style={rampInlineStyle(b.hue, b.chroma)}
            className="flex flex-col gap-ds-04 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised"
          >
            <header className="flex items-center justify-between gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                {b.industry}
              </Text>
              <Badge variant="soft" size="sm" color="accent">
                {b.tag}
              </Badge>
            </header>
            <div className="flex flex-col gap-ds-01">
              <Text variant="heading-sm" className="text-surface-fg">
                {b.productName}
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                Built on shilp-sutra. Coloured by intent.
              </Text>
            </div>
            <div className="mt-auto flex items-center justify-between gap-ds-02">
              <Button size="sm" endIcon={<IconArrowUpRight size={14} />}>
                {b.ctaLabel}
              </Button>
              <span
                aria-hidden
                className="w-6 h-6 rounded-full border border-surface-border-subtle shrink-0"
                style={{ background: `oklch(0.55 ${b.chroma} ${b.hue})` }}
              />
            </div>
          </article>
        ))}
      </div>

      <footer className="mt-ds-08 text-center">
        <Text variant="body-sm" className="text-surface-fg-muted">
          Karm — Devalok&apos;s own product — is built on the same accent ramp you see top-right.{' '}
          <a
            href="https://karm.devalok.in"
            target="_blank"
            rel="noreferrer"
            className="text-surface-fg underline underline-offset-2 hover:text-accent-11"
          >
            See it live →
          </a>
        </Text>
      </footer>
    </section>
  )
}
