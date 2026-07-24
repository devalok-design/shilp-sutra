'use client'

import * as React from 'react'
import { SearchInput } from '@devalok/shilp-sutra/ui/search-input'

export function SearchInputHero() {
  const [query, setQuery] = React.useState('devalok studio')
  return (
    <div className="w-full max-w-sm">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search projects…"
      />
    </div>
  )
}

export function SearchInputVariants() {
  const [xs, setXs] = React.useState('')
  const [sm, setSm] = React.useState('')
  const [md, setMd] = React.useState('')
  const [lg, setLg] = React.useState('')
  const [clearable, setClearable] = React.useState('Clear me')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <SearchInput size="xs" value={xs} onChange={(e) => setXs(e.target.value)} onClear={() => setXs('')} placeholder="Extra small" />
        <SearchInput size="sm" value={sm} onChange={(e) => setSm(e.target.value)} onClear={() => setSm('')} placeholder="Small" />
        <SearchInput size="md" value={md} onChange={(e) => setMd(e.target.value)} onClear={() => setMd('')} placeholder="Medium" />
        <SearchInput size="lg" value={lg} onChange={(e) => setLg(e.target.value)} onClear={() => setLg('')} placeholder="Large" />
      </Block>

      <Block title="clearable">
        <SearchInput value={clearable} onChange={(e) => setClearable(e.target.value)} onClear={() => setClearable('')} placeholder="Type to search…" />
      </Block>

      <Block title="loading">
        <SearchInput value="Searching…" onChange={() => {}} loading placeholder="Search clients…" />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
