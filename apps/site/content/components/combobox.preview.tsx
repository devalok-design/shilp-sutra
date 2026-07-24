'use client'

import * as React from 'react'
import {
  Combobox,
  type ComboboxOption,
} from '@devalok/shilp-sutra/ui/combobox'

const countries: ComboboxOption[] = [
  { value: 'in', label: 'India' },
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
  { value: 'br', label: 'Brazil' },
]

const tags: ComboboxOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'research', label: 'Research' },
  { value: 'ops', label: 'Operations' },
  { value: 'marketing', label: 'Marketing' },
]

export function ComboboxHero() {
  const [value, setValue] = React.useState('in')
  return (
    <div className="w-full max-w-xs">
      <Combobox
        options={countries}
        value={value}
        onValueChange={setValue}
        placeholder="Select country"
        searchPlaceholder="Search countries…"
      />
    </div>
  )
}

export function ComboboxVariants() {
  const [single, setSingle] = React.useState('design')
  const [multi, setMulti] = React.useState<string[]>(['design', 'engineering'])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="single-select">
        <Combobox
          options={tags}
          value={single}
          onValueChange={setSingle}
          placeholder="Select a team"
        />
      </Block>

      <Block title="multiple (pills + overflow)">
        <Combobox
          multiple
          options={tags}
          value={multi}
          onValueChange={setMulti}
          placeholder="Select teams…"
        />
      </Block>

      <Block title="size">
        <Combobox size="xs" options={tags} onValueChange={() => {}} placeholder="Extra small" />
        <Combobox size="sm" options={tags} onValueChange={() => {}} placeholder="Small" />
        <Combobox size="md" options={tags} onValueChange={() => {}} placeholder="Medium" />
        <Combobox size="lg" options={tags} onValueChange={() => {}} placeholder="Large" />
      </Block>

      <Block title="disabled">
        <Combobox disabled options={tags} onValueChange={() => {}} placeholder="Disabled" />
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
