import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowUpRight, IconShieldCheck } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { Markdown } from '@/components/markdown'
import { PageHeader } from '@/components/page-header'
import { PreviewCodeTabs } from '@/components/preview-code-tabs'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import {
  extractExampleCode,
  findLayerForSlug,
  getComponentDocRaw,
  getRegistry,
} from '@/lib/component-registry'
import { getPreview, hasPreview } from '@/lib/preview-registry'

export async function generateStaticParams() {
  const items = await getRegistry()
  return items.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const layer = await findLayerForSlug(slug)
  if (!layer) return { title: 'Not found' }
  const items = await getRegistry()
  const item = items.find((i) => i.slug === slug && i.layer === layer)
  if (!item) return { title: 'Not found' }
  return {
    title: item.name,
    description: `${item.name} from shilp-sutra. ${item.serverSafe ? 'Server-safe.' : 'Client component.'} Variants: ${item.variants.join(', ') || 'no variant axes'}.`,
  }
}

export default async function ComponentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const layer = await findLayerForSlug(slug)
  if (!layer) notFound()

  const items = await getRegistry()
  const item = items.find((i) => i.slug === slug && i.layer === layer)
  if (!item) notFound()

  const raw = await getComponentDocRaw(layer, slug)
  if (!raw) notFound()

  // Strip the H1 and the leading bullets block from the markdown — we render
  // those ourselves above the content. What's left starts at the first H2.
  const stripped = raw.replace(/^#\s+.+$/m, '').replace(/^([-*]\s+.+\n)+/m, '').trim()

  const preview = hasPreview(slug) ? getPreview(slug) : null
  const exampleCode = extractExampleCode(raw)

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-5xl px-page-x pt-[5.5rem] sm:pt-[5rem] pb-ds-09">
          <nav aria-label="Breadcrumb" className="mb-ds-06">
            <Link
              href="/components"
              className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
            >
              ← All components
            </Link>
          </nav>

          <PageHeader
            eyebrow={
              <span className="inline-flex flex-wrap items-center gap-ds-02">
                <span>
                  {item.layer} · {item.layer === 'ui' ? 'Primitive' : item.layer === 'composed' ? 'Composed pattern' : 'Shell'}
                </span>
                {item.serverSafe && (
                  <span className="inline-flex items-center gap-ds-01 rounded-ds-sm bg-success-3 text-success-11 px-ds-02 py-[1px] font-mono normal-case tracking-normal">
                    <IconShieldCheck size={12} /> rsc-safe
                  </span>
                )}
              </span>
            }
            title={item.name}
            meta={
              <div className="flex flex-wrap items-center gap-ds-04">
                <code className="text-ds-sm font-mono text-surface-fg-muted">{item.importPath}</code>
                <Link
                  href={item.storybookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-ds-02 text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
                >
                  View in Storybook <IconArrowUpRight size={14} />
                </Link>
              </div>
            }
          />

          {preview ? (
            <>
              <section aria-labelledby="preview" className="mb-ds-09">
                <Text id="preview" variant="heading-md" className="text-surface-fg mb-ds-04">
                  Preview
                </Text>
                <PreviewCodeTabs preview={<preview.Hero />} code={exampleCode} />
              </section>
              {preview.Variants && (
                <section aria-labelledby="variants" className="mb-ds-09">
                  <Text id="variants" variant="heading-md" className="text-surface-fg mb-ds-04">
                    Variants
                  </Text>
                  <preview.Variants />
                </section>
              )}
            </>
          ) : (
            <section className="mb-ds-09 p-ds-06 rounded-ds-md border border-warning-6 bg-warning-2">
              <Text variant="label-sm" className="text-warning-11">
                Live preview coming
              </Text>
              <Text variant="body-sm" className="text-surface-fg mt-ds-02">
                Hand-curated previews ship in rolling waves. {' '}
                <Link href={item.storybookUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  See it live in Storybook →
                </Link>
              </Text>
            </section>
          )}

          <section aria-labelledby="reference">
            <Text id="reference" variant="heading-md" className="text-surface-fg mb-ds-04">
              Reference
            </Text>
            <Markdown source={stripped} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
