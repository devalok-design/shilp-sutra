import { type ColumnDef } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { DataTable } from '../data-table'

// ============================================================
// Fixtures
//
// DataTablePagination is not exported to consumers (see its own file
// comment), so it's exercised through the real <DataTable paginated />
// integration rather than a hand-built TanStack `Table` mock — that's
// the only way to get real getCanPreviousPage/getCanNextPage/getPageCount
// behaviour instead of guessing at it.
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

// 25 rows — enough for several pages at pageSize 10 (3 pages) and a clean
// middle page to assert both Previous and Next are enabled simultaneously.
const manyRows: Person[] = Array.from({ length: 25 }, (_, i) => ({
  name: `Person ${i}`,
  email: `person${i}@example.com`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
  age: 20 + (i % 40),
}))

// ============================================================
// Page size selector
// ============================================================

describe('DataTablePagination — page size selector', () => {
  it('defaults to [10, 20, 50, 100] when pageSizeOptions is not provided', () => {
    render(<DataTable columns={columns} data={manyRows} paginated />)
    const select = screen.getByLabelText('Rows per page') as HTMLSelectElement
    const optionValues = Array.from(select.options).map((o) => o.value)
    expect(optionValues).toEqual(['10', '20', '50', '100'])
  })

  it('pageSizeOptions customizes the available choices', () => {
    render(
      <DataTable
        columns={columns}
        data={manyRows}
        paginated
        pageSizeOptions={[5, 15, 25]}
      />,
    )
    const select = screen.getByLabelText('Rows per page') as HTMLSelectElement
    const optionValues = Array.from(select.options).map((o) => o.value)
    expect(optionValues).toEqual(['5', '15', '25'])
  })

  it('changing the page size selector updates rows shown and page count', async () => {
    render(
      <DataTable columns={columns} data={manyRows} paginated pageSize={10} />,
    )
    const user = userEvent.setup()

    // 25 rows at pageSize 10 -> 3 pages
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(screen.getAllByText(/^Person \d+$/)).toHaveLength(10)

    // Switch to 50 rows per page -> everything fits on one page
    const select = screen.getByLabelText('Rows per page')
    await user.selectOptions(select, '50')

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getAllByText(/^Person \d+$/)).toHaveLength(25)
  })

  it('reducing page size after navigating forward keeps pagination math consistent', async () => {
    render(
      <DataTable
        columns={columns}
        data={manyRows}
        paginated
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
      />,
    )
    const user = userEvent.setup()

    // Move to page 2 of 3 (rows 10-19)
    await user.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()

    // Shrink page size to 5 -> pageCount becomes 5; TanStack clamps/recomputes
    // pageIndex so it never reports an out-of-range page.
    const select = screen.getByLabelText('Rows per page')
    await user.selectOptions(select, '5')

    const pageInfo = screen.getByText(/^Page \d+ of 5$/)
    expect(pageInfo).toBeInTheDocument()
    // Exactly 5 rows should be visible on whatever page it landed on
    expect(screen.getAllByText(/^Person \d+$/)).toHaveLength(5)
  })

  it('page size selector is hidden entirely under server-side pagination', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 10)}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    expect(screen.queryByLabelText('Rows per page')).not.toBeInTheDocument()
  })
})

// ============================================================
// Prev/next disabled states (client-side pagination)
// ============================================================

describe('DataTablePagination — prev/next disabled states (client)', () => {
  it('disables Previous and enables Next on the first page', () => {
    render(
      <DataTable columns={columns} data={manyRows} paginated pageSize={10} />,
    )
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
    expect(screen.getByLabelText('Next page')).toBeEnabled()
  })

  it('enables both Previous and Next on a middle page', async () => {
    render(
      <DataTable columns={columns} data={manyRows} paginated pageSize={10} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Previous page')).toBeEnabled()
    expect(screen.getByLabelText('Next page')).toBeEnabled()
  })

  it('disables Next and enables Previous on the last page', async () => {
    render(
      <DataTable columns={columns} data={manyRows} paginated pageSize={10} />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Next page'))
    await user.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeDisabled()
    expect(screen.getByLabelText('Previous page')).toBeEnabled()
  })

  it('disables both Previous and Next when everything fits on a single page', () => {
    render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 3)}
        paginated
        pageSize={10}
      />,
    )
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })
})

// ============================================================
// Server-side pagination
// ============================================================

describe('DataTablePagination — server-side pagination', () => {
  it('clicking Next calls onPageChange with the next 1-based page', async () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 10)}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Next page'))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('clicking Previous calls onPageChange with the previous 1-based page', async () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={manyRows.slice(10, 20)}
        pagination={{ page: 2, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Previous page'))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('does not page client-side — visible rows are exactly what the server sent', async () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 10)}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Next page'))
    // The parent only calls onPageChange — it does not slice `data` itself in
    // this test, so the same 10 server-supplied rows remain on screen. That's
    // the point: paging is delegated entirely to the caller, not done in-table.
    expect(screen.getAllByText(/^Person \d+$/)).toHaveLength(10)
    expect(screen.getByText('Person 0')).toBeInTheDocument()
  })

  it('totalRowCount and page count reflect server total, not current page row count', () => {
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 10)}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    // Only 10 rows are on screen, but the total/page-count math uses the
    // server-declared total (25), not table.getFilteredRowModel().rows.length.
    expect(screen.getByText('25 total rows')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })

  it('disables Previous on server page 1 and Next on the last server page', () => {
    const onPageChange = vi.fn()
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 10)}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
    expect(screen.getByLabelText('Next page')).toBeEnabled()

    rerender(
      <DataTable
        columns={columns}
        data={manyRows.slice(20, 25)}
        pagination={{ page: 3, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeDisabled()
    expect(screen.getByLabelText('Previous page')).toBeEnabled()
  })
})

// ============================================================
// Accessibility
// ============================================================

describe('DataTablePagination — accessibility', () => {
  it('has no a11y violations with client-side pagination controls', async () => {
    const { container } = render(
      <DataTable columns={columns} data={manyRows} paginated pageSize={10} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations with server-side pagination controls', async () => {
    const onPageChange = vi.fn()
    const { container } = render(
      <DataTable
        columns={columns}
        data={manyRows.slice(0, 10)}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
