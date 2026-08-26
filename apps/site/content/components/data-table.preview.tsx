'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { DataTable } from '@devalok/shilp-sutra/ui/data-table'

type Row = {
  name: string
  owner: string
  status: 'active' | 'review' | 'draft'
  hours: number
}

const DATA: Row[] = [
  { name: 'Orbit redesign', owner: 'Aisha Kapoor', status: 'active', hours: 128 },
  { name: 'Karm mobile app', owner: 'Ben Carter', status: 'review', hours: 64 },
  { name: 'Setu brand kit', owner: 'Chen Wei', status: 'draft', hours: 12 },
  { name: 'Docs revamp', owner: 'Diego Alvarez', status: 'active', hours: 47 },
  { name: 'Billing v2', owner: 'Erin Shah', status: 'review', hours: 89 },
]

const STATUS: Record<Row['status'], { label: string; color: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Active', color: 'success' },
  review: { label: 'Review', color: 'warning' },
  draft: { label: 'Draft', color: 'neutral' },
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Project', enableSorting: true },
  { accessorKey: 'owner', header: 'Owner', enableSorting: true },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: { original: Row } }) => {
      const s = STATUS[row.original.status]
      return (
        <Badge variant="soft" color={s.color} size="sm">
          {s.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'hours',
    header: 'Hours',
    enableSorting: true,
    cell: ({ row }: { row: { original: Row } }) => (
      <span className="tabular-nums text-surface-fg-muted">{row.original.hours}</span>
    ),
  },
]

export function DataTableHero() {
  return <DataTable columns={columns} data={DATA} sortable />
}

export function DataTableVariants() {
  const [selected, setSelected] = useState<Row[]>([])
  return (
    <div className="flex flex-col gap-ds-06">
      <Block title="toolbar + global filter">
        <DataTable columns={columns} data={DATA} sortable globalFilter toolbar />
      </Block>
      <Block title={`selectable + paginated · ${selected.length} selected`}>
        <DataTable
          columns={columns}
          data={DATA}
          sortable
          selectable
          paginated
          pageSize={3}
          onSelectionChange={setSelected}
        />
      </Block>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel p-ds-05">
      <span className="font-mono text-ds-xs text-surface-fg-subtle">{title}</span>
      {children}
    </div>
  )
}
