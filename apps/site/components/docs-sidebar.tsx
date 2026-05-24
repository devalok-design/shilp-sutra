import Link from 'next/link'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { getCategoryLabel, getDocMeta, groupedDocs } from '@/lib/docs-registry'

export function DocsSidebar({ currentSlug }: { currentSlug: string }) {
  const groups = groupedDocs()
  const categories = ['install', 'customize', 'reference', 'troubleshoot'] as const

  return (
    <nav aria-label="Docs navigation" className="flex flex-col gap-ds-06">
      {categories.map((category) => {
        const slugs = groups[category]
        if (slugs.length === 0) return null
        return (
          <div key={category} className="flex flex-col gap-ds-02">
            <Text variant="label-sm" className="text-surface-fg-subtle">
              {getCategoryLabel(category)}
            </Text>
            <ul className="flex flex-col gap-ds-01">
              {slugs.map((slug) => {
                const meta = getDocMeta(slug)
                if (!meta) return null
                const isActive = slug === currentSlug
                return (
                  <li key={slug}>
                    <Link
                      href={`/docs/${slug}`}
                      className={[
                        'block px-ds-03 py-ds-02 rounded-ds-sm text-ds-sm transition-colors duration-fast-01',
                        isActive
                          ? 'bg-accent-3 text-accent-11 font-medium'
                          : 'text-surface-fg-muted hover:bg-surface-raised-hover hover:text-surface-fg',
                      ].join(' ')}
                    >
                      {meta.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
