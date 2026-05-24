import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlockDetailShell } from '@/components/block-detail-shell'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getBlock, getBlockSlugs, getBlockSource } from '@/lib/blocks-registry'

export async function generateStaticParams() {
  return getBlockSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const block = getBlock(slug)
  if (!block) return { title: 'Not found' }
  return { title: block.title, description: block.description }
}

export default async function BlockDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const block = getBlock(slug)
  if (!block) notFound()

  const source = (await getBlockSource(slug)) ?? '// source unavailable'
  const { Component } = block

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-ds-page-x py-ds-09">
          <nav aria-label="Breadcrumb" className="mb-ds-06">
            <Link
              href="/blocks"
              className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
            >
              ← All blocks
            </Link>
          </nav>

          <PageHeader eyebrow={`Block · ${block.tags[0] ?? 'pattern'}`} title={block.title} description={block.description} />

          <BlockDetailShell source={source} uses={block.uses}>
            <Component />
          </BlockDetailShell>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
