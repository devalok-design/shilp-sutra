import { IconStar } from '@tabler/icons-react'
import type { Table } from '@tanstack/react-table'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { type BulkAction, DataTableBulkActions } from '../data-table-bulk-actions'

interface Item {
  id: string
  name: string
}

const selectedRows: Item[] = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
]

function createMockTable(): Table<Item> {
  return { resetRowSelection: vi.fn() } as unknown as Table<Item>
}

describe('DataTableBulkActions', () => {
  it('shows the selected row count', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)
    expect(screen.getByText(`${selectedRows.length} selected`)).toBeInTheDocument()
  })

  it('calls the action onClick with the current selectedRows', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    await user.click(screen.getByRole('button', { name: 'Archive' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(selectedRows)
  })

  it('renders an error-colored action as a solid, color=error Button', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Delete', onClick: vi.fn(), color: 'error' }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    // variant="solid" gives the solid role classes; color="error" rides on data-palette
    expect(deleteButton).toHaveAttribute('data-palette', 'error')
    expect(deleteButton).toHaveClass('bg-palette-solid')
  })

  // Was `outline`. The bar converged on the shared BulkActionBar, which uses
  // ghost for non-destructive actions — the bar is already the affordance, and
  // `outline` contradicted the repo's own documented soft-over-outline
  // preference. Destructive actions stay solid (see the test above).
  it('renders a non-error action as a ghost Button', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    const archiveButton = screen.getByRole('button', { name: 'Archive' })
    expect(archiveButton).not.toHaveClass('bg-palette-solid')
    expect(archiveButton).not.toHaveClass('border-palette-border')
  })

  it('disables an action button when disabled is true', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn(), disabled: true }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled()
  })

  it('does not disable an action button when disabled is omitted', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    expect(screen.getByRole('button', { name: 'Archive' })).not.toBeDisabled()
  })

  it('calls table.resetRowSelection when Clear selection is clicked', async () => {
    const user = userEvent.setup()
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    await user.click(screen.getByLabelText('Clear selection'))
    expect(table.resetRowSelection).toHaveBeenCalledTimes(1)
  })

  it('renders the action icon before the label', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Star', onClick: vi.fn(), icon: IconStar }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    const starButton = screen.getByRole('button', { name: 'Star' })
    expect(starButton.querySelector('svg')).toBeInTheDocument()
    expect(starButton).toHaveTextContent('Star')
  })

  it('does not render an icon slot when the action has no icon', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    expect(screen.getByRole('button', { name: 'Archive' }).querySelector('svg')).not.toBeInTheDocument()
  })

  it('defaults to the fixed bottom position', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    const { container } = render(
      <DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />,
    )

    // Portalled to document.body, so it is NOT in `container` — that is the
    // point of the placement prop. Query the toolbar itself.
    void container
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' })
    expect(bar).toHaveClass('fixed')
    // bottom-ds-06, not the raw bottom-6 this used to assert. The raw value
    // was drift from the shared bar, which uses the spacing token.
    expect(bar).toHaveClass('bottom-ds-06')
  })

  it('renders fixed top classes when position="top"', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    const { container } = render(
      <DataTableBulkActions
        table={table}
        selectedRows={selectedRows}
        bulkActions={actions}
        position="top"
      />,
    )

    void container
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' })
    expect(bar).toHaveClass('fixed')
    expect(bar).toHaveClass('top-ds-06')
    expect(bar).not.toHaveClass('bottom-ds-06')
  })

  it('renders relative, non-fixed classes when position="inline"', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    const { container } = render(
      <DataTableBulkActions
        table={table}
        selectedRows={selectedRows}
        bulkActions={actions}
        position="inline"
      />,
    )

    expect(container.firstChild).toHaveClass('relative')
    expect(container.firstChild).not.toHaveClass('fixed')
  })

  it('has role=toolbar and an aria-label of "Bulk actions"', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [
      { label: 'Archive', onClick: vi.fn() },
      { label: 'Delete', onClick: vi.fn(), color: 'error' },
    ]
    const { container } = render(
      <DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

// The defect that motivated the convergence: this bar declared
// `role="toolbar"` while implementing plain tab stops, so it told screen-reader
// users to expect one tab stop and arrow navigation and delivered neither.
// These assert the contract is now real, not just announced.
describe('DataTableBulkActions — the toolbar contract it used to only claim', () => {
  it('is a single tab stop, not one per control', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [
      { label: 'Archive', onClick: vi.fn() },
      { label: 'Export', onClick: vi.fn() },
    ]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' })
    const buttons = within(bar).getAllByRole('button')
    const reachable = buttons.filter((b) => b.getAttribute('tabindex') !== '-1')
    expect(buttons.length).toBeGreaterThan(1)
    expect(reachable).toHaveLength(1)
  })

  it('moves focus with ArrowRight and wraps at the end', async () => {
    const user = userEvent.setup()
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [
      { label: 'Archive', onClick: vi.fn() },
      { label: 'Export', onClick: vi.fn() },
    ]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' })
    await user.click(screen.getByRole('button', { name: 'Archive' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Export' })).toHaveFocus()
    // Clear is the last control; one more wraps back to the first.
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Archive' })).toHaveFocus()
    void bar
  })

  it('Home and End jump to the ends', async () => {
    const user = userEvent.setup()
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [
      { label: 'Archive', onClick: vi.fn() },
      { label: 'Export', onClick: vi.fn() },
    ]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    await user.click(screen.getByRole('button', { name: 'Export' }))
    await user.keyboard('{End}')
    expect(screen.getByRole('button', { name: 'Clear selection' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('button', { name: 'Archive' })).toHaveFocus()
  })

  // Capabilities DataTable simply did not have before. Additive — the props
  // already existed on BulkAction but were ignored by the old implementation.
  it('runs a destructive action only after confirmation', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [
      { label: 'Delete', color: 'error', onClick, requiresConfirmation: true },
    ]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onClick).not.toHaveBeenCalled()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    // Still the row payload, which is the API consumers already depend on.
    expect(onClick).toHaveBeenCalledWith(selectedRows)
  })

  it('inline placement is NOT portalled, so it stays inside an overlay', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    const { container } = render(
      <DataTableBulkActions
        table={table}
        selectedRows={selectedRows}
        bulkActions={actions}
        position="inline"
      />,
    )
    // In `container` rather than document.body — the whole reason placement
    // and portalling are one prop.
    expect(within(container as HTMLElement).getByRole('toolbar')).toBeInTheDocument()
  })
})
