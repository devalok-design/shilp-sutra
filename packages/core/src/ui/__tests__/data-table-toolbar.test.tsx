import { type ColumnDef, getCoreRowModel, getFilteredRowModel,useReactTable } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DataTableToolbar, type Density } from '../data-table-toolbar'

// ── Fixture: a thin wrapper that creates a real table instance ──

interface Item {
  name: string
  status: string
}

const columns: ColumnDef<Item, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
]

const data: Item[] = [
  { name: 'Alpha', status: 'Active' },
  { name: 'Beta', status: 'Inactive' },
]

function ToolbarHarness({
  globalFilter = false,
  enableExport = true,
  density: initialDensity = 'standard' as Density,
}: {
  globalFilter?: boolean
  enableExport?: boolean
  density?: Density
}) {
  const [globalFilterValue, setGlobalFilterValue] = React.useState('')
  const [density, setDensity] = React.useState<Density>(initialDensity)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <DataTableToolbar
      table={table}
      globalFilter={globalFilter}
      globalFilterValue={globalFilterValue}
      onGlobalFilterChange={setGlobalFilterValue}
      density={density}
      onDensityChange={setDensity}
      enableExport={enableExport}
    />
  )
}

describe('DataTableToolbar', () => {
  it('renders density button', () => {
    render(<ToolbarHarness />)
    expect(screen.getByLabelText(/Table density/)).toBeInTheDocument()
  })

  it('renders export button when enableExport is true', () => {
    render(<ToolbarHarness enableExport />)
    expect(screen.getByLabelText('Export table as CSV')).toBeInTheDocument()
  })

  it('hides export button when enableExport is false', () => {
    render(<ToolbarHarness enableExport={false} />)
    expect(screen.queryByLabelText('Export table as CSV')).not.toBeInTheDocument()
  })

  it('renders global search input when globalFilter is true', () => {
    render(<ToolbarHarness globalFilter />)
    expect(screen.getByLabelText('Search all columns')).toBeInTheDocument()
  })

  it('hides global search input when globalFilter is false', () => {
    render(<ToolbarHarness globalFilter={false} />)
    expect(screen.queryByLabelText('Search all columns')).not.toBeInTheDocument()
  })

  it('cycles density on button click', async () => {
    const user = userEvent.setup()
    render(<ToolbarHarness density="standard" />)

    expect(screen.getByLabelText(/Table density: Standard/)).toBeInTheDocument()

    await user.click(screen.getByLabelText(/Table density: Standard/))
    expect(screen.getByLabelText(/Table density: Comfortable/)).toBeInTheDocument()

    await user.click(screen.getByLabelText(/Table density: Comfortable/))
    expect(screen.getByLabelText(/Table density: Compact/)).toBeInTheDocument()
  })

  it('renders column visibility button', () => {
    render(<ToolbarHarness />)
    expect(screen.getByLabelText('Toggle column visibility')).toBeInTheDocument()
  })
})
