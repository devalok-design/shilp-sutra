import type { Metadata } from 'next'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
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
          <div className="flex flex-col gap-ds-08">
            <header className="flex flex-col gap-ds-03 max-w-3xl">
              <Text variant="label-md" className="text-surface-fg-subtle">
                Blocks
              </Text>
              <Text variant="heading-2xl" className="text-surface-fg">
                Real screens, not toy demos.
              </Text>
              <Text variant="body-md" className="text-surface-fg-muted">
                Blocks compose shilp-sutra components into the surfaces consumers actually ship —
                dashboards, sign-up flows, pricing pages. Each block recolours with the brand
                switcher. Copy the source, paste, ship.
              </Text>
            </header>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-ds-05">
              {blocks.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/blocks/${b.slug}`}
                    className="group flex flex-col gap-ds-04 h-full p-ds-06 rounded-ds-md border border-surface-border-subtle bg-surface-raised hover:border-accent-9 hover:bg-surface-raised-hover hover:shadow-floating hover:-translate-y-1 transition-[box-shadow,border-color,translate,background-color] duration-fast-02 ease-productive-standard focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
                  >
                    <div className="flex items-start justify-between gap-ds-03">
                      <Text variant="heading-md" className="text-surface-fg">
                        {b.title}
                      </Text>
                      <IconArrowRight
                        size={16}
                        className="text-surface-fg-subtle group-hover:translate-x-1 group-hover:text-surface-fg transition-all duration-fast-01"
                      />
                    </div>
                    <Text variant="body-sm" className="text-surface-fg-muted">
                      {b.description}
                    </Text>
                    <div className="flex flex-wrap gap-ds-01 mt-auto">
                      {b.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center px-ds-02 py-[1px] rounded-ds-sm bg-surface-overlay border border-surface-border-subtle text-ds-xs font-mono text-surface-fg-muted"
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
