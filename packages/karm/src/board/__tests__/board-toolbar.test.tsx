import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { BoardToolbar } from '../board-toolbar'
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
          title: 'Build login page',
          priority: 'HIGH',
          labels: ['frontend', 'auth'],
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
          title: 'Write tests',
          priority: 'LOW',
          labels: ['testing'],
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: { id: 'u2', name: 'Bob', image: null },
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

function renderToolbar() {
  return render(
    <BoardProvider initialData={boardData}>
      <BoardToolbar />
    </BoardProvider>,
  )
}

// ============================================================
// Tests
// ============================================================

describe('BoardToolbar', () => {
  it('has no a11y violations', async () => {
    const { container } = renderToolbar()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders search input', () => {
    renderToolbar()
    expect(screen.getByLabelText('Search tasks')).toBeInTheDocument()
  })

  it('renders priority filter button', () => {
    renderToolbar()
    expect(screen.getByTitle('Filter by priority')).toBeInTheDocument()
  })

  it('renders assignee filter button', () => {
    renderToolbar()
    expect(screen.getByTitle('Filter by assignee')).toBeInTheDocument()
  })

  it('renders due date filter button', () => {
    renderToolbar()
    expect(screen.getByTitle('Filter by due date')).toBeInTheDocument()
  })

  it('renders view mode toggle', () => {
    renderToolbar()
    expect(screen.getByText('Board')).toBeInTheDocument()
    expect(screen.getByText('Compact')).toBeInTheDocument()
  })

  it('renders my tasks toggle', () => {
    renderToolbar()
    expect(screen.getByLabelText('Highlight my tasks')).toBeInTheDocument()
  })

  // ---- Search ----

  it('updates search input value on type', async () => {
    const user = userEvent.setup()
    renderToolbar()
    const input = screen.getByLabelText('Search tasks')
    await user.type(input, 'login')
    expect(input).toHaveValue('login')
  })

  it('shows clear button when search has value', async () => {
    const user = userEvent.setup()
    renderToolbar()
    await user.type(screen.getByLabelText('Search tasks'), 'test')
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  // ---- Priority filter ----

  it('opens priority filter dropdown and shows options', async () => {
    const user = userEvent.setup()
    renderToolbar()
    await user.click(screen.getByTitle('Filter by priority'))
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Urgent')).toBeInTheDocument()
  })

  it('shows filter chip after selecting a priority', async () => {
    const user = userEvent.setup()
    renderToolbar()
    await user.click(screen.getByTitle('Filter by priority'))
    await user.click(screen.getByText('High'))
    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  // ---- Assignee filter ----

  it('opens assignee filter with unique members', async () => {
    const user = userEvent.setup()
    renderToolbar()
    await user.click(screen.getByTitle('Filter by assignee'))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  // ---- View mode ----

  it('switches view mode via segmented control', async () => {
    const user = userEvent.setup()
    renderToolbar()
    await user.click(screen.getByText('Compact'))
    // SegmentedControl should reflect the change (aria-selected)
    const compactButton = screen.getByText('Compact').closest('button')
    expect(compactButton).toHaveAttribute('aria-selected', 'true')
  })

  // ---- Clear all ----

  it('hides chips when clear all is clicked', async () => {
    const user = userEvent.setup()
    renderToolbar()

    // Add a priority filter
    await user.click(screen.getByTitle('Filter by priority'))
    await user.click(screen.getByText('High'))

    // Clear all
    await user.click(screen.getByLabelText('Clear all filters'))
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
  })
})
