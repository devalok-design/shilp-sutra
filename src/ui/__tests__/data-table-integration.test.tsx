import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../data-table'

// ============================================================
// Fixtures
// ============================================================

interface Person {
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
