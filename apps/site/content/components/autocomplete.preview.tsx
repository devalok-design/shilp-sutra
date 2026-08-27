'use client'

import * as React from 'react'
import { Autocomplete, type AutocompleteOption } from '@devalok/shilp-sutra/ui/autocomplete'

const CITIES: AutocompleteOption[] = [
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'bengaluru', label: 'Bengaluru' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'kolkata', label: 'Kolkata' },
  { value: 'hyderabad', label: 'Hyderabad' },
]

export function AutocompleteHero() {
  const [city, setCity] = React.useState<AutocompleteOption | null>(null)

  return (
    <div className="w-full max-w-xs">
      <Autocomplete
        options={CITIES}
        value={city}
        onValueChange={setCity}
        placeholder="Search cities…"
      />
    </div>
  )
}

export function AutocompleteVariants() {
  const [picked, setPicked] = React.useState<AutocompleteOption | null>(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="custom emptyText">
        <Autocomplete
          options={CITIES}
          onValueChange={setPicked}
          emptyText="No matching cities"
          placeholder="Type to filter…"
        />
      </Block>

      <Block title="disabled">
        <Autocomplete
          options={CITIES}
          value={{ value: 'delhi', label: 'Delhi' }}
          disabled
          placeholder="Search cities…"
        />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-panel">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col gap-ds-02">{children}</div>
    </div>
  )
}
