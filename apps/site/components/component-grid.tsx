'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { IconArrowUpRight, IconSearch } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'
import type { ComponentMeta, Layer } from '@/lib/component-registry'

const LAYER_LABELS: Record<Layer | 'all', string> = {
  all: 'All',
  ui: 'UI primitives',
  composed: 'Composed',
  shell: 'Shell',
}

const LAYER_TAGLINE: Record<Layer, string> = {
  ui: 'Atomic building blocks. Inputs, buttons, dialogs, typography.',
  composed: 'Multi-component patterns. Date picker, command palette, page headers.',
  shell: 'App-level layout. Sidebar, top bar, navigation, notification center.',
}

export function ComponentGrid({ items }: { items: ComponentMeta[] }) {
  const [query, setQuery] = useState('')
  const [activeLayer, setActiveLayer] = useState<Layer | 'all'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (activeLayer !== 'all' && item.layer !== activeLayer) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.slug.includes(q) ||
        item.importPath.toLowerCase().includes(q)
      )
    })
  }, [items, query, activeLayer])

  const counts = useMemo(() => {
    const c: Record<Layer | 'all', number> = {
      all: items.length,
      ui: 0,
      composed: 0,
      shell: 0,
    }
    for (const item of items) c[item.layer]++
    return c
  }, [items])

  return (
    <div className="flex flex-col gap-ds-06">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ds-04">
        <div className="relative flex-1 max-w-md">
          <IconSearch
            size={16}
            className="absolute left-ds-04 top-1/2 -translate-y-1/2 text-surface-fg-subtle pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 119 components…"
            aria-label="Search components"
            className="w-full h-ds-md pl-[2.5rem] pr-ds-04 rounded-ds-lg border border-surface-border bg-surface-raised text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
          />
        </div>
        <div role="tablist" aria-label="Filter by layer" className="flex items-center gap-ds-01 flex-wrap">
          {(['all', 'ui', 'composed', 'shell'] as const).map((layer) => {
            const isActive = activeLayer === layer
            return (
              <button
                key={layer}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveLayer(layer)}
                className={[
                  'px-ds-04 py-ds-02 rounded-ds-md text-ds-sm font-medium transition-colors duration-fast-01',
                  isActive
                    ? 'bg-accent-3 text-accent-11'
                    : 'text-surface-fg-muted hover:bg-surface-raised-hover',
                ].join(' ')}
              >
                {LAYER_LABELS[layer]}
                <span className="ml-ds-02 text-surface-fg-subtle font-normal">{counts[layer]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {activeLayer !== 'all' && (
        <div className="px-ds-04 py-ds-03 rounded-ds-sm bg-surface-raised border border-surface-border-subtle">
          <Text variant="body-sm" className="text-surface-fg-muted">
            {LAYER_TAGLINE[activeLayer]}
          </Text>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-ds-09 text-center">
          <Text variant="body-md" className="text-surface-fg-muted">
            No components match "{query}".
          </Text>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-04">
          {filtered.map((item) => (
            <li key={`${item.layer}/${item.slug}`}>
              <Link
                href={item.storybookUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col gap-ds-03 h-full p-ds-05 rounded-ds-md border border-surface-border-subtle bg-surface-raised hover:border-surface-border hover:bg-surface-raised-hover transition-colors duration-fast-01 group"
              >
                <div className="flex items-start justify-between gap-ds-03">
                  <Text variant="heading-sm" className="text-surface-fg">
                    {item.name}
                  </Text>
                  <IconArrowUpRight
                    size={16}
                    className="text-surface-fg-subtle group-hover:text-surface-fg transition-colors duration-fast-01 shrink-0 mt-1"
                  />
                </div>
                <code className="text-ds-xs font-mono text-surface-fg-muted truncate">{item.importPath}</code>
                <div className="flex flex-wrap items-center gap-ds-02 mt-auto">
                  <span className="inline-flex items-center px-ds-02 py-[1px] rounded-ds-sm bg-surface-overlay text-ds-xs text-surface-fg-muted font-mono">
                    {item.layer}
                  </span>
                  {item.serverSafe && (
                    <span className="inline-flex items-center px-ds-02 py-[1px] rounded-ds-sm bg-success-3 text-success-11 text-ds-xs font-mono">
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
      )}
    </div>
  )
}
