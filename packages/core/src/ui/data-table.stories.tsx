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
      const variant = status === 'done' ? 'success' : status === 'in-progress' ? 'info' : 'neutral'
      return <Badge color={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      const variant = priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'neutral'
      return <Badge color={variant}>{priority}</Badge>
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
  parameters: {
    docs: {
      description: {
        component: '**Barrel-isolated** — import via `import { DataTable } from "@devalok/shilp-sutra/ui/data-table"` (not available from the main `ui` barrel).',
      },
    },
  },
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
      <p className="text-ds-sm text-surface-fg-muted">
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
      <p className="text-ds-sm text-surface-fg-muted">
        Double-click a cell to edit. ID column is read-only.
      </p>
      {lastEdit && (
        <p className="text-ds-sm text-accent-11 font-medium">
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
      <p className="text-ds-sm text-surface-fg-muted">
        Click the chevron to expand a row and see its detail panel.
      </p>
      <DataTable
        columns={columns}
        data={filterData}
        expandable
        renderExpanded={(row) => (
          <div className="space-y-ds-02">
            <h4 className="text-ds-md font-semibold text-surface-fg">
              {row.title}
            </h4>
            <dl className="grid grid-cols-[auto_1fr] gap-x-ds-04 gap-y-ds-02 text-ds-sm">
              <dt className="text-surface-fg-muted font-medium">ID:</dt>
              <dd className="text-surface-fg">{row.id}</dd>
              <dt className="text-surface-fg-muted font-medium">Status:</dt>
              <dd className="text-surface-fg">{row.status}</dd>
              <dt className="text-surface-fg-muted font-medium">Priority:</dt>
              <dd className="text-surface-fg">{row.priority}</dd>
              <dt className="text-surface-fg-muted font-medium">Description:</dt>
              <dd className="text-surface-fg">
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
      <p className="text-ds-sm text-surface-fg-muted">
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
      <p className="text-ds-sm text-surface-fg-muted">
        All features enabled: sorting, filtering, pagination, selection, toolbar,
        density, editable cells, and expandable rows.
      </p>
      <div className="flex gap-ds-04 text-ds-sm text-surface-fg-muted">
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
          <div className="text-ds-sm text-surface-fg">
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

// --- Time Off Calendar (Karm Demo) ---

type TimeOffRow = { name: string } & Record<string, string | undefined>

const timeOffEmployees = [
  'Aisha Patel',
  'Rahul Sharma',
  'Priya Singh',
  'Vikram Reddy',
  'Neha Gupta',
  'Arjun Malhotra',
  'Deepa Nair',
  'Karan Joshi',
]

/**
 * Seed-based pseudo-random number generator so the story renders
 * the same leave pattern on every mount (no flicker on HMR).
 */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildTimeOffColumns(): ColumnDef<TimeOffRow>[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayColumns: ColumnDef<TimeOffRow>[] = Array.from(
    { length: daysInMonth },
    (_, i) => {
      const date = new Date(year, month, i + 1)
      const dayKey = formatDate(date)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6

      return {
        accessorKey: dayKey,
        header: String(i + 1),
        cell: ({ row }) => {
          const status = row.getValue(dayKey) as string | undefined
          if (!status) {
            return isWeekend ? (
              <span className="text-disabled">&mdash;</span>
            ) : null
          }
          const color = {
            approved: 'success' as const,
            pending: 'warning' as const,
            rejected: 'error' as const,
            holiday: 'info' as const,
          }[status]
          return (
            <Badge color={color} size="sm">
              {status[0].toUpperCase()}
            </Badge>
          )
        },
        enableSorting: false,
        enableColumnFilter: false,
        size: 40,
      }
    },
  )

  return [
    {
      accessorKey: 'name',
      header: 'Employee',
      enableSorting: false,
      size: 160,
    },
    ...dayColumns,
  ]
}

function generateTimeOffData(): TimeOffRow[] {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const rand = seededRandom(42)
  const statuses = ['approved', 'pending', 'rejected'] as const

  return timeOffEmployees.map((name) => {
    const row: TimeOffRow = { name }
    const leaveCount = Math.floor(rand() * 5) + 2
    for (let i = 0; i < leaveCount; i++) {
      const dayIdx = Math.floor(rand() * daysInMonth)
      const date = new Date(year, month, dayIdx + 1)
      row[formatDate(date)] = statuses[Math.floor(rand() * statuses.length)]
    }
    // Common holiday on the 15th
    row[formatDate(new Date(year, month, 15))] = 'holiday'
    return row
  })
}

const timeOffColumns = buildTimeOffColumns()
const timeOffData = generateTimeOffData()

/** Karm-style time-off / leave calendar view. */
export const TimeOffCalendar: Story = {
  render: () => (
    <div className="max-w-[900px]">
      <DataTable
        columns={timeOffColumns}
        data={timeOffData}
        toolbar
        density="compact"
        columnPinning={{ left: ['name'] }}
      />
    </div>
  ),
}

// --- Loading State ---

export const Loading: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      loading
      paginated
      pageSize={5}
    />
  ),
}

// --- Empty State ---

export const EmptyState: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyState={
        <div className="flex flex-col items-center gap-ds-03 py-ds-07">
          <span className="text-ds-lg text-surface-fg-subtle">No projects found</span>
          <span className="text-ds-sm text-surface-fg-subtle">Create your first project to get started.</span>
        </div>
      }
    />
  ),
}

// --- Server-Side Pagination ---

function ServerSidePaginationDemo() {
  const [page, setPage] = useState(1)
  const pageSize = 3
  const total = filterData.length
  const pageData = filterData.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Server-side pagination — page {page} of {Math.ceil(total / pageSize)}, {total} total rows.
      </p>
      <DataTable
        columns={columns}
        data={pageData}
        pagination={{ page, pageSize, total, onPageChange: setPage }}
        getRowId={(row) => row.id}
      />
    </div>
  )
}

export const ServerSidePagination: Story = {
  render: () => <ServerSidePaginationDemo />,
}

// --- Server-Side Sort ---

function ServerSideSortDemo() {
  const [sortedData, setSortedData] = useState([...filterData])

  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Server-side sorting — onSort callback handles the sort, no client-side sort model.
      </p>
      <DataTable
        columns={columns}
        data={sortedData}
        sortable
        onSort={(key, direction) => {
          if (!direction) {
            setSortedData([...filterData])
            return
          }
          const sorted = [...filterData].sort((a, b) => {
            const aVal = String((a as Record<string, unknown>)[key] ?? '')
            const bVal = String((b as Record<string, unknown>)[key] ?? '')
            return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
          })
          setSortedData(sorted)
        }}
        getRowId={(row) => row.id}
      />
    </div>
  )
}

export const ServerSideSort: Story = {
  render: () => <ServerSideSortDemo />,
}

// --- Controlled Selection ---

function ControlledSelectionDemo() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(['TASK-001', 'TASK-003']))

  return (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Selected: {selectedIds.size === 0 ? 'none' : Array.from(selectedIds).join(', ')}
      </p>
      <DataTable
        columns={columns}
        data={filterData}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={(rows) => setSelectedIds(new Set(rows.map((r) => r.id)))}
        getRowId={(row) => row.id}
      />
    </div>
  )
}

export const ControlledSelection: Story = {
  render: () => <ControlledSelectionDemo />,
}

// --- Bulk Actions ---

export const BulkActions: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      selectable
      getRowId={(row) => row.id}
      bulkActions={[
        { label: 'Archive', onClick: (rows) => alert(`Archive ${rows.length} rows`) },
        { label: 'Add Label', onClick: (rows) => alert(`Label ${rows.length} rows`) },
        { label: 'Delete', onClick: (rows) => alert(`Delete ${rows.length} rows`), color: 'error' },
      ]}
    />
  ),
}

// --- Sticky Header ---

export const StickyHeader: Story = {
  render: () => (
    <div style={{ maxHeight: 300, overflow: 'auto' }}>
      <DataTable
        columns={columns}
        data={largeData.slice(0, 30)}
        stickyHeader
        sortable
      />
    </div>
  ),
}

// --- Single Expand ---

export const SingleExpand: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={filterData}
      expandable
      singleExpand
      getRowId={(row) => row.id}
      renderExpanded={(row) => (
        <div className="text-ds-sm space-y-ds-02">
          <p><strong>Task:</strong> {row.title}</p>
          <p><strong>Status:</strong> {row.status}</p>
          <p><strong>Priority:</strong> {row.priority}</p>
          <p>Only one row can be expanded at a time.</p>
        </div>
      )}
    />
  ),
}

// --- OnRowClick ---

export const OnRowClick: Story = {
  render: () => (
    <div className="space-y-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Click a row to see the alert. Interactive elements (checkboxes, buttons) do not trigger the row click.
      </p>
      <DataTable
        columns={columns}
        data={filterData}
        getRowId={(row) => row.id}
        onRowClick={(row) => alert(`Clicked: ${row.title}`)}
      />
    </div>
  ),
}
