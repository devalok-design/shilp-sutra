import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DataTable } from './data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from './badge'

type Task = {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant = status === 'done' ? 'green' : status === 'in-progress' ? 'blue' : 'neutral'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      const variant = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'neutral'
      return <Badge variant={variant}>{priority}</Badge>
    },
  },
]

const data: Task[] = [
  { id: 'TASK-001', title: 'Design system tokens', status: 'done', priority: 'high' },
  { id: 'TASK-002', title: 'Component extraction', status: 'in-progress', priority: 'high' },
  { id: 'TASK-003', title: 'Storybook setup', status: 'in-progress', priority: 'medium' },
  { id: 'TASK-004', title: 'Write unit tests', status: 'todo', priority: 'medium' },
  { id: 'TASK-005', title: 'Documentation', status: 'todo', priority: 'low' },
]

const meta: Meta<typeof DataTable> = {
  title: 'UI/Data Display/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  render: () => <DataTable columns={columns} data={data} />,
}

export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} />,
}

export const CustomNoResults: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      noResultsText="No tasks match your filter criteria."
    />
  ),
}

export const SingleRow: Story = {
  render: () => <DataTable columns={columns} data={[data[0]]} />,
}

export const Sortable: Story = {
  render: () => <DataTable columns={columns} data={data} sortable />,
}

const filterData: Task[] = [
  { id: 'TASK-001', title: 'Design system tokens', status: 'done', priority: 'high' },
  { id: 'TASK-002', title: 'Component extraction', status: 'in-progress', priority: 'high' },
  { id: 'TASK-003', title: 'Storybook setup', status: 'in-progress', priority: 'medium' },
  { id: 'TASK-004', title: 'Write unit tests', status: 'todo', priority: 'medium' },
  { id: 'TASK-005', title: 'Documentation', status: 'todo', priority: 'low' },
  { id: 'TASK-006', title: 'Accessibility audit', status: 'in-progress', priority: 'high' },
  { id: 'TASK-007', title: 'Deploy pipeline', status: 'done', priority: 'medium' },
  { id: 'TASK-008', title: 'Dark mode support', status: 'todo', priority: 'high' },
  { id: 'TASK-009', title: 'Performance optimization', status: 'in-progress', priority: 'medium' },
  { id: 'TASK-010', title: 'Release v1.0', status: 'todo', priority: 'low' },
]

export const Filterable: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      sortable
      filterable
      globalFilter
    />
  ),
}

export const Paginated: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      paginated
      pageSize={3}
    />
  ),
}

const largeData: Task[] = Array.from({ length: 50 }, (_, i) => ({
  id: `TASK-${String(i + 1).padStart(3, '0')}`,
  title: `Task item ${i + 1}`,
  status: (['todo', 'in-progress', 'done'] as const)[i % 3],
  priority: (['low', 'medium', 'high'] as const)[i % 3],
}))

export const PaginatedLargeDataset: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={largeData}
      sortable
      paginated
      pageSize={10}
      pageSizeOptions={[5, 10, 25, 50]}
    />
  ),
}

function SelectableDemo() {
  const [selected, setSelected] = useState<Task[]>([])

  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-[var(--color-text-secondary)]">
        {selected.length} of {filterData.length} row(s) selected
      </p>
      <DataTable
        columns={columns}
        data={filterData}
        selectable
        onSelectionChange={setSelected}
      />
    </div>
  )
}

export const Selectable: Story = {
  render: () => <SelectableDemo />,
}

export const WithToolbar: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      sortable
      filterable
      globalFilter
      paginated
      selectable
      toolbar
      density="standard"
    />
  ),
}

export const CompactDensity: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      density="compact"
      toolbar
    />
  ),
}

export const ComfortableDensity: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      density="comfortable"
      toolbar
    />
  ),
}

export const WithColumnPinning: Story = {
  render: () => (
    <div className="max-w-[500px] overflow-auto">
      <DataTable
        columns={columns}
        data={filterData}
        toolbar
        columnPinning={{ left: ['id'], right: ['priority'] }}
      />
    </div>
  ),
}

// --- Cell Editing ---

/** Editable columns — ID is not editable, rest are */
const editableColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    meta: { enableEditing: false },
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
]

function EditableDemo() {
  const [tableData, setTableData] = useState<Task[]>([...filterData])
  const [lastEdit, setLastEdit] = useState<string>('')

  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-[var(--color-text-secondary)]">
        Double-click a cell to edit. ID column is read-only.
      </p>
      {lastEdit && (
        <p className="text-ds-sm text-[var(--color-text-brand)] font-medium">
          Last edit: {lastEdit}
        </p>
      )}
      <DataTable
        columns={editableColumns}
        data={tableData}
        editable
        onCellEdit={(rowIndex, columnId, value) => {
          setLastEdit(`Row ${rowIndex}, column "${columnId}" => "${String(value)}"`)
          setTableData((prev) => {
            const next = [...prev]
            next[rowIndex] = { ...next[rowIndex], [columnId]: value } as Task
            return next
          })
        }}
      />
    </div>
  )
}

export const Editable: Story = {
  render: () => <EditableDemo />,
}

// --- Row Expansion ---

function ExpandableDemo() {
  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-[var(--color-text-secondary)]">
        Click the chevron to expand a row and see its detail panel.
      </p>
      <DataTable
        columns={columns}
        data={filterData}
        expandable
        renderExpanded={(row) => (
          <div className="space-y-ds-02">
            <h4 className="text-ds-md font-semibold text-[var(--color-text-primary)]">
              {row.title}
            </h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-ds-04 gap-y-ds-02 text-ds-sm">
              <dt className="text-[var(--color-text-secondary)] font-medium">ID:</dt>
              <dd className="text-[var(--color-text-primary)]">{row.id}</dd>
              <dt className="text-[var(--color-text-secondary)] font-medium">Status:</dt>
              <dd className="text-[var(--color-text-primary)]">{row.status}</dd>
              <dt className="text-[var(--color-text-secondary)] font-medium">Priority:</dt>
              <dd className="text-[var(--color-text-primary)]">{row.priority}</dd>
              <dt className="text-[var(--color-text-secondary)] font-medium">Description:</dt>
              <dd className="text-[var(--color-text-primary)]">
                This is a detailed description of {row.title.toLowerCase()}.
                It contains additional context that does not fit in the main table row.
              </dd>
            </dl>
          </div>
        )}
      />
    </div>
  )
}

export const Expandable: Story = {
  render: () => <ExpandableDemo />,
}

// --- Virtualized Large Dataset ---

const hugeData: Task[] = Array.from({ length: 10000 }, (_, i) => ({
  id: `TASK-${String(i + 1).padStart(5, '0')}`,
  title: `Task item ${i + 1}`,
  status: (['todo', 'in-progress', 'done'] as const)[i % 3],
  priority: (['low', 'medium', 'high'] as const)[i % 3],
}))

/** Plain text columns for virtualized table (no Badge for performance) */
const plainColumns: ColumnDef<Task>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'priority', header: 'Priority' },
]

export const VirtualizedLargeDataset: Story = {
  render: () => (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-[var(--color-text-secondary)]">
        10,000 rows rendered with virtualization. Scroll to see smooth performance.
      </p>
      <DataTable
        columns={plainColumns}
        data={hugeData}
        virtualRows
        virtualRowHeight={48}
        maxHeight={600}
        sortable
      />
    </div>
  ),
}

// --- Full Featured ---

function FullFeaturedDemo() {
  const [tableData, setTableData] = useState<Task[]>([...filterData])
  const [selected, setSelected] = useState<Task[]>([])
  const [lastEdit, setLastEdit] = useState<string>('')

  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-[var(--color-text-secondary)]">
        All features enabled: sorting, filtering, pagination, selection, toolbar,
        density, editable cells, and expandable rows.
      </p>
      <div className="flex gap-ds-04 text-ds-sm text-[var(--color-text-secondary)]">
        <span>{selected.length} selected</span>
        {lastEdit && <span>Last edit: {lastEdit}</span>}
      </div>
      <DataTable
        columns={editableColumns}
        data={tableData}
        sortable
        filterable
        globalFilter
        paginated
        pageSize={5}
        selectable
        onSelectionChange={setSelected}
        toolbar
        density="standard"
        editable
        onCellEdit={(rowIndex, columnId, value) => {
          setLastEdit(`[${rowIndex}].${columnId} = "${String(value)}"`)
          setTableData((prev) => {
            const next = [...prev]
            next[rowIndex] = { ...next[rowIndex], [columnId]: value } as Task
            return next
          })
        }}
        expandable
        renderExpanded={(row) => (
          <div className="text-ds-sm text-[var(--color-text-primary)]">
            <strong>Detail panel for {row.id}:</strong> {row.title} — Status: {row.status}, Priority: {row.priority}
          </div>
        )}
      />
    </div>
  )
}

export const FullFeatured: Story = {
  render: () => <FullFeaturedDemo />,
}
