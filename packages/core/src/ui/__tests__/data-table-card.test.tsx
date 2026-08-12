import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  type RowSelectionState,
  useReactTable,
} from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { DataTableCards } from '../data-table-card'
import { type DataTableContextValue, DataTableProvider } from '../data-table-context'

// ============================================================
// Fixtures
// ============================================================

interface Person {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
]

const data: Person[] = [
  { id: 'a1', name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer' },
  { id: 'b2', name: 'Bob Jones', email: 'bob@example.com', role: 'Designer' },
  { id: 'c3', name: 'Carol White', email: 'carol@example.com', role: 'Manager' },
]

// ============================================================
// Harness
// ============================================================

/**
 * DataTableCards is a pure `useDataTableContext` consumer — it takes no `table`
 * prop. Build a real TanStack table instance and feed it through
 * `DataTableProvider` directly (mirroring how `data-table.tsx` assembles its
 * `contextValue`), which tests the component in isolation without needing the
 * full `<DataTable>` + a `window.matchMedia` viewport mock.
 */
function CardsHarness({
  rows = data,
  cols = columns,
  selectable = false,
  filterable = false,
  filterableColumns,
  rowClassName,
  loading = false,
  skeletonRowCount = 5,
  noResultsText,
  emptyState,
  onSelectionChange,
}: {
  rows?: Person[]
  cols?: ColumnDef<Person, unknown>[]
  selectable?: boolean
  filterable?: boolean
  filterableColumns?: string[]
  rowClassName?: (row: Person) => string | undefined
  loading?: boolean
  skeletonRowCount?: number
  noResultsText?: string
  emptyState?: React.ReactNode
  onSelectionChange?: (selected: Person[]) => void
}) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data: rows,
    columns: cols,
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  React.useEffect(() => {
    if (!onSelectionChange) return
    const ids = Object.keys(rowSelection).filter((k) => rowSelection[k])
    onSelectionChange(rows.filter((r) => ids.includes(r.id)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  const contextValue: DataTableContextValue<Person> = {
    table,
    allColumns: cols.map((c) => ({ id: (c as { id?: string }).id, header: c.header })),
    columnPinningState: {},
    sortable: false,
    filterable,
    filterableColumns,
    editable: false,
    expandable: false,
    virtualRows: false,
    selectable,
    mobileView: 'card',
    editingCell: null,
    setEditingCell: () => {},
    rowClassName,
  }

  return (
    <DataTableProvider value={contextValue}>
      <DataTableCards
        loading={loading}
        skeletonRowCount={skeletonRowCount}
        noResultsText={noResultsText}
        emptyState={emptyState}
      />
    </DataTableProvider>
  )
}

// ============================================================
// Loading / skeleton state
// ============================================================

describe('DataTableCards — loading', () => {
  it('renders skeletonRowCount card skeletons instead of data', () => {
    const { container } = render(<CardsHarness loading skeletonRowCount={3} />)
    // The loading branch's root is a `flex flex-col gap-ds-03` div whose direct
    // children are the skeleton Cards — one per skeletonRowCount.
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children).toHaveLength(3)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
  })

  it('renders 4 skeleton placeholder lines per card (1 title + 3 body lines)', () => {
    const { container } = render(<CardsHarness loading skeletonRowCount={2} />)
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2 * 4)
  })

  it('respects a different skeletonRowCount', () => {
    const { container } = render(<CardsHarness loading skeletonRowCount={7} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children).toHaveLength(7)
  })

  it('does not render the empty state while loading, even with zero rows', () => {
    render(
      <CardsHarness rows={[]} loading skeletonRowCount={4} noResultsText="Nothing here" />,
    )
    expect(screen.queryByText('Nothing here')).not.toBeInTheDocument()
  })

  it('has no a11y violations in the loading state', async () => {
    const { container } = render(<CardsHarness loading skeletonRowCount={3} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Empty state
// ============================================================

describe('DataTableCards — empty state', () => {
  it('renders default "No results." text when rows are empty', () => {
    render(<CardsHarness rows={[]} />)
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('renders custom noResultsText when provided', () => {
    render(<CardsHarness rows={[]} noResultsText="Nothing to show" />)
    expect(screen.getByText('Nothing to show')).toBeInTheDocument()
  })

  it('renders custom emptyState ReactNode, taking precedence over noResultsText', () => {
    render(
      <CardsHarness
        rows={[]}
        noResultsText="Fallback text"
        emptyState={<div data-testid="custom-empty">Nothing yet!</div>}
      />,
    )
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    expect(screen.getByText('Nothing yet!')).toBeInTheDocument()
    expect(screen.queryByText('Fallback text')).not.toBeInTheDocument()
  })

  it('does not render the empty state when rows are present', () => {
    render(<CardsHarness emptyState={<div data-testid="custom-empty">Empty</div>} />)
    expect(screen.queryByTestId('custom-empty')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('has no a11y violations in the empty state', async () => {
    const { container } = render(<CardsHarness rows={[]} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Selection
// ============================================================

describe('DataTableCards — selection', () => {
  it('renders a checkbox per card when selectable', () => {
    render(<CardsHarness selectable />)
    expect(screen.getAllByLabelText('Select row')).toHaveLength(3)
  })

  it('does not render checkboxes when selectable is false', () => {
    render(<CardsHarness selectable={false} />)
    expect(screen.queryAllByLabelText('Select row')).toHaveLength(0)
  })

  it('checking a card checkbox drives row selection, same as table view', async () => {
    const onSelectionChange = vi.fn()
    render(<CardsHarness selectable onSelectionChange={onSelectionChange} />)
    const user = userEvent.setup()

    await user.click(screen.getAllByLabelText('Select row')[0])

    expect(onSelectionChange).toHaveBeenLastCalledWith([data[0]])
  })

  it('unchecking a selected card checkbox clears its selection', async () => {
    const onSelectionChange = vi.fn()
    render(<CardsHarness selectable onSelectionChange={onSelectionChange} />)
    const user = userEvent.setup()

    const checkbox = screen.getAllByLabelText('Select row')[0]
    await user.click(checkbox)
    await user.click(checkbox)

    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it('applies a selected ring to the checked row card only', async () => {
    render(<CardsHarness selectable />)
    const user = userEvent.setup()
    const cards = screen.getAllByRole('listitem')

    await user.click(screen.getAllByLabelText('Select row')[0])

    expect(cards[0]).toHaveClass('ring-2', 'ring-accent-9')
    expect(cards[1]).not.toHaveClass('ring-2')
    expect(cards[2]).not.toHaveClass('ring-2')
  })
})

// ============================================================
// Filterable
// ============================================================

describe('DataTableCards — filterable', () => {
  it('renders a filter input above the card list for each filterable column', () => {
    const { container } = render(<CardsHarness filterable />)
    const nameFilter = screen.getByPlaceholderText('Filter Name...')
    expect(nameFilter).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Email...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Role...')).toBeInTheDocument()

    // Document order: the filter input precedes the first card...
    const firstCard = screen.getAllByRole('listitem')[0]
    expect(
      nameFilter.compareDocumentPosition(firstCard) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    // ...and it does not live inside a card either.
    expect(container.querySelector('[role="listitem"] input')).toBeNull()
  })

  it('does not render filter inputs when filterable is false', () => {
    render(<CardsHarness filterable={false} />)
    expect(screen.queryByPlaceholderText('Filter Name...')).not.toBeInTheDocument()
  })

  it('typing in a filter input filters the visible cards', async () => {
    render(<CardsHarness filterable />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText('Filter Name...'), 'Alice')

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('has no a11y violations with filters + selection', async () => {
    const { container } = render(<CardsHarness filterable selectable />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// filterableColumns
// ============================================================

describe('DataTableCards — filterableColumns', () => {
  it('only renders filter inputs for the listed column IDs', () => {
    render(<CardsHarness filterable filterableColumns={['name']} />)
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Email...')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Role...')).not.toBeInTheDocument()
  })

  it('a wider filterableColumns list still restricts to just those columns', () => {
    render(<CardsHarness filterable filterableColumns={['name', 'email']} />)
    expect(screen.getByPlaceholderText('Filter Name...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter Email...')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Filter Role...')).not.toBeInTheDocument()
  })

  it('has no effect when filterable is false', () => {
    render(<CardsHarness filterable={false} filterableColumns={['name']} />)
    expect(screen.queryByPlaceholderText('Filter Name...')).not.toBeInTheDocument()
  })
})

// ============================================================
// rowClassName
// ============================================================

describe('DataTableCards — rowClassName', () => {
  it('applies the returned className to the matching card', () => {
    render(
      <CardsHarness
        rowClassName={(row) => (row.role === 'Engineer' ? 'bg-error-3' : undefined)}
      />,
    )
    const cards = screen.getAllByRole('listitem')
    // data order: Alice (Engineer), Bob (Designer), Carol (Manager)
    expect(cards[0]).toHaveClass('bg-error-3')
    expect(cards[1]).not.toHaveClass('bg-error-3')
    expect(cards[2]).not.toHaveClass('bg-error-3')
  })

  it('does not add a class when rowClassName returns undefined', () => {
    render(<CardsHarness rowClassName={() => undefined} />)
    const cards = screen.getAllByRole('listitem')
    expect(cards[0].className).not.toContain('undefined')
  })

  it('composes with the selected-row ring class', async () => {
    render(
      <CardsHarness
        selectable
        rowClassName={(row) => (row.role === 'Engineer' ? 'bg-error-3' : undefined)}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getAllByLabelText('Select row')[0])

    const cards = screen.getAllByRole('listitem')
    expect(cards[0]).toHaveClass('bg-error-3')
    expect(cards[0]).toHaveClass('ring-2', 'ring-accent-9')
  })
})
