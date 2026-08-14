import { type ColumnDef } from '@tanstack/react-table'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { DataTable } from '../data-table'

// ============================================================
// DataTableBody / CellEditInput — targeted coverage
//
// `CellEditInput` is not exported from data-table-body.tsx, so it is driven
// through the public <DataTable editable /> surface, the same way
// data-table-integration.test.tsx exercises the rest of DataTable's features.
// See GitHub issue #268: inline cell edit, virtual row spacers, and expanded
// rows had no test coverage.
// ============================================================

// ── Fixtures ──────────────────────────────────────────────────

interface Person {
  name: string
  email: string
  role: string
  age: number
}

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  // enableEditing: false — must never enter edit mode, per DataTable's prop docs.
  { accessorKey: 'role', header: 'Role', meta: { enableEditing: false } },
  { accessorKey: 'age', header: 'Age' },
]

const data: Person[] = [
  { name: 'Alice Smith', email: 'alice@example.com', role: 'Engineer', age: 28 },
  { name: 'Bob Jones', email: 'bob@example.com', role: 'Designer', age: 34 },
  { name: 'Carol White', email: 'carol@example.com', role: 'Manager', age: 42 },
]

// ============================================================
// 1. Inline cell edit (Enter / Escape / blur)
// ============================================================

describe('DataTableBody — inline cell editing', () => {
  it('double-click on an editable cell enters edit mode with an input pre-filled with the value', async () => {
    render(<DataTable columns={columns} data={data} editable />)
    const user = userEvent.setup()

    expect(screen.queryByLabelText('Edit cell value')).not.toBeInTheDocument()

    await user.dblClick(screen.getByText('Alice Smith'))

    const input = screen.getByLabelText('Edit cell value')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Alice Smith')
  })

  it('pressing Enter commits the edit and calls onCellEdit(rowIndex, columnId, value)', async () => {
    const onCellEdit = vi.fn()
    render(<DataTable columns={columns} data={data} editable onCellEdit={onCellEdit} />)
    const user = userEvent.setup()

    await user.dblClick(screen.getByText('Alice Smith'))
    const input = screen.getByLabelText('Edit cell value')
    await user.clear(input)
    await user.type(input, 'Alice Cooper{Enter}')

    expect(onCellEdit).toHaveBeenCalledTimes(1)
    expect(onCellEdit).toHaveBeenCalledWith(0, 'name', 'Alice Cooper')
    // Edit mode exits after commit
    expect(screen.queryByLabelText('Edit cell value')).not.toBeInTheDocument()
  })

  it('pressing Escape cancels without calling onCellEdit and reverts to the original value', async () => {
    const onCellEdit = vi.fn()
    render(<DataTable columns={columns} data={data} editable onCellEdit={onCellEdit} />)
    const user = userEvent.setup()

    await user.dblClick(screen.getByText('Bob Jones'))
    const input = screen.getByLabelText('Edit cell value')
    await user.clear(input)
    await user.type(input, 'Someone Else')
    // Sanity: the input actually holds the typed (uncommitted) value before cancel
    expect(input).toHaveValue('Someone Else')

    await user.type(input, '{Escape}')

    expect(onCellEdit).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('Edit cell value')).not.toBeInTheDocument()
    // DataTable never mutates its own `data` prop — since onCellEdit was never
    // called (and the consumer never re-rendered with new data), the cell is
    // back to showing the original, un-edited value.
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.queryByText('Someone Else')).not.toBeInTheDocument()
  })

  it('blur commits the edit (calls onSave, same as Enter) — CellEditInput has no cancel-on-blur path', async () => {
    const onCellEdit = vi.fn()
    render(<DataTable columns={columns} data={data} editable onCellEdit={onCellEdit} />)
    const user = userEvent.setup()

    await user.dblClick(screen.getByText('Carol White'))
    const input = screen.getByLabelText('Edit cell value')
    await user.clear(input)
    await user.type(input, 'Carol Danvers')

    // Move focus away without pressing Enter/Escape — fires a native blur.
    await user.tab()

    expect(onCellEdit).toHaveBeenCalledTimes(1)
    expect(onCellEdit).toHaveBeenCalledWith(2, 'name', 'Carol Danvers')
    expect(screen.queryByLabelText('Edit cell value')).not.toBeInTheDocument()
  })

  it('double-click on a column with meta: { enableEditing: false } does not enter edit mode', async () => {
    const onCellEdit = vi.fn()
    render(<DataTable columns={columns} data={data} editable onCellEdit={onCellEdit} />)
    const user = userEvent.setup()

    // 'role' column is disabled for editing
    await user.dblClick(screen.getAllByText('Engineer')[0])

    expect(screen.queryByLabelText('Edit cell value')).not.toBeInTheDocument()
    expect(onCellEdit).not.toHaveBeenCalled()
  })

  it('has no a11y violations while a cell is in edit mode', async () => {
    const { container } = render(<DataTable columns={columns} data={data} editable />)
    const user = userEvent.setup()

    await user.dblClick(screen.getByText('Alice Smith'))
    expect(screen.getByLabelText('Edit cell value')).toBeInTheDocument()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// 2. Expanded rows
// ============================================================

describe('DataTableBody — expanded rows', () => {
  it('clicking a row expand toggle renders renderExpanded(row) content, toggling again collapses it', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        expandable
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>{row.email}</div>}
      />,
    )
    const user = userEvent.setup()

    expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument()

    await user.click(screen.getAllByLabelText('Expand row')[0])
    const detail = screen.getByTestId('detail-Alice Smith')
    expect(detail).toBeInTheDocument()
    // The Email column cell also renders this exact text — scope the query
    // to the expanded detail panel to avoid an ambiguous multi-match.
    expect(within(detail).getByText('alice@example.com')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Collapse row'))
    // Collapse is animated (AnimatePresence exit) — wait for unmount
    await waitFor(() =>
      expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument(),
    )
  })

  it('singleExpand: expanding a second row collapses the first', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        expandable
        singleExpand
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>{row.email}</div>}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getAllByLabelText('Expand row')[0])
    expect(screen.getByTestId('detail-Alice Smith')).toBeInTheDocument()

    // Re-query: Alice's button is now "Collapse row", Bob's is the first "Expand row"
    await user.click(screen.getAllByLabelText('Expand row')[0])
    expect(screen.getByTestId('detail-Bob Jones')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByTestId('detail-Alice Smith')).not.toBeInTheDocument(),
    )
  })

  it('without singleExpand, multiple rows can be expanded at once', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        expandable
        renderExpanded={(row) => <div data-testid={`detail-${row.name}`}>{row.email}</div>}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getAllByLabelText('Expand row')[0])
    await user.click(screen.getAllByLabelText('Expand row')[0])

    expect(screen.getByTestId('detail-Alice Smith')).toBeInTheDocument()
    expect(screen.getByTestId('detail-Bob Jones')).toBeInTheDocument()
  })
})

// ============================================================
// 3. Virtual row spacers
// ============================================================

/**
 * `@tanstack/react-virtual` reads `offsetHeight` for the scroll viewport and
 * each measured row group, and bails out entirely when the viewport measures
 * 0 — which is every element under jsdom. Without this stub a virtualized
 * table renders only a <thead>, and no virtualization assertion is possible.
 * Mirrors the stub already used in data-table-integration.test.tsx.
 */
function mockVirtualLayout({ viewport = 400, rowGroup = 48 } = {}) {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
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

const manyRows: Person[] = Array.from({ length: 60 }, (_, i) => ({
  name: `Person ${i}`,
  email: `person${i}@example.com`,
  role: i % 2 === 0 ? 'Engineer' : 'Designer',
  age: 20 + (i % 40),
}))

describe('DataTableBody — virtual row spacers', () => {
  let restoreLayout: () => void

  beforeEach(() => {
    restoreLayout = mockVirtualLayout()
  })
  afterEach(() => {
    restoreLayout()
  })

  it('windows a large dataset: fewer row groups render than total rows', () => {
    const { container } = render(
      <DataTable columns={columns} data={manyRows} virtualRows maxHeight={400} />,
    )
    const groups = container.querySelectorAll('tbody[data-index]')
    // The whole point of virtualization: not every row is mounted at once.
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.length).toBeLessThan(manyRows.length)
  })

  it('reserves the un-rendered remainder with a non-zero spacer row group', () => {
    const { container } = render(
      <DataTable columns={columns} data={manyRows} virtualRows maxHeight={400} />,
    )
    const spacers = container.querySelectorAll('tbody[aria-hidden="true"]')
    expect(spacers.length).toBeGreaterThan(0)

    // At least one spacer carries real, positive height — the sizing element
    // that keeps the scroll extent honest without mounting every row.
    const spacerHeights = Array.from(spacers).map((spacer) => {
      const cell = spacer.querySelector('td')
      return cell ? parseFloat(cell.style.height || '0') : 0
    })
    expect(spacerHeights.some((h) => h > 0)).toBe(true)

    // Each spacer's <td> spans every column, same as a real data row.
    for (const spacer of Array.from(spacers)) {
      const cell = spacer.querySelector('td')!
      expect(cell.getAttribute('colspan')).toBe(String(columns.length))
    }
  })

  it('bottom spacer height plus rendered row groups tracks getTotalSize() growth', () => {
    // Not asserting exact pixel math (jsdom has no real layout) — just that
    // a bigger dataset produces a bigger reserved spacer, proving the spacer
    // is actually driven by size, not a fixed/hardcoded value.
    const { container: smallContainer } = render(
      <DataTable columns={columns} data={data} virtualRows maxHeight={400} />,
    )
    const { container: bigContainer } = render(
      <DataTable columns={columns} data={manyRows} virtualRows maxHeight={400} />,
    )

    const totalSpacerHeight = (container: HTMLElement) =>
      Array.from(container.querySelectorAll('tbody[aria-hidden="true"] td')).reduce(
        (sum, cell) => sum + parseFloat((cell as HTMLElement).style.height || '0'),
        0,
      )

    // 3 rows barely exceed a 400px viewport (or don't), 60 rows definitely do.
    expect(totalSpacerHeight(bigContainer)).toBeGreaterThan(totalSpacerHeight(smallContainer))
  })

  it('rows stay accessible via keyboard/DOM traversal despite windowing (no a11y violations)', async () => {
    const { container } = render(
      <DataTable columns={columns} data={manyRows} virtualRows maxHeight={400} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// 4. Loading state
// ============================================================

describe('DataTableBody — loading state', () => {
  it('renders skeleton rows instead of data when loading is true', () => {
    render(<DataTable columns={columns} data={data} loading pageSize={3} />)

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    // 3 skeleton rows * 4 columns = 12 skeleton elements
    const skeletonElements = document.querySelectorAll('[aria-hidden="true"]')
    expect(skeletonElements.length).toBe(12)
  })

  it('renders actual data rows once loading is false', () => {
    render(<DataTable columns={columns} data={data} loading={false} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })
})

// ============================================================
// 5. Empty state
// ============================================================

describe('DataTableBody — empty state', () => {
  it('renders noResultsText when there is no data', () => {
    render(<DataTable columns={columns} data={[]} noResultsText="Nothing here." />)
    expect(screen.getByText('Nothing here.')).toBeInTheDocument()
  })

  it('renders the default "No results." text when noResultsText is not provided', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('renders a custom emptyState node instead of noResultsText when both are provided', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        noResultsText="Fallback text"
        emptyState={<div data-testid="custom-empty">Nothing to show</div>}
      />,
    )
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
    expect(screen.queryByText('Fallback text')).not.toBeInTheDocument()
  })
})
