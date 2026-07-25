import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { BulkActionBar, type BulkActionBarAction } from './bulk-action-bar'

const actions: BulkActionBarAction[] = [
  { label: 'Archive', onClick: vi.fn() },
  { label: 'Delete', onClick: vi.fn(), color: 'error' },
]

describeConformance(
  'BulkActionBar',
  (props) => (
    <BulkActionBar
      show={true}
      count={3}
      onClearSelection={vi.fn()}
      actions={actions}
      {...props}
    />
  ),
  // Portals to document.body and destructures its own props — so helper's
  // container-scoped queries and generic prop-spreading don't apply.
  { skip: ['className', 'ref', 'attrs'] },
)

describe('BulkActionBar', () => {
  it('renders the toolbar with selected count when show is true', () => {
    render(
      <BulkActionBar
        show={true}
        count={3}
        onClearSelection={vi.fn()}
        actions={actions}
      />,
    )
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
    expect(screen.getByText('3 selected')).toBeInTheDocument()
  })

  it('does not render toolbar content when show is false', () => {
    render(
      <BulkActionBar
        show={false}
        count={0}
        onClearSelection={vi.fn()}
        actions={actions}
      />,
    )
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })

  it('roving focus + Enter activates the action (keyboard — P0 regression)', async () => {
    const onArchive = vi.fn()
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(
      <BulkActionBar
        show
        count={3}
        onClearSelection={vi.fn()}
        actions={[
          { label: 'Archive', onClick: onArchive },
          { label: 'Delete', onClick: onDelete, color: 'error' },
        ]}
      />,
    )
    // Single tab stop → focus lands on the first real button (not a wrapper div).
    await user.tab()
    expect(screen.getByRole('button', { name: 'Archive' })).toHaveFocus()
    // Roving with arrows, then activation with Enter.
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onArchive).not.toHaveBeenCalled()
  })

  it('renders action buttons', () => {
    render(
      <BulkActionBar
        show={true}
        count={2}
        onClearSelection={vi.fn()}
        actions={actions}
      />,
    )
    expect(screen.getByText('Archive')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onClearSelection when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <BulkActionBar
        show={true}
        count={2}
        onClearSelection={onClear}
        actions={actions}
      />,
    )
    await user.click(screen.getByLabelText('Clear selection'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('shows "Select all" button when totalCount > count', () => {
    render(
      <BulkActionBar
        show={true}
        count={2}
        totalCount={10}
        onClearSelection={vi.fn()}
        onSelectAll={vi.fn()}
        actions={actions}
      />,
    )
    expect(screen.getByText('Select all 10')).toBeInTheDocument()
  })

  it('shows inline confirmation when action requires it', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <BulkActionBar
        show={true}
        count={1}
        onClearSelection={vi.fn()}
        actions={[
          { label: 'Remove', onClick, requiresConfirmation: true },
        ]}
      />,
    )
    await user.click(screen.getByText('Remove'))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()

    await user.click(screen.getByText('Confirm'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BulkActionBar
        show={true}
        count={2}
        onClearSelection={vi.fn()}
        actions={actions}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
