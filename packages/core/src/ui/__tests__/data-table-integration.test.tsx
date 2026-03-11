import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../data-table'

// ============================================================
// Fixtures
// ============================================================

interface Person {
  id?: string
  name: string
  email: string
  role: string
  age: number
}

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'age', header: 'Age' },
]

const data: Person[] = [
  { name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer', age: 28 },
  { name: 'Bob Jones', email: 'bob@example.com', role: 'Designer', age: 34 },
  { name: 'Carol White', email: 'carol@example.com', role: 'Manager', age: 42 },
  { name: 'Dave Brown', email: 'dave@example.com', role: 'Engineer', age: 25 },
]

const dataWithIds: Person[] = [
  { id: 'a1', name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer', age: 28 },
  { id: 'b2', name: 'Bob Jones', email: 'bob@example.com', role: 'Designer', age: 34 },
  { id: 'c3', name: 'Carol White', email: 'carol@example.com', role: 'Manager', age: 42 },
  { id: 'd4', name: 'Dave Brown', email: 'dave@example.com', role: 'Engineer', age: 25 },
]

// ============================================================
// Tests
// ============================================================

describe('DataTable + Toolbar — integration', () => {
  it('has no a11y violations with toolbar enabled', async () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        globalFilter
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders table headers and all data rows', () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()
    expect(screen.getByText('Dave Brown')).toBeInTheDocument()
  })

  it('renders toolbar controls: global search, columns button, density button, export button', () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)

    expect(screen.getByLabelText('Search all columns')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle column visibility')).toBeInTheDocument()
    expect(screen.getByLabelText(/Table density/)).toBeInTheDocument()
    expect(screen.getByLabelText('Export table as CSV')).toBeInTheDocument()
  })

  it('global search filters rows by matching text', async () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)
    const user = userEvent.setup()

    const searchInput = screen.getByLabelText('Search all columns')
    await user.type(searchInput, 'Alice')

    // Only Alice should remain
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
    expect(screen.queryByText('Dave Brown')).not.toBeInTheDocument()
  })

  it('global search is case-insensitive', async () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)
    const user = userEvent.setup()

    const searchInput = screen.getByLabelText('Search all columns')
    await user.type(searchInput, 'engineer')

    // Alice and Dave are Engineers
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Dave Brown')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
  })

  it('global search shows no results text when nothing matches', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        globalFilter
        noResultsText="Nothing found."
      />,
    )
    const user = userEvent.setup()

    const searchInput = screen.getByLabelText('Search all columns')
    await user.type(searchInput, 'zzzznonexistent')

    expect(screen.getByText('Nothing found.')).toBeInTheDocument()
  })

  it('density toggle cycles through compact, standard, comfortable', async () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)
    const user = userEvent.setup()

    // Default density is "standard"
    const densityBtn = screen.getByLabelText(/Table density: Standard/)
    expect(densityBtn).toBeInTheDocument()

    // Click to cycle: standard -> comfortable
    await user.click(densityBtn)
    expect(screen.getByLabelText(/Table density: Comfortable/)).toBeInTheDocument()

    // Click to cycle: comfortable -> compact
    await user.click(screen.getByLabelText(/Table density: Comfortable/))
    expect(screen.getByLabelText(/Table density: Compact/)).toBeInTheDocument()

    // Click to cycle: compact -> standard
    await user.click(screen.getByLabelText(/Table density: Compact/))
    expect(screen.getByLabelText(/Table density: Standard/)).toBeInTheDocument()
  })

  it('column visibility dropdown lists toggleable columns', async () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)
    const user = userEvent.setup()

    // Click the "Columns" button to open dropdown
    await user.click(screen.getByLabelText('Toggle column visibility'))

    // Dropdown should list all four column names
    expect(screen.getByText('Toggle columns')).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Email' })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Role' })).toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: 'Age' })).toBeInTheDocument()
  })

  it('toggling a column hides that column from the table', async () => {
    render(<DataTable columns={columns} data={data} toolbar globalFilter />)
    const user = userEvent.setup()

    // Email column should be visible initially
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()

    // Open column visibility dropdown and uncheck Email
    await user.click(screen.getByLabelText('Toggle column visibility'))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Email' }))

    // Email data should be hidden
    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument()
    // Other columns should remain
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('sortable columns show sort buttons in headers', () => {
    render(
      <DataTable columns={columns} data={data} toolbar globalFilter sortable />,
    )
    expect(screen.getByLabelText('Sort by Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort by Email')).toBeInTheDocument()
  })

  it('clicking sort button sorts the table rows', async () => {
    render(
      <DataTable columns={columns} data={data} toolbar globalFilter sortable />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Sort by Name'))

    // After first click, ascending sort — Alice, Bob, Carol, Dave
    const rows = screen.getAllByRole('row')
    // First row is header, second is data
    const firstDataRow = rows[1]
    expect(within(firstDataRow).getByText('Alice Smith')).toBeInTheDocument()
  })

  it('pagination shows page controls when enabled', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        globalFilter
        paginated
        pageSize={2}
      />,
    )

    expect(screen.getByText('4 total rows')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
    expect(screen.getByLabelText('Next page')).toBeEnabled()
  })

  it('pagination navigates between pages', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        globalFilter
        paginated
        pageSize={2}
      />,
    )
    const user = userEvent.setup()

    // Page 1 shows Alice and Bob
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()

    // Navigate to page 2
    await user.click(screen.getByLabelText('Next page'))

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()
    expect(screen.getByText('Dave Brown')).toBeInTheDocument()
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
  })

  it('selectable mode renders row checkboxes', () => {
    render(
      <DataTable columns={columns} data={data} toolbar globalFilter selectable />,
    )
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument()
    const rowCheckboxes = screen.getAllByLabelText('Select row')
    expect(rowCheckboxes).toHaveLength(4)
  })

  it('renders no results message when data is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        toolbar
        globalFilter
        noResultsText="No data available."
      />,
    )
    expect(screen.getByText('No data available.')).toBeInTheDocument()
  })
})

// ============================================================
// Feature 1: Server-side sorting (onSort)
// ============================================================

describe('DataTable — server-side sorting (onSort)', () => {
  it('calls onSort with column key and "asc" on first sort click', async () => {
    const onSort = vi.fn()
    render(
      <DataTable columns={columns} data={data} sortable onSort={onSort} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Sort by Name'))
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
  })

  it('calls onSort with "desc" on second sort click', async () => {
    const onSort = vi.fn()
    render(
      <DataTable columns={columns} data={data} sortable onSort={onSort} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Sort by Name'))
    await user.click(screen.getByLabelText('Sort by Name'))
    expect(onSort).toHaveBeenCalledWith('name', 'desc')
  })

  it('calls onSort with false when sorting is cleared (third click)', async () => {
    const onSort = vi.fn()
    render(
      <DataTable columns={columns} data={data} sortable onSort={onSort} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Sort by Name'))
    await user.click(screen.getByLabelText('Sort by Name'))
    await user.click(screen.getByLabelText('Sort by Name'))
    expect(onSort).toHaveBeenCalledWith('name', false)
  })

  it('does not reorder rows when onSort is provided (manual sorting)', async () => {
    const onSort = vi.fn()
    // Data is Alice, Bob, Carol, Dave (unsorted)
    render(
      <DataTable columns={columns} data={data} sortable onSort={onSort} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Sort by Name'))

    // Rows should remain in original order (server handles reorder)
    const rows = screen.getAllByRole('row')
    // row[0] is header, row[1..4] are data
    expect(within(rows[1]).getByText('Alice Smith')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Bob Jones')).toBeInTheDocument()
    expect(within(rows[3]).getByText('Carol White')).toBeInTheDocument()
    expect(within(rows[4]).getByText('Dave Brown')).toBeInTheDocument()
  })
})

// ============================================================
// Feature 2: emptyState ReactNode slot
// ============================================================

describe('DataTable — emptyState', () => {
  it('renders custom emptyState ReactNode when data is empty', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<div data-testid="custom-empty">No items yet!</div>}
      />,
    )
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    expect(screen.getByText('No items yet!')).toBeInTheDocument()
  })

  it('emptyState takes precedence over noResultsText', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        noResultsText="Fallback text"
        emptyState={<span>Custom empty</span>}
      />,
    )
    expect(screen.getByText('Custom empty')).toBeInTheDocument()
    expect(screen.queryByText('Fallback text')).not.toBeInTheDocument()
  })

  it('does not render emptyState when data is present', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        emptyState={<div data-testid="custom-empty">No items</div>}
      />,
    )
    expect(screen.queryByTestId('custom-empty')).not.toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })
})

// ============================================================
// Feature 3: loading state
// ============================================================

describe('DataTable — loading state', () => {
  it('renders skeleton rows when loading is true', () => {
    render(<DataTable columns={columns} data={[]} loading />)
    // Default skeleton row count = 5 (no pageSize)
    const skeletonElements = document.querySelectorAll('[aria-hidden="true"]')
    // 5 rows * 4 columns = 20 skeleton elements
    expect(skeletonElements.length).toBe(20)
  })

  it('does not render data rows when loading', () => {
    render(<DataTable columns={columns} data={data} loading />)
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
  })

  it('uses pageSize to determine number of skeleton rows', () => {
    render(<DataTable columns={columns} data={[]} loading pageSize={3} />)
    // 3 rows * 4 columns = 12 skeleton elements
    const skeletonElements = document.querySelectorAll('[aria-hidden="true"]')
    expect(skeletonElements.length).toBe(12)
  })

  it('uses server pagination pageSize for skeleton rows', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={[]}
        loading
        pagination={{ page: 1, pageSize: 7, total: 100, onPageChange }}
      />,
    )
    // 7 skeleton rows should be rendered (each row has 4 Skeleton cells)
    const skeletonRows = screen.getAllByRole('row').filter((row) => {
      return row.querySelector('[aria-hidden="true"]') !== null
    })
    expect(skeletonRows).toHaveLength(7)
  })

  it('renders data rows when loading is false', () => {
    render(<DataTable columns={columns} data={data} loading={false} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })
})

// ============================================================
// Feature 4: Controlled selection (selectedIds + selectableFilter)
// ============================================================

describe('DataTable — controlled selection', () => {
  it('syncs rowSelection from selectedIds', () => {
    const selectedIds = new Set(['a1', 'c3'])
    render(
      <DataTable
        columns={columns}
        data={dataWithIds}
        selectable
        selectedIds={selectedIds}
        getRowId={(row) => row.id!}
      />,
    )
    const checkboxes = screen.getAllByLabelText('Select row')
    // Alice (a1) and Carol (c3) should be checked
    expect(checkboxes[0]).toHaveAttribute('data-state', 'checked')
    expect(checkboxes[1]).not.toHaveAttribute('data-state', 'checked')
    expect(checkboxes[2]).toHaveAttribute('data-state', 'checked')
    expect(checkboxes[3]).not.toHaveAttribute('data-state', 'checked')
  })

  it('selectableFilter disables non-selectable rows', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        selectableFilter={(row) => row.role === 'Engineer'}
      />,
    )
    const checkboxes = screen.getAllByLabelText('Select row')
    // Alice (Engineer) - enabled, Bob (Designer) - disabled, Carol (Manager) - disabled, Dave (Engineer) - enabled
    expect(checkboxes[0]).not.toBeDisabled() // Alice
    expect(checkboxes[1]).toBeDisabled() // Bob
    expect(checkboxes[2]).toBeDisabled() // Carol
    expect(checkboxes[3]).not.toBeDisabled() // Dave
  })

  it('onSelectionChange still fires with controlled selection', async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={dataWithIds}
        selectable
        getRowId={(row) => row.id!}
        onSelectionChange={onSelectionChange}
      />,
    )
    const user = userEvent.setup()
    const checkboxes = screen.getAllByLabelText('Select row')

    await user.click(checkboxes[0])
    expect(onSelectionChange).toHaveBeenCalled()
    const lastCall = onSelectionChange.mock.calls[onSelectionChange.mock.calls.length - 1]
    expect(lastCall[0]).toHaveLength(1)
    expect(lastCall[0][0].name).toBe('Alice Smith')
  })
})

// ============================================================
// Feature 5: Server-side pagination
// ============================================================

describe('DataTable — server-side pagination', () => {
  it('shows pagination controls with server-side pagination', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        pagination={{ page: 1, pageSize: 2, total: 4, onPageChange }}
      />,
    )
    expect(screen.getByText('4 total rows')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('calls onPageChange with 1-based page when navigating', async () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        pagination={{ page: 1, pageSize: 2, total: 4, onPageChange }}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Next page'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous page on first page', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        pagination={{ page: 1, pageSize: 2, total: 4, onPageChange }}
      />,
    )
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('disables next page on last page', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data.slice(2, 4)}
        pagination={{ page: 2, pageSize: 2, total: 4, onPageChange }}
      />,
    )
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('shows all server-provided data rows (no client-side slicing)', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ page: 1, pageSize: 2, total: 10, onPageChange }}
      />,
    )
    // All 4 data rows should be visible — server decides what to send
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()
    expect(screen.getByText('Dave Brown')).toBeInTheDocument()
  })
})

// ============================================================
// Feature 6: Single-expand mode
// ============================================================

describe('DataTable — singleExpand', () => {
  const expandColumns: ColumnDef<Person, unknown>[] = [...columns]

  it('only one row is expanded at a time when singleExpand is true', async () => {
    render(
      <DataTable
        columns={expandColumns}
        data={data}
        expandable
        singleExpand
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>{row.email}</div>}
      />,
    )
    const user = userEvent.setup()

    // Expand Alice
    const expandButtons = screen.getAllByLabelText('Expand row')
    await user.click(expandButtons[0])
    expect(screen.getByTestId('detail-Alice Smith')).toBeInTheDocument()

    // Re-query: Alice is now "Collapse row", Bob is the first "Expand row"
    const expandButtonsAfter = screen.getAllByLabelText('Expand row')
    await user.click(expandButtonsAfter[0])
    expect(screen.getByTestId('detail-Bob Jones')).toBeInTheDocument()
    expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument()
  })

  it('collapsing the same row works in singleExpand mode', async () => {
    render(
      <DataTable
        columns={expandColumns}
        data={data}
        expandable
        singleExpand
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>{row.email}</div>}
      />,
    )
    const user = userEvent.setup()

    const expandButtons = screen.getAllByLabelText('Expand row')
    // Expand Alice
    await user.click(expandButtons[0])
    expect(screen.getByTestId('detail-Alice Smith')).toBeInTheDocument()

    // Collapse Alice
    await user.click(screen.getByLabelText('Collapse row'))
    expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument()
  })

  it('multiple rows can expand without singleExpand', async () => {
    render(
      <DataTable
        columns={expandColumns}
        data={data}
        expandable
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>{row.email}</div>}
      />,
    )
    const user = userEvent.setup()

    const expandButtons = screen.getAllByLabelText('Expand row')
    await user.click(expandButtons[0])
    expect(screen.getByTestId('detail-Alice Smith')).toBeInTheDocument()

    // Re-query after first expand — Alice is now "Collapse row"
    const expandButtonsAfter = screen.getAllByLabelText('Expand row')
    await user.click(expandButtonsAfter[0])
    expect(screen.getByTestId('detail-Alice Smith')).toBeInTheDocument()
    expect(screen.getByTestId('detail-Bob Jones')).toBeInTheDocument()
  })
})

// ============================================================
// Feature 7: Sticky header
// ============================================================

describe('DataTable — stickyHeader', () => {
  it('adds sticky classes to TableHeader when stickyHeader is true', () => {
    render(<DataTable columns={columns} data={data} stickyHeader />)
    const thead = document.querySelector('thead')
    expect(thead).toHaveClass('sticky')
    expect(thead).toHaveClass('top-0')
    expect(thead).toHaveClass('z-10')
    expect(thead).toHaveClass('bg-surface')
  })

  it('does not add sticky classes when stickyHeader is false', () => {
    render(<DataTable columns={columns} data={data} />)
    const thead = document.querySelector('thead')
    expect(thead).not.toHaveClass('sticky')
  })
})

// ============================================================
// Feature 8: Row click handler (onRowClick)
// ============================================================

describe('DataTable — onRowClick', () => {
  it('calls onRowClick when a row is clicked', async () => {
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)
    const user = userEvent.setup()

    const rows = screen.getAllByRole('row')
    // rows[0] = header, rows[1] = Alice
    await user.click(within(rows[1]).getByText('Alice Smith'))
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('adds cursor-pointer class when onRowClick is provided', () => {
    render(<DataTable columns={columns} data={data} onRowClick={() => {}} />)
    const rows = screen.getAllByRole('row')
    // Data rows should have cursor-pointer
    expect(rows[1]).toHaveClass('cursor-pointer')
  })

  it('does not fire onRowClick when clicking a checkbox', async () => {
    const onRowClick = vi.fn()
    render(
      <DataTable columns={columns} data={data} selectable onRowClick={onRowClick} />,
    )
    const user = userEvent.setup()

    const checkboxes = screen.getAllByLabelText('Select row')
    await user.click(checkboxes[0])
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('does not fire onRowClick when clicking a button inside a row', async () => {
    const onRowClick = vi.fn()
    const columnsWithButton: ColumnDef<Person, unknown>[] = [
      ...columns,
      {
        id: 'actions',
        cell: () => <button type="button">Edit</button>,
      },
    ]
    render(
      <DataTable columns={columnsWithButton} data={data} onRowClick={onRowClick} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getAllByText('Edit')[0])
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('does not add cursor-pointer when onRowClick is not provided', () => {
    render(<DataTable columns={columns} data={data} />)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).not.toHaveClass('cursor-pointer')
  })
})

// ============================================================
// Feature 9: Bulk action bar
// ============================================================

describe('DataTable — bulkActions', () => {
  it('shows bulk action bar when rows are selected', async () => {
    const deleteAction = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: deleteAction, color: 'error' },
        ]}
      />,
    )
    const user = userEvent.setup()

    // Select first row
    const checkboxes = screen.getAllByLabelText('Select row')
    await user.click(checkboxes[0])

    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('bulk action onClick receives selected rows', async () => {
    const archiveAction = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Archive', onClick: archiveAction },
        ]}
      />,
    )
    const user = userEvent.setup()

    // Select first row
    await user.click(screen.getAllByLabelText('Select row')[0])
    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })

    // Select second row (re-query after DOM update)
    await user.click(screen.getAllByLabelText('Select row')[1])
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Archive'))
    expect(archiveAction).toHaveBeenCalledWith([data[0], data[1]])
  })

  it('clear button deselects all rows', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: vi.fn() },
        ]}
      />,
    )
    const user = userEvent.setup()

    const checkboxes = screen.getAllByLabelText('Select row')
    await user.click(checkboxes[0])
    expect(screen.getByText('1 selected')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Clear selection'))
    // Bar should disappear
    expect(screen.queryByText('1 selected')).not.toBeInTheDocument()
  })

  it('disabled bulk action button is disabled', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Disabled Action', onClick: vi.fn(), disabled: true },
        ]}
      />,
    )
    const user = userEvent.setup()

    const checkboxes = screen.getAllByLabelText('Select row')
    await user.click(checkboxes[0])

    const btn = screen.getByText('Disabled Action')
    expect(btn).toBeDisabled()
  })

  it('does not show bulk action bar when no rows are selected', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: vi.fn() },
        ]}
      />,
    )
    expect(screen.queryByText('0 selected')).not.toBeInTheDocument()
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument()
  })

  it('bulk action bar updates count when selection changes', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        selectable
        bulkActions={[
          { label: 'Delete', onClick: vi.fn() },
        ]}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getAllByLabelText('Select row')[0])
    await waitFor(() => {
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })

    await user.click(screen.getAllByLabelText('Select row')[1])
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    })

    await user.click(screen.getAllByLabelText('Select row')[2])
    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument()
    })
  })
})
