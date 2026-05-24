import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { DocsSidebar, type DocsSidebarGroup } from '@/components/docs-sidebar'
import { Markdown } from '@/components/markdown'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getAllDocSlugs, getCategoryLabel, getDoc, getDocMeta, groupedDocs } from '@/lib/docs-registry'

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = getDocMeta(slug)
  if (!meta) return { title: 'Not found' }
  return { title: meta.title, description: `${getCategoryLabel(meta.category)} guide for shilp-sutra: ${meta.title}.` }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = await getDoc(slug)
  if (!doc) notFound()

  const slugs = getAllDocSlugs()
  const idx = slugs.indexOf(slug)
  const prev = idx > 0 ? slugs[idx - 1] : null
  const next = idx < slugs.length - 1 ? slugs[idx + 1] : null

  const grouped = groupedDocs()
  const sidebarGroups: DocsSidebarGroup[] = (['install', 'customize', 'reference', 'troubleshoot'] as const).map((key) => ({
    key,
    label: getCategoryLabel(key),
    docs: grouped[key]
      .map((s) => {
        const meta = getDocMeta(s)
        return meta ? { slug: s, title: meta.title } : null
      })
      .filter((d): d is { slug: string; title: string } => d !== null),
  }))

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-page-x py-ds-09 grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-ds-06 lg:gap-ds-09">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <DocsSidebar currentSlug={slug} groups={sidebarGroups} currentCategory={doc.category} />
          </aside>
          <article className="min-w-0">
            <PageHeader eyebrow={getCategoryLabel(doc.category)} title={doc.title} />
            <Markdown source={doc.source} />

            <nav className="mt-ds-12 pt-ds-06 border-t border-surface-border-subtle grid grid-cols-2 gap-ds-04">
              {prev ? (
                <Link
                  href={`/docs/${prev}`}
                  className="flex flex-col items-start gap-ds-02 p-ds-04 rounded-ds-md border border-surface-border-subtle hover:border-surface-border transition-colors duration-fast-01"
                >
                  <span className="inline-flex items-center gap-ds-02 text-ds-xs text-surface-fg-subtle">
                    <IconArrowLeft size={14} /> Previous
                  </span>
                  <Text variant="body-sm" className="text-surface-fg">
                    {getDocMeta(prev)?.title}
                  </Text>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/docs/${next}`}
                  className="flex flex-col items-end gap-ds-02 p-ds-04 rounded-ds-md border border-surface-border-subtle hover:border-surface-border transition-colors duration-fast-01 text-right"
                >
                  <span className="inline-flex items-center gap-ds-02 text-ds-xs text-surface-fg-subtle">
                    Next <IconArrowRight size={14} />
                  </span>
                  <Text variant="body-sm" className="text-surface-fg">
                    {getDocMeta(next)?.title}
                  </Text>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
