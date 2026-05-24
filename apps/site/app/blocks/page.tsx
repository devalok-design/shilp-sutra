import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { PageHeader } from '@/components/page-header'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CARD_EYEBROW, CARD_INTERACTIVE, CARD_TITLE } from '@/lib/card-recipe'
import { getAllBlocks } from '@/lib/blocks-registry'

export const metadata: Metadata = {
  title: 'Blocks',
  description:
    'Real-world multi-component pages built with shilp-sutra. Dashboard shells, auth flows, pricing pages — copy the source, drop it in, ship.',
}

export default function BlocksIndexPage() {
  const blocks = getAllBlocks()
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-ds-page-x py-ds-09">
          <div className="flex flex-col gap-ds-09">
            <PageHeader
              eyebrow="Blocks"
              title="Real screens, not toy demos."
              subtitle="Multi-component surfaces lifted from the work — dashboards, sign-up flows, pricing pages."
              description="Each block recolours with the brand switcher. Copy the source, paste, ship."
            />

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-ds-05">
              {blocks.map((b) => (
                <li key={b.slug}>
                  <Link href={`/blocks/${b.slug}`} className={CARD_INTERACTIVE + ' flex flex-col gap-ds-04 h-full'}>
                    <header className="flex flex-col gap-ds-01">
                      <span className={CARD_EYEBROW + ' mb-0'}>Block · {b.tags[0] ?? 'pattern'}</span>
                      <div className="flex items-start justify-between gap-ds-03">
                        <h3 className={CARD_TITLE}>{b.title}</h3>
                        <IconArrowRight
                          size={16}
                          className="text-surface-fg-subtle group-hover:translate-x-1 group-hover:text-surface-fg transition-transform duration-fast-02 ease-productive-standard shrink-0 mt-1"
                        />
                      </div>
                    </header>
                    <p className="text-ds-sm text-surface-fg-subtle line-clamp-2">{b.description}</p>
                    <div className="flex flex-wrap gap-ds-01 mt-auto pt-ds-02">
                      {b.tags.slice(1).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center px-ds-02 py-[1px] rounded-ds-sm bg-surface-overlay border border-surface-border-subtle text-ds-xs font-mono text-surface-fg-subtle"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="rounded-ds-md border border-surface-border-subtle bg-surface-raised p-ds-06 flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-subtle">
                More coming
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                Settings + data-table blocks land in the next site update. If you have a block
                shape you wish existed, file it at github.com/devalok-design/shilp-sutra/issues.
              </Text>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
