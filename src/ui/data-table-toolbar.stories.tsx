import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from './badge'

/**
 * DataTableToolbar is rendered via the DataTable component's `toolbar` prop.
 * These stories demonstrate toolbar features through the parent DataTable,
 * which is how the toolbar is used in practice.
 */

type Employee = {
  id: string
  name: string
  department: string
  role: string
  status: 'active' | 'on-leave' | 'inactive'
}

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'department',
    header: 'Department',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant =
        status === 'active'
          ? 'success'
          : status === 'on-leave'
            ? 'warning'
            : 'neutral'
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      )
    },
  },
]

const data: Employee[] = [
  { id: 'EMP-001', name: 'Aisha Patel', department: 'Engineering', role: 'Tech Lead', status: 'active' },
  { id: 'EMP-002', name: 'Rahul Sharma', department: 'Design', role: 'Senior Designer', status: 'active' },
  { id: 'EMP-003', name: 'Priya Singh', department: 'Engineering', role: 'Developer', status: 'on-leave' },
  { id: 'EMP-004', name: 'Vikram Reddy', department: 'Product', role: 'Product Manager', status: 'active' },
  { id: 'EMP-005', name: 'Neha Gupta', department: 'Engineering', role: 'Developer', status: 'inactive' },
  { id: 'EMP-006', name: 'Arjun Malhotra', department: 'Design', role: 'UX Researcher', status: 'active' },
  { id: 'EMP-007', name: 'Deepa Nair', department: 'Engineering', role: 'QA Engineer', status: 'active' },
  { id: 'EMP-008', name: 'Karan Joshi', department: 'Product', role: 'Analyst', status: 'on-leave' },
]

const meta: Meta = {
  title: 'UI/Data Display/DataTableToolbar',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      toolbar
      density="standard"
    />
  ),
}

export const WithGlobalSearch: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      toolbar
      globalFilter
      density="standard"
    />
  ),
}

export const CompactDensity: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      toolbar
      density="compact"
    />
  ),
}

export const ComfortableDensity: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      toolbar
      density="comfortable"
    />
  ),
}

export const WithSortingAndFiltering: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      toolbar
      sortable
      filterable
      globalFilter
      density="standard"
    />
  ),
}

export const WithPagination: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={data}
      toolbar
      globalFilter
      sortable
      paginated
      pageSize={4}
      density="standard"
    />
  ),
}

function FullFeaturedToolbarDemo() {
  const [selected, setSelected] = useState<Employee[]>([])

  return (
    <div className="space-y-ds-04">
      <p className="text-[length:var(--font-size-sm)] text-text-secondary">
        {selected.length} of {data.length} row(s) selected
      </p>
      <DataTable
        columns={columns}
        data={data}
        toolbar
        sortable
        filterable
        globalFilter
        paginated
        pageSize={5}
        selectable
        onSelectionChange={setSelected}
        density="standard"
      />
    </div>
  )
}

export const FullFeatured: Story = {
  render: () => <FullFeaturedToolbarDemo />,
}

export const AllDensities: Story = {
  render: () => (
    <div className="space-y-ds-08">
      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Compact
        </span>
        <DataTable
          columns={columns}
          data={data.slice(0, 3)}
          toolbar
          density="compact"
        />
      </div>
      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Standard
        </span>
        <DataTable
          columns={columns}
          data={data.slice(0, 3)}
          toolbar
          density="standard"
        />
      </div>
      <div className="space-y-ds-03">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-secondary">
          Comfortable
        </span>
        <DataTable
          columns={columns}
          data={data.slice(0, 3)}
          toolbar
          density="comfortable"
        />
      </div>
    </div>
  ),
}
