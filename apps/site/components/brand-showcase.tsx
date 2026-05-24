import type { CSSProperties } from 'react'
import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { generateRamp } from '@/lib/ramp-generator'

type IndustryBrand = {
  industry: string
  productName: string
  tagline: string
  hue: number
  chroma: number
  tag: string
}

const BRANDS: IndustryBrand[] = [
  { industry: 'SaaS · B2B', productName: 'Atlas', tagline: 'Project workspaces for distributed teams.', hue: 245, chroma: 0.19, tag: 'Workspaces' },
  { industry: 'Fintech', productName: 'Lendis', tagline: 'KYC + lending, end to end.', hue: 145, chroma: 0.16, tag: 'KYC live' },
  { industry: 'Consumer · D2C', productName: 'Mira', tagline: 'Slow-made textiles, shipped global.', hue: 55, chroma: 0.18, tag: 'New arrivals' },
  { industry: 'Healthcare', productName: 'Vaidya', tagline: 'A clinic, in your pocket.', hue: 200, chroma: 0.15, tag: 'In care' },
  { industry: 'Editorial', productName: 'Patrika', tagline: 'Long-form journalism, weekly.', hue: 15, chroma: 0.2, tag: 'Vol. iv' },
  { industry: 'Devalok house', productName: 'shilp-sutra', tagline: 'The library that ships here.', hue: 360, chroma: 0.19, tag: 'v0.39' },
]

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
          Same parts. Six brands.
        </Text>
        <Text variant="heading-xl" className="text-surface-fg">
          One library. Endless looks.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          Click any tile to take that look into the editor and make it yours.
        </Text>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
        {BRANDS.map((b) => (
          <Link
            key={b.productName}
            href={`/theming?hue=${b.hue}&chroma=${b.chroma}`}
            style={rampInlineStyle(b.hue, b.chroma)}
            className="flex flex-col gap-ds-04 p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised hover:border-accent-9 transition-colors duration-fast-01 group"
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
                {b.tagline}
              </Text>
            </div>
            <footer className="mt-auto flex items-center justify-between gap-ds-02">
              <span className="inline-flex items-center gap-ds-02 text-ds-sm text-accent-11 group-hover:underline underline-offset-2">
                Try this look
                <IconArrowUpRight size={14} />
              </span>
              <span
                aria-hidden
                className="w-6 h-6 rounded-full border border-surface-border-subtle shrink-0"
                style={{ background: `oklch(0.55 ${b.chroma} ${b.hue})` }}
              />
            </footer>
          </Link>
        ))}
      </div>

      <footer className="mt-ds-08 text-center">
        <Text variant="body-sm" className="text-surface-fg-muted">
          Karm — the project tool that runs Devalok — uses this same library. The pink you see here is the pink Karm ships.
        </Text>
      </footer>
    </section>
  )
}
