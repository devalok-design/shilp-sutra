import { type ColumnDef } from '@tanstack/react-table'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { DataTable } from '../data-table'

// ============================================================
// `DataTableHeader` (internal `DataTableHeaderImpl`, re-exported as
// `DataTableHeader`) reads everything except `stickyHeader` from
// `DataTableProvider` context — so the only reliable way to exercise real
// sort-click / filter-input behavior is through the actual <DataTable>,
// mirroring the fixture pattern in data-table-integration.test.tsx.
//
// Covers the gap called out in GitHub issue #268: aria-sort cycling, sort
// icons, sticky header, and filter inputs at unit level.
// ============================================================

interface Person {
  name: string
  email: string
  role: string
  age: number
}

const data: Person[] = [
  { name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer', age: 28 },
  { name: 'Bob Jones', email: 'bob@example.com', role: 'Designer', age: 34 },
  { name: 'Carol White', email: 'carol@example.com', role: 'Manager', age: 42 },
]

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'age', header: 'Age' },
]

// A column with the per-column filter opt-out set.
const columnsWithUnfilterable: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: false },
  { accessorKey: 'role', header: 'Role' },
]

// A column with sorting explicitly disabled.
const columnsWithUnsortable: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email', enableSorting: false },
]

function getHeaderCell(name: string) {
  // The header <th> for a sortable column contains a <button> with this
  // accessible label; for a non-sortable column it just contains the text.
  return screen.getByText(name).closest('th')!
}

// ============================================================
// aria-sort cycling
// ============================================================

describe('DataTableHeader — aria-sort cycling', () => {
  it('has aria-sort="none" on a sortable column before any click', () => {
    render(<DataTable columns={columns} data={data} sortable />)
    expect(getHeaderCell('Name')).toHaveAttribute('aria-sort', 'none')
  })

  it('does not set aria-sort when the table is not sortable', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(getHeaderCell('Name')).not.toHaveAttribute('aria-sort')
  })

  it('does not set aria-sort on a column with enableSorting: false', () => {
    render(<DataTable columns={columnsWithUnsortable} data={data} sortable />)
    expect(getHeaderCell('Email')).not.toHaveAttribute('aria-sort')
  })

  it('cycles aria-sort none -> ascending -> descending -> none on repeated clicks', async () => {
    render(<DataTable columns={columns} data={data} sortable />)
    const user = userEvent.setup()
    const th = getHeaderCell('Name')
    const button = screen.getByLabelText('Sort by Name')

    expect(th).toHaveAttribute('aria-sort', 'none')

    await user.click(button)
    expect(th).toHaveAttribute('aria-sort', 'ascending')

    await user.click(button)
    expect(th).toHaveAttribute('aria-sort', 'descending')

    // Third click clears sorting entirely (TanStack's default
    // enableSortingRemoval behavior) rather than cycling straight back to
    // ascending.
    await user.click(button)
    expect(th).toHaveAttribute('aria-sort', 'none')
  })

  it('sorting one column does not affect aria-sort on another', async () => {
    render(<DataTable columns={columns} data={data} sortable />)
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Sort by Name'))
    expect(getHeaderCell('Name')).toHaveAttribute('aria-sort', 'ascending')
    expect(getHeaderCell('Email')).toHaveAttribute('aria-sort', 'none')
  })
})

// ============================================================
// Sort icons
// ============================================================

describe('DataTableHeader — sort icons', () => {
  it('shows the unsorted (arrows-sort) icon before any click', () => {
    const { container } = render(<DataTable columns={columns} data={data} sortable />)
    const th = getHeaderCell('Name')
    expect(th.querySelector('.tabler-icon-arrows-sort')).toBeInTheDocument()
    expect(th.querySelector('.tabler-icon-arrow-up')).not.toBeInTheDocument()
    expect(th.querySelector('.tabler-icon-arrow-down')).not.toBeInTheDocument()
    void container
  })

  it('shows the arrow-up icon when sorted ascending', async () => {
    render(<DataTable columns={columns} data={data} sortable />)
    const user = userEvent.setup()
    const th = getHeaderCell('Name')

    await user.click(screen.getByLabelText('Sort by Name'))

    await waitFor(() =>
      expect(th.querySelector('.tabler-icon-arrow-up')).toBeInTheDocument(),
    )
    expect(th.querySelector('.tabler-icon-arrows-sort')).not.toBeInTheDocument()
  })

  it('shows the arrow-down icon when sorted descending', async () => {
    render(<DataTable columns={columns} data={data} sortable />)
    const user = userEvent.setup()
    const th = getHeaderCell('Name')
    const button = screen.getByLabelText('Sort by Name')

    await user.click(button) // ascending
    await user.click(button) // descending

    await waitFor(() =>
      expect(th.querySelector('.tabler-icon-arrow-down')).toBeInTheDocument(),
    )
    expect(th.querySelector('.tabler-icon-arrow-up')).not.toBeInTheDocument()
  })

  it('reverts to the unsorted icon once sorting is cleared', async () => {
    render(<DataTable columns={columns} data={data} sortable />)
    const user = userEvent.setup()
    const th = getHeaderCell('Name')
    const button = screen.getByLabelText('Sort by Name')

    await user.click(button) // ascending
    await user.click(button) // descending
    await user.click(button) // cleared

    await waitFor(() =>
      expect(th.querySelector('.tabler-icon-arrows-sort')).toBeInTheDocument(),
    )
  })

  it('does not render a sort button or icon for a non-sortable column', () => {
    render(<DataTable columns={columnsWithUnsortable} data={data} sortable />)
    const th = getHeaderCell('Email')
    expect(th.querySelector('button')).not.toBeInTheDocument()
    expect(th.querySelector('.tabler-icon-arrows-sort')).not.toBeInTheDocument()
  })
})

// ============================================================
// Sticky header
// ============================================================

describe('DataTableHeader — stickyHeader', () => {
  it('applies sticky classes to the header row group when stickyHeader is true', () => {
    render(<DataTable columns={columns} data={data} stickyHeader />)
    const thead = document.querySelector('thead')!
    expect(thead).toHaveClass('sticky')
    expect(thead).toHaveClass('top-0')
    expect(thead).toHaveClass('z-10')
    expect(thead).toHaveClass('bg-surface-panel')
  })

  it('does not apply sticky classes when stickyHeader is omitted', () => {
    render(<DataTable columns={columns} data={data} />)
    const thead = document.querySelector('thead')!
    expect(thead).not.toHaveClass('sticky')
    expect(thead).not.toHaveClass('top-0')
    expect(thead).not.toHaveClass('z-10')
  })

  it('does not apply sticky classes when stickyHeader is explicitly false', () => {
    render(<DataTable columns={columns} data={data} stickyHeader={false} />)
    const thead = document.querySelector('thead')!
    expect(thead).not.toHaveClass('sticky')
  })

  it('combines with sortable and filterable without losing sticky classes', () => {
    render(
      <DataTable columns={columns} data={data} stickyHeader sortable filterable />,
    )
    const thead = document.querySelector('thead')!
    expect(thead).toHaveClass('sticky')
    // Sort buttons and filter inputs should still be present alongside sticky.
    expect(screen.getByLabelText('Sort by Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
  })
})

// ============================================================
// Filter inputs
// ============================================================

describe('DataTableHeader — filter inputs', () => {
  it('renders a filter input for each filterable column', () => {
    render(<DataTable columns={columns} data={data} filterable />)
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Email...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Role...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Age...')).toBeInTheDocument()
  })

  it('does not render filter inputs when filterable is false', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.queryByPlaceholderText('Filter Name...')).not.toBeInTheDocument()
  })

  it('typing into a filter input filters the body rows', async () => {
    render(<DataTable columns={columns} data={data} filterable />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Filter Name...'), 'Alice')

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
  })

  it('does not render a filter input for a column with enableColumnFilter: false', () => {
    render(<DataTable columns={columnsWithUnfilterable} data={data} filterable />)
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Role...')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Email...')).not.toBeInTheDocument()
  })

  it('filterableColumns restricts filter inputs to the listed column IDs', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        filterable
        filterableColumns={['name', 'role']}
      />,
    )
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Role...')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Email...')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Age...')).not.toBeInTheDocument()
  })

  it('filterableColumns still filters rows for a listed column', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        filterable
        filterableColumns={['role']}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Filter Role...'), 'Engineer')

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol White')).not.toBeInTheDocument()
  })
})

// ============================================================
// Accessibility
// ============================================================

describe('DataTableHeader — accessibility', () => {
  it('has no a11y violations with sortable + filterable headers', async () => {
    const { container } = render(
      <DataTable columns={columns} data={data} sortable filterable />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations with stickyHeader + a sorted column', async () => {
    const { container } = render(
      <DataTable columns={columns} data={data} stickyHeader sortable filterable />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Sort by Name'))

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
