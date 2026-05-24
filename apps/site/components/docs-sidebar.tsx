'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconChevronDown } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

type DocsCategoryKey = 'install' | 'customize' | 'reference' | 'troubleshoot'

export type DocsSidebarGroup = {
  key: DocsCategoryKey
  label: string
  docs: { slug: string; title: string }[]
}

const ORDER: DocsCategoryKey[] = ['install', 'customize', 'reference', 'troubleshoot']

/**
 * Client component — needs media-query state. The fs-touching registry stays
 * on the server side; the parent page reads docs/groupings and hands them
 * down as plain props.
 *
 * UX intent:
 *   <lg: per-category accordion. Only the category holding the current doc
 *        is open by default; user can tap others to expand.
 *   lg+: always-open; accordion chevrons hidden; reads as a static sidebar.
 */
export function DocsSidebar({
  currentSlug,
  groups,
  currentCategory,
}: {
  currentSlug: string
  groups: DocsSidebarGroup[]
  currentCategory?: DocsCategoryKey
}) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const k of ORDER) init[k] = k === currentCategory
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
    <nav aria-label="Docs navigation" className="flex flex-col gap-ds-04 lg:gap-ds-06">
      {groups.map((group) => {
        if (group.docs.length === 0) return null
        const expanded = isDesktop || openMap[group.key]
        const headerId = `docs-cat-${group.key}`
        const listId = `docs-list-${group.key}`
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
                'flex items-center justify-between gap-ds-02 px-ds-03 py-ds-02 rounded-ds-sm text-left',
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
                {group.docs.map((doc) => {
                  const isActive = doc.slug === currentSlug
                  return (
                    <li key={doc.slug}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        className={[
                          'block px-ds-03 py-ds-02 rounded-ds-sm text-ds-sm transition-colors duration-fast-01',
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
