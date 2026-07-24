'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconChevronDown } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

export type CategorySidebarGroup = {
  key: string
  label: string
  items: { slug: string; title: string }[]
}

/**
 * Generalized from the original docs-only sidebar so /docs and /components
 * can share one categorized-nav component with a consistent look, each with
 * its own basePath and its own category groups.
 *
 * UX intent (unchanged from the docs-only version):
 *   <lg: per-category accordion. Only the category holding the current item
 *        is open by default; user can tap others to expand.
 *   lg+: always-open; accordion chevrons hidden; reads as a static sidebar.
 */
export function CategorySidebar({
  basePath,
  currentSlug,
  groups,
  currentCategory,
  navLabel = 'Category navigation',
}: {
  basePath: string
  currentSlug: string
  groups: CategorySidebarGroup[]
  currentCategory?: string
  navLabel?: string
}) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const g of groups) init[g.key] = g.key === currentCategory
    return init
  })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <nav aria-label={navLabel} className="flex flex-col gap-ds-04 lg:gap-ds-06">
      {groups.map((group) => {
        if (group.items.length === 0) return null
        const expanded = isDesktop || openMap[group.key]
        const headerId = `category-${group.key}`
        const listId = `category-list-${group.key}`
        return (
          <div key={group.key} className="flex flex-col">
            <button
              type="button"
              id={headerId}
              aria-controls={listId}
              aria-expanded={expanded}
              onClick={() =>
                !isDesktop &&
                setOpenMap((m) => ({ ...m, [group.key]: !m[group.key] }))
              }
              className={[
                'flex items-center justify-between gap-ds-02 px-ds-03 py-ds-02 rounded-control-inner text-left',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                isDesktop
                  ? 'cursor-default'
                  : 'cursor-pointer hover:bg-surface-raised-hover',
              ].join(' ')}
            >
              <Text variant="label-sm" className="text-surface-fg-subtle">
                {group.label}
              </Text>
              {!isDesktop && (
                <IconChevronDown
                  size={14}
                  aria-hidden
                  className={[
                    'text-surface-fg-subtle transition-transform duration-fast-02 ease-productive-standard',
                    expanded ? 'rotate-180' : '',
                  ].join(' ')}
                />
              )}
            </button>
            {expanded && (
              <ul id={listId} aria-labelledby={headerId} className="flex flex-col gap-ds-01 mt-ds-02">
                {group.items.map((doc) => {
                  const isActive = doc.slug === currentSlug
                  return (
                    <li key={doc.slug}>
                      <Link
                        href={`${basePath}/${doc.slug}`}
                        className={[
                          'block px-ds-03 py-ds-02 rounded-control-inner text-ds-sm transition-colors duration-fast-01',
                          isActive
                            ? 'bg-accent-3 text-accent-11 font-medium'
                            : 'text-surface-fg-muted hover:bg-surface-raised-hover hover:text-surface-fg',
                        ].join(' ')}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
