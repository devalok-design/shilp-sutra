import { IconStar } from '@tabler/icons-react'
import type { Table } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
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

  it('renders a non-error action as an outline Button', () => {
    const table = createMockTable()
    const actions: BulkAction<Item>[] = [{ label: 'Archive', onClick: vi.fn() }]
    render(<DataTableBulkActions table={table} selectedRows={selectedRows} bulkActions={actions} />)

    const archiveButton = screen.getByRole('button', { name: 'Archive' })
    // variant="outline" gives the outline role classes.
    expect(archiveButton).toHaveClass('border-palette-border')
    expect(archiveButton).not.toHaveClass('bg-palette-solid')
    // No `color` means NO data-palette, deliberately: the button then inherits
    // whatever palette an ancestor sets, and falls back to accent when none
    // does. Stamping 'accent' here would defeat that inheritance.
    expect(archiveButton).not.toHaveAttribute('data-palette')
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

    expect(container.firstChild).toHaveClass('fixed')
    expect(container.firstChild).toHaveClass('bottom-6')
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

    expect(container.firstChild).toHaveClass('fixed')
    expect(container.firstChild).toHaveClass('top-6')
    expect(container.firstChild).not.toHaveClass('bottom-6')
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
