'use client'

import * as React from 'react'
import { IconLayoutGrid, IconLayoutList, IconTable } from '@tabler/icons-react'
import { SegmentedControl } from '@devalok/shilp-sutra/ui/segmented-control'

export function SegmentedControlHero() {
  const [view, setView] = React.useState('board')
  return (
    <SegmentedControl
      options={[
        { id: 'board', text: 'Board' },
        { id: 'list', text: 'List' },
        { id: 'table', text: 'Table' },
      ]}
      value={view}
      onValueChange={setView}
    />
  )
}

export function SegmentedControlVariants() {
  const [size, setSize] = React.useState('week')
  const [variant, setVariant] = React.useState('all')
  const [icon, setIcon] = React.useState('grid')

  const rangeOptions = [
    { id: 'day', text: 'Day' },
    { id: 'week', text: 'Week' },
    { id: 'month', text: 'Month' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-06">
      <Block title="size">
        <SegmentedControl size="sm" options={rangeOptions} value={size} onValueChange={setSize} />
        <SegmentedControl size="md" options={rangeOptions} value={size} onValueChange={setSize} />
        <SegmentedControl size="lg" options={rangeOptions} value={size} onValueChange={setSize} />
      </Block>

      <Block title="variant">
        <SegmentedControl
          variant="soft"
          options={[
            { id: 'all', text: 'All' },
            { id: 'mine', text: 'Mine' },
          ]}
          value={variant}
          onValueChange={setVariant}
        />
        <SegmentedControl
          variant="solid"
          options={[
            { id: 'all', text: 'All' },
            { id: 'mine', text: 'Mine' },
          ]}
          value={variant}
          onValueChange={setVariant}
        />
      </Block>

      <Block title="icon-only (ariaLabel)">
        <SegmentedControl
          options={[
            { id: 'grid', icon: IconLayoutGrid, ariaLabel: 'Grid view' },
            { id: 'list', icon: IconLayoutList, ariaLabel: 'List view' },
            { id: 'table', icon: IconTable, ariaLabel: 'Table view' },
          ]}
          value={icon}
          onValueChange={setIcon}
        />
      </Block>

      <Block title="fullWidth">
        <SegmentedControl fullWidth options={rangeOptions} value={size} onValueChange={setSize} />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 p-ds-05 rounded-control border border-surface-border-subtle bg-surface-raised">
      <span className="text-ds-xs font-mono text-surface-fg-subtle">{title}</span>
      <div className="flex flex-col items-start gap-ds-04">{children}</div>
    </div>
  )
}
