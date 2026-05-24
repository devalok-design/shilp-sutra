import Link from 'next/link'
import { IconArrowUpRight } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { getAllShowcases } from '@/lib/showcase-registry'

export function ShowcasePicker({ currentSlug }: { currentSlug: string }) {
  const others = getAllShowcases().filter((e) => e.slug !== currentSlug)

  return (
    <section aria-label="More showcases" className="mt-ds-12 pt-ds-08 border-t border-surface-border-subtle">
      <header className="flex flex-col gap-ds-02 max-w-3xl mb-ds-06">
        <Text variant="label-sm" className="text-surface-fg-subtle">
          See another industry
        </Text>
        <Text variant="heading-md" className="text-surface-fg">
          Same library, somewhere else.
        </Text>
      </header>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-ds-04">
        {others.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/showcase/${e.slug}`}
              className="flex flex-col gap-ds-03 h-full p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised hover:border-surface-border transition-colors duration-fast-01 group"
            >
              <header className="flex items-center justify-between gap-ds-02">
                <Text variant="label-sm" className="text-surface-fg-subtle">
                  {e.industry.split(' · ')[0]}
                </Text>
                <span
                  aria-hidden
                  className="w-4 h-4 rounded-full border border-surface-border-subtle shrink-0"
                  style={{ background: `oklch(0.55 ${e.chroma} ${e.hue})` }}
                />
              </header>
              <div className="flex flex-col gap-ds-01">
                <Text variant="heading-sm" className="text-surface-fg">
                  {e.product}
                </Text>
                <Text variant="body-xs" className="text-surface-fg-muted">
                  {e.tagline}
                </Text>
              </div>
              <span className="mt-auto inline-flex items-center gap-ds-02 text-ds-xs text-accent-11 group-hover:underline underline-offset-2">
                See it
                <IconArrowUpRight size={12} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
