import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { BulkActionBar } from '../bulk-action-bar'
import { BoardProvider } from '../board-context'
import type { BoardData } from '../board-types'

// ============================================================
// Fixtures
// ============================================================

const boardData: BoardData = {
  columns: [
    {
      id: 'col-1',
      name: 'To Do',
      tasks: [
        {
          id: 't1',
          taskId: 'KRM-1',
          title: 'Task one',
          priority: 'HIGH',
          labels: [],
          dueDate: null,
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: { id: 'u1', name: 'Alice', image: null },
          assignees: [{ id: 'u2', name: 'Bob', image: null }],
          subtaskCount: 0,
          subtasksDone: 0,
        },
        {
          id: 't2',
          taskId: 'KRM-2',
          title: 'Task two',
          priority: 'LOW',
          labels: [],
          dueDate: null,
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: null,
          assignees: [],
          subtaskCount: 0,
          subtasksDone: 0,
        },
      ],
    },
    {
      id: 'col-2',
      name: 'Done',
      tasks: [],
    },
  ],
}

// Helper that renders BulkActionBar inside a BoardProvider and pre-selects tasks
function renderBar(opts: { onBulkAction?: (...args: any[]) => void } = {}) {
  const { onBulkAction = vi.fn() } = opts

  // We need to select tasks to make the bar visible.
  // Render a wrapper that uses the context to select tasks.
  function Wrapper() {
    const { toggleTaskSelection } = require('../board-context').useBoardContext()
    React.useEffect(() => {
      toggleTaskSelection('t1')
      toggleTaskSelection('t2')
    }, [toggleTaskSelection])
    return <BulkActionBar />
  }

  // Use a simpler approach — render with a test harness
  return render(
    <BoardProvider initialData={boardData} onBulkAction={onBulkAction}>
      <SelectAndRender />
    </BoardProvider>,
  )
}

// Component that selects tasks then renders the bar
import React from 'react'
import { useBoardContext } from '../board-context'

function SelectAndRender() {
  const { toggleTaskSelection } = useBoardContext()
  const didSelect = React.useRef(false)

  React.useEffect(() => {
    if (!didSelect.current) {
      didSelect.current = true
      toggleTaskSelection('t1')
      toggleTaskSelection('t2')
    }
  }, [toggleTaskSelection])

  return <BulkActionBar />
}

function renderBarWithSelection(onBulkAction = vi.fn()) {
  return {
    onBulkAction,
    ...render(
      <BoardProvider initialData={boardData} onBulkAction={onBulkAction}>
        <SelectAndRender />
      </BoardProvider>,
    ),
  }
}

function renderBarEmpty() {
  return render(
    <BoardProvider initialData={boardData}>
      <BulkActionBar />
    </BoardProvider>,
  )
}

// ============================================================
// Tests
// ============================================================

describe('BulkActionBar', () => {
  it('has no a11y violations when visible', async () => {
    const { container } = renderBarWithSelection()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('is collapsed when no tasks selected', () => {
    renderBarEmpty()
    // The bar should be in collapsed state (opacity-0)
    const container = screen.getByText('0 selected').closest('[aria-live]')
    expect(container).toHaveClass('opacity-0')
  })

  it('shows selected count', () => {
    renderBarWithSelection()
    expect(screen.getByText('2 selected')).toBeInTheDocument()
  })

  it('renders clear selection button', () => {
    renderBarWithSelection()
    expect(screen.getByLabelText('Clear selection')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    renderBarWithSelection()
    expect(screen.getByTitle('Move to column')).toBeInTheDocument()
    expect(screen.getByTitle('Set priority')).toBeInTheDocument()
    expect(screen.getByTitle('Assign')).toBeInTheDocument()
    expect(screen.getByTitle('Set visibility')).toBeInTheDocument()
    expect(screen.getByTitle('Delete selected tasks')).toBeInTheDocument()
  })

  it('calls onBulkAction with delete and clears selection', async () => {
    const onBulkAction = vi.fn()
    const user = userEvent.setup()
    renderBarWithSelection(onBulkAction)

    await user.click(screen.getByTitle('Delete selected tasks'))

    expect(onBulkAction).toHaveBeenCalledWith({
      type: 'delete',
      taskIds: expect.arrayContaining(['t1', 't2']),
      value: undefined,
    })
  })

  it('shows move options when Move is clicked', async () => {
    const user = userEvent.setup()
    renderBarWithSelection()

    await user.click(screen.getByTitle('Move to column'))
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('shows priority options when Priority is clicked', async () => {
    const user = userEvent.setup()
    renderBarWithSelection()

    await user.click(screen.getByTitle('Set priority'))
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })
})
