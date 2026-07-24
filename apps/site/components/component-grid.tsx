'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { IconArrowUpRight, IconSearch } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { CARD_INTERACTIVE, CARD_TITLE } from '@/lib/card-recipe'
import { FUNCTION_CATEGORIES } from '@/lib/component-categories'
import type { ComponentMeta, Layer } from '@/lib/component-registry'

const LAYER_LABELS: Record<Layer, string> = {
  ui: 'Building blocks',
  composed: 'Patterns',
  shell: 'App layout',
}


export function ComponentGrid({
  items,
  previewSlugs = [],
}: {
  items: ComponentMeta[]
  previewSlugs?: string[]
}) {
  const [query, setQuery] = useState('')
  const previewSet = useMemo(() => new Set(previewSlugs), [previewSlugs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.slug.includes(q) ||
        item.importPath.toLowerCase().includes(q),
    )
  }, [items, query])

  const grouped = useMemo(() => {
    const byCategory = new Map<string, ComponentMeta[]>()
    for (const item of filtered) {
      const bucket = byCategory.get(item.functionCategory) ?? []
      bucket.push(item)
      byCategory.set(item.functionCategory, bucket)
    }
    return FUNCTION_CATEGORIES.map(({ key, label }) => ({
      key,
      label,
      items: byCategory.get(key) ?? [],
    })).filter((group) => group.items.length > 0)
  }, [filtered])

  return (
    <div className="flex flex-col gap-ds-06">
      <div className="relative max-w-md">
        <IconSearch
          size={16}
          className="absolute left-ds-04 top-1/2 -translate-y-1/2 text-surface-fg-subtle pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${items.length} components…`}
          aria-label="Search components"
          className="w-full h-ds-md pl-[2.5rem] pr-ds-04 rounded-surface border border-surface-border bg-surface-raised text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-ds-09 text-center">
          <Text variant="body-md" className="text-surface-fg-muted">
            No components match "{query}".
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-ds-08">
          {grouped.map((group) => (
            <section key={group.key} id={`category-${group.key}`} className="flex flex-col gap-ds-04">
              <h3 className="text-ds-lg font-semibold text-surface-fg">
                {group.label}
                <span className="ml-ds-02 text-ds-sm font-normal text-surface-fg-subtle">
                  {group.items.length}
                </span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
                {group.items.map((item) => (
                  <li key={`${item.layer}/${item.slug}`}>
                    <Link href={`/components/${item.slug}`} className={CARD_INTERACTIVE + ' flex flex-col gap-ds-03 h-full'}>
                      <div className="flex items-start justify-between gap-ds-03">
                        <h3 className={CARD_TITLE}>{item.name}</h3>
                        <IconArrowUpRight
                          size={16}
                          className="text-surface-fg-subtle group-hover:text-surface-fg group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-fast-02 ease-productive-standard shrink-0 mt-1"
                        />
                      </div>
                      <code className="text-ds-xs font-mono text-surface-fg-subtle truncate">{item.importPath}</code>
                      <div className="flex flex-wrap items-center gap-ds-02 mt-auto pt-ds-02">
                        <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-surface-overlay text-ds-xs text-surface-fg-subtle font-mono">
                          {LAYER_LABELS[item.layer]}
                        </span>
                        {previewSet.has(item.slug) && (
                          <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-accent-3 text-accent-11 text-ds-xs font-mono">
                            live preview
                          </span>
                        )}
                        {item.serverSafe && (
                          <span className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-success-3 text-success-11 text-ds-xs font-mono">
                            rsc-safe
                          </span>
                        )}
                        {item.variants.length > 0 && (
                          <span className="text-ds-xs text-surface-fg-subtle">
                            {item.variants.length} {item.variants.length === 1 ? 'axis' : 'axes'}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
