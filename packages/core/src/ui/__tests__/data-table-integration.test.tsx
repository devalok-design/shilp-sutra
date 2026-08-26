import { type ColumnDef } from '@tanstack/react-table'
import { render, screen, waitFor,within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

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
    // collapse is animated (AnimatePresence exit) — wait for unmount
    await waitFor(() =>
      expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument(),
    )
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

    // Collapse Alice — animated exit, wait for unmount
    await user.click(screen.getByLabelText('Collapse row'))
    await waitFor(() =>
      expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument(),
    )
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
    // raised, not base — the sticky bar must match the card surface the table lives on
    expect(thead).toHaveClass('bg-surface-panel')
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
    }, { timeout: 3000 })

    // Select second row (re-query after DOM update)
    await user.click(screen.getAllByLabelText('Select row')[1])
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    }, { timeout: 3000 })

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
    }, { timeout: 3000 })

    await user.click(screen.getAllByLabelText('Select row')[1])
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument()
    }, { timeout: 3000 })

    await user.click(screen.getAllByLabelText('Select row')[2])
    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})

// ============================================================
// Bug fix: mount echo (#213, #249)
// ============================================================

describe('DataTable — onSelectionChange mount-echo fix', () => {
  it('does NOT fire onSelectionChange on mount', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable columns={columns} data={data} selectable onSelectionChange={onSelectionChange} />,
    )
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('does NOT fire on mount even when selectedIds is provided', () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={dataWithIds}
        selectable
        getRowId={(r) => r.id!}
        selectedIds={new Set(['a1'])}
        onSelectionChange={onSelectionChange}
      />,
    )
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('DOES fire after genuine user interaction', async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable columns={columns} data={data} selectable onSelectionChange={onSelectionChange} />,
    )
    const user = userEvent.setup()
    await user.click(screen.getAllByLabelText('Select row')[0])
    expect(onSelectionChange).toHaveBeenCalledTimes(1)
  })

  it('passes selectedIds Set as second argument', async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={dataWithIds}
        selectable
        getRowId={(r) => r.id!}
        onSelectionChange={onSelectionChange}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getAllByLabelText('Select row')[0])
    const [rows, ids] = onSelectionChange.mock.calls[0]
    expect(rows[0].name).toBe('Alice Smith')
    expect(ids).toBeInstanceOf(Set)
    expect(ids.has('a1')).toBe(true)
  })
})

// ============================================================
// Bug fix: enableExport wired through DataTableProps (#249)
// ============================================================

describe('DataTable — enableExport + onExport', () => {
  it('Export button hidden when enableExport={false}', () => {
    render(<DataTable columns={columns} data={data} toolbar enableExport={false} />)
    expect(screen.queryByLabelText('Export table as CSV')).not.toBeInTheDocument()
  })

  it('Export button still shows by default, including with server pagination', () => {
    // The button has rendered unconditionally since the toolbar existed. Hiding
    // it by default — even only under server pagination — would silently delete
    // a live affordance from every consumer on upgrade.
    const { rerender } = render(<DataTable columns={columns} data={data} toolbar />)
    expect(screen.getByLabelText('Export table as CSV')).toBeInTheDocument()

    rerender(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        pagination={{ page: 1, pageSize: 2, total: 10, onPageChange: vi.fn() }}
      />,
    )
    expect(screen.getByLabelText('Export table as CSV')).toBeInTheDocument()
  })

  it('Export button hidden with server pagination when opted out explicitly', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        enableExport={false}
        pagination={{ page: 1, pageSize: 2, total: 10, onPageChange: vi.fn() }}
      />,
    )
    expect(screen.queryByLabelText('Export table as CSV')).not.toBeInTheDocument()
  })

  it('onExport called instead of built-in CSV when provided', async () => {
    const onExport = vi.fn()
    render(
      <DataTable columns={columns} data={data} toolbar enableExport onExport={onExport} />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Export table as CSV'))
    expect(onExport).toHaveBeenCalledTimes(1)
    expect(onExport.mock.calls[0][0]).toHaveLength(4)
  })

  // #268 — onExport must receive the currently visible (filtered) rows, not
  // the full original `data` array, per its own JSDoc ("Receives the
  // currently visible (filtered) rows...").
  it('onExport receives only the currently filtered (visible) rows, not all rows', async () => {
    const onExport = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        filterable
        enableExport
        onExport={onExport}
      />,
    )
    const user = userEvent.setup()

    // Filter down to just Alice — Bob/Carol/Dave should drop out of view.
    await user.type(screen.getByPlaceholderText('Filter Name...'), 'Alice')
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
    expect(screen.queryByText('Dave Brown')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Export table as CSV'))

    expect(onExport).toHaveBeenCalledTimes(1)
    // Exactly the visible subset — not the full 4-row `data` array.
    expect(onExport.mock.calls[0][0]).toEqual([data[0]])
  })

  it('onExport receives all rows when no filter is applied (sanity check)', async () => {
    const onExport = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        toolbar
        filterable
        enableExport
        onExport={onExport}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Export table as CSV'))

    expect(onExport).toHaveBeenCalledTimes(1)
    expect(onExport.mock.calls[0][0]).toEqual(data)
  })
})

// ============================================================
// Feature: filterableColumns (#250)
// ============================================================

describe('DataTable — filterableColumns', () => {
  it('only listed columns get filter inputs', () => {
    render(
      <DataTable columns={columns} data={data} filterable filterableColumns={['name', 'email']} />,
    )
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Email...')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Role...')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Age...')).not.toBeInTheDocument()
  })

  it('filtering works correctly with filterableColumns set', async () => {
    render(
      <DataTable columns={columns} data={data} filterable filterableColumns={['name']} />,
    )
    const user = userEvent.setup()
    // Filter input is in the header row — get by placeholder text since aria-label
    // uses the column header string which is 'Name', not 'Filter Name...'
    const input = screen.getByPlaceholderText('Filter Name...')
    await user.type(input, 'Alice')
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
  })
})

// ============================================================
// Feature: rowClassName (#250)
// ============================================================

describe('DataTable — rowClassName', () => {
  it('applies returned className to matching rows', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowClassName={(row) => row.role === 'Engineer' ? 'bg-error-3' : undefined}
      />,
    )
    const rows = screen.getAllByRole('row')
    // row[0]=header, row[1]=Alice(Engineer), row[2]=Bob(Designer), row[4]=Dave(Engineer)
    expect(rows[1]).toHaveClass('bg-error-3')
    expect(rows[2]).not.toHaveClass('bg-error-3')
    expect(rows[4]).toHaveClass('bg-error-3')
  })

  it('does not add class when rowClassName returns undefined', () => {
    render(<DataTable columns={columns} data={data} rowClassName={() => undefined} />)
    const rows = screen.getAllByRole('row')
    expect(rows[1].className).not.toContain('undefined')
  })
})

// ============================================================
// Feature: mobileView="card" (#212)
// ============================================================

/**
 * Force the below-sm media query DataTable reads for card mode. The global
 * test-setup mock answers `matches: false` to everything, which is desktop —
 * card mode would never activate. Follows the `use-mobile.test.ts` pattern:
 * a hand-rolled MediaQueryList stub installed on `window.matchMedia`.
 */
function mockBelowSmViewport(matches: boolean) {
  const original = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('639px') ? matches : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
  return () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: original,
    })
  }
}

describe('DataTable — mobileView="card"', () => {
  it('renders cards instead of a table below sm', () => {
    const restore = mockBelowSmViewport(true)
    try {
      render(<DataTable columns={columns} data={data} mobileView="card" />)
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(4)
    } finally {
      restore()
    }
  })

  it('keeps the table above sm even with mobileView="card"', () => {
    const restore = mockBelowSmViewport(false)
    try {
      render(<DataTable columns={columns} data={data} mobileView="card" />)
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    } finally {
      restore()
    }
  })

  it('renders filter inputs ABOVE the card list when filterable', () => {
    const restore = mockBelowSmViewport(true)
    try {
      const { container } = render(
        <DataTable columns={columns} data={data} mobileView="card" filterable />,
      )
      const nameFilter = screen.getByPlaceholderText('Filter Name...')
      expect(nameFilter).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Filter Email...')).toBeInTheDocument()

      // Document order: the filter input precedes the first card.
      const firstCard = screen.getAllByRole('listitem')[0]
      expect(
        nameFilter.compareDocumentPosition(firstCard) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
      // ...and it is not inside a card either.
      expect(container.querySelector('[role="listitem"] input')).toBeNull()
    } finally {
      restore()
    }
  })

  it('card filter inputs actually filter the card list', async () => {
    const restore = mockBelowSmViewport(true)
    try {
      render(<DataTable columns={columns} data={data} mobileView="card" filterable />)
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Filter Name...'), 'Alice')
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    } finally {
      restore()
    }
  })

  it('respects filterableColumns in card mode', () => {
    const restore = mockBelowSmViewport(true)
    try {
      render(
        <DataTable
          columns={columns}
          data={data}
          mobileView="card"
          filterable
          filterableColumns={['name']}
        />,
      )
      expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Filter Email...')).not.toBeInTheDocument()
    } finally {
      restore()
    }
  })

  it('applies rowClassName to cards', () => {
    const restore = mockBelowSmViewport(true)
    try {
      render(
        <DataTable
          columns={columns}
          data={data}
          mobileView="card"
          rowClassName={(row) => (row.role === 'Engineer' ? 'bg-error-3' : undefined)}
        />,
      )
      const cards = screen.getAllByRole('listitem')
      // data order: Alice(Engineer), Bob(Designer), Carol(Manager), Dave(Engineer)
      expect(cards[0]).toHaveClass('bg-error-3')
      expect(cards[1]).not.toHaveClass('bg-error-3')
      expect(cards[3]).toHaveClass('bg-error-3')
    } finally {
      restore()
    }
  })

  it('has no a11y violations in card mode with filters', async () => {
    const restore = mockBelowSmViewport(true)
    try {
      const { container } = render(
        <DataTable columns={columns} data={data} mobileView="card" filterable selectable />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    } finally {
      restore()
    }
  })
})

// ============================================================
// Bug fix: virtualRows + expandable (#249 bug 2)
// ============================================================

/**
 * `@tanstack/react-virtual` reads `offsetHeight` (never getBoundingClientRect) for
 * both the scroll viewport and each measured item, and bails out entirely when the
 * viewport measures 0 — which is every element in jsdom. Without this stub a
 * virtualized table renders a `<thead>` and nothing else, so no virtual assertion
 * is possible at all.
 *
 * `TBODY` is the measured row group; the `overflow-y: auto` div is DataTable's
 * scroll container.
 */
function mockVirtualLayout({ viewport = 500, rowGroup = 48 } = {}) {
  const original = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight',
  )
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.tagName === 'TBODY') return rowGroup
      if (this.style?.overflowY === 'auto') return viewport
      return 0
    },
  })
  return () => {
    if (original) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original)
    } else {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight
    }
  }
}

const manyRows: Person[] = Array.from({ length: 100 }, (_, i) => ({
  id: `row-${i}`,
  name: `Person ${i}`,
  email: `person${i}@example.com`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
  age: 20 + (i % 40),
}))

describe('DataTable — virtualRows', () => {
  let restoreLayout: () => void

  beforeEach(() => {
    restoreLayout = mockVirtualLayout()
  })
  afterEach(() => {
    restoreLayout()
  })

  it('renders rows in virtual mode', () => {
    render(<DataTable columns={columns} data={data} virtualRows maxHeight={400} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Dave Brown')).toBeInTheDocument()
  })

  it('windows a large dataset and pads the un-rendered remainder', () => {
    const { container } = render(
      <DataTable columns={columns} data={manyRows} virtualRows maxHeight={500} />,
    )
    const groups = container.querySelectorAll('tbody[data-index]')
    // Far fewer than 100 rows in the DOM — that is the whole point.
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.length).toBeLessThan(manyRows.length)

    // The un-rendered tail is reserved by an aria-hidden spacer row group so the
    // scroll extent stays honest.
    const spacer = container.querySelector('tbody[aria-hidden="true"]')
    expect(spacer).not.toBeNull()
    const spacerCell = spacer!.querySelector('td')!
    expect(parseFloat(spacerCell.style.height)).toBeGreaterThan(0)
    expect(spacerCell.getAttribute('colspan')).toBe(String(columns.length))
  })

  it('renders expanded content in the DOM when a virtual row is expanded', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        virtualRows
        maxHeight={400}
        expandable
        renderExpanded={(row) => <div>Detail for {row.name}</div>}
      />,
    )
    const user = userEvent.setup()
    expect(screen.queryByText('Detail for Alice Smith')).not.toBeInTheDocument()

    await user.click(screen.getAllByLabelText('Expand row')[0])
    expect(screen.getByText('Detail for Alice Smith')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Collapse row'))
    expect(screen.queryByText('Detail for Alice Smith')).not.toBeInTheDocument()
  })

  it('measures each row group so expanded height is accounted for (no overlap)', async () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        virtualRows
        maxHeight={400}
        expandable
        renderExpanded={(row) => <div>Detail for {row.name}</div>}
      />,
    )
    // One <tbody> per windowed row, each tagged with the index the virtualizer
    // measures it under. This is what makes getTotalSize() include the expanded
    // panel — without it the panel and the next row share an offset.
    const groups = container.querySelectorAll('tbody[data-index]')
    expect(groups.length).toBe(4)
    expect(Array.from(groups).map((g) => g.getAttribute('data-index'))).toEqual([
      '0',
      '1',
      '2',
      '3',
    ])

    // No absolute positioning: rows stay in table flow, so an expanded panel
    // cannot paint on top of the row after it.
    const user = userEvent.setup()
    await user.click(screen.getAllByLabelText('Expand row')[0])
    const expandedRow = screen.getByText('Detail for Alice Smith').closest('tr')!
    expect(expandedRow.style.position).toBe('')
    expect(expandedRow.style.transform).toBe('')
    // The expanded row is a sibling INSIDE the measured group, not a stray row.
    expect(expandedRow.parentElement).toBe(groups[0])
    expect(groups[0].querySelectorAll('tr')).toHaveLength(2)
  })

  it('does not warn on virtualRows + expandable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <DataTable
        columns={columns}
        data={data}
        virtualRows
        maxHeight={400}
        expandable
        renderExpanded={(row) => <div>Detail for {row.name}</div>}
      />,
    )
    const dataTableWarnings = warn.mock.calls.filter((c) =>
      String(c[0]).includes('[DataTable]'),
    )
    expect(dataTableWarnings).toEqual([])
    warn.mockRestore()
  })

  it('has no a11y violations in virtual mode with an expanded row', async () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        virtualRows
        maxHeight={400}
        expandable
        renderExpanded={(row) => <div>Detail for {row.name}</div>}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getAllByLabelText('Expand row')[0])
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
