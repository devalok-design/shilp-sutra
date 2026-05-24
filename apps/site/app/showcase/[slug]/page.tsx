import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconPalette } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { PageHeader } from '@/components/page-header'
import { ShowcaseCanvas } from '@/components/showcase-canvas'
import { ShowcasePicker } from '@/components/showcase-picker'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { generateRamp } from '@/lib/ramp-generator'
import { getShowcase, getShowcaseSlugs } from '@/lib/showcase-registry'

export async function generateStaticParams() {
  return getShowcaseSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const entry = getShowcase(slug)
  if (!entry) return { title: 'Not found' }
  return {
    title: `${entry.product} · ${entry.industry}`,
    description: `${entry.tagline} ${entry.premise}`,
  }
}

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

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = getShowcase(slug)
  if (!entry) notFound()

  const { Component } = entry

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-ds-page-x py-ds-09">
          <nav aria-label="Breadcrumb" className="mb-ds-06">
            <Link
              href="/#showcase"
              className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
            >
              ← All showcases
            </Link>
          </nav>

          <PageHeader
            eyebrow={entry.industry}
            title={<span style={{ color: `oklch(0.55 ${entry.chroma} ${entry.hue})` }}>{entry.product}</span>}
            subtitle={entry.tagline}
            description={entry.premise}
            meta={
              <div className="flex flex-wrap items-center gap-ds-02">
                <Link href={`/theming?hue=${entry.hue}&chroma=${entry.chroma}`}>
                  <Button variant="soft" size="sm" startIcon={<IconPalette size={14} />}>
                    Take this brand into the editor
                  </Button>
                </Link>
                {entry.uses.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center px-ds-02 py-[1px] rounded-ds-sm bg-surface-raised border border-surface-border-subtle text-ds-xs font-mono text-surface-fg-muted"
                  >
                    {u}
                  </span>
                ))}
              </div>
            }
          />

          <ShowcaseCanvas brandStyle={rampInlineStyle(entry.hue, entry.chroma)} productName={entry.product}>
            <Component />
          </ShowcaseCanvas>

          <ShowcasePicker currentSlug={entry.slug} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
