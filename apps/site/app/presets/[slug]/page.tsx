import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { PresetDetailShell } from '@/components/preset-detail-shell'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getPreset, getPresetSlugs, getPresetSource } from '@/lib/presets-registry'

export async function generateStaticParams() {
  return getPresetSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const preset = getPreset(slug)
  if (!preset) return { title: 'Not found' }
  return { title: `${preset.title} · Preset Library`, description: preset.description }
}

export default async function PresetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const preset = getPreset(slug)
  if (!preset) notFound()

  const source = (await getPresetSource(slug)) ?? '// source unavailable'
  const { Component } = preset

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <nav aria-label="Breadcrumb" className="mb-ds-06">
            <Link
              href="/presets"
              className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
            >
              ← Preset Library
            </Link>
          </nav>

          <PageHeader
            eyebrow={`Preset · ${preset.categories[0] ?? 'pattern'}`}
            title={preset.title}
            description={preset.description}
          />

          <PresetDetailShell source={source} uses={preset.uses} installName={preset.installName}>
            <Component />
          </PresetDetailShell>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
