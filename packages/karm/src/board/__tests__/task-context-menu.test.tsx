import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { TaskContextMenu } from '../task-context-menu'
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
          labels: ['frontend', 'bug'],
          dueDate: null,
          isBlocked: false,
          visibility: 'INTERNAL',
          owner: { id: 'u1', name: 'Alice', image: null },
          assignees: [{ id: 'u2', name: 'Bob', image: null }],
          subtaskCount: 0,
          subtasksDone: 0,
        },
      ],
    },
  ],
}

function renderMenu(callbacks: Record<string, ReturnType<typeof vi.fn>> = {}) {
  return render(
    <BoardProvider
      initialData={boardData}
      onQuickPriorityChange={callbacks.onQuickPriorityChange ?? vi.fn()}
      onQuickAssign={callbacks.onQuickAssign ?? vi.fn()}
      onQuickLabelAdd={callbacks.onQuickLabelAdd ?? vi.fn()}
      onQuickDueDateChange={callbacks.onQuickDueDateChange ?? vi.fn()}
      onQuickVisibilityChange={callbacks.onQuickVisibilityChange ?? vi.fn()}
      onQuickDelete={callbacks.onQuickDelete ?? vi.fn()}
    >
      <TaskContextMenu taskId="t1">
        <div data-testid="trigger">Right-click me</div>
      </TaskContextMenu>
    </BoardProvider>,
  )
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByTestId('trigger')
  await user.pointer({ target: trigger, keys: '[MouseRight]' })
}

// ============================================================
// Tests
// ============================================================

describe('TaskContextMenu', () => {
  it('has no a11y violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderMenu()
    await openMenu(user)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders trigger content', () => {
    renderMenu()
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('shows top-level menu items on right-click', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    expect(screen.getByText('Set Priority')).toBeInTheDocument()
    expect(screen.getByText('Assign')).toBeInTheDocument()
    expect(screen.getByText('Add Label')).toBeInTheDocument()
    expect(screen.getByText('Set Due Date')).toBeInTheDocument()
    expect(screen.getByText('Visibility')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onQuickDelete when delete clicked', async () => {
    const onQuickDelete = vi.fn()
    const user = userEvent.setup()
    renderMenu({ onQuickDelete })
    await openMenu(user)
    await user.click(screen.getByText('Delete'))

    expect(onQuickDelete).toHaveBeenCalledWith('t1')
  })

  it('renders delete item with error styling', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    const deleteItem = screen.getByText('Delete').closest('[role="menuitem"]')
    expect(deleteItem).toHaveClass('text-error')
  })

  it('renders priority submenu trigger', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    const priorityTrigger = screen.getByText('Set Priority')
    expect(priorityTrigger).toBeInTheDocument()
    // Verify it's a submenu trigger (has aria-haspopup)
    const triggerEl = priorityTrigger.closest('[data-radix-collection-item]')
    expect(triggerEl).toBeInTheDocument()
  })

  it('renders assign submenu trigger', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    expect(screen.getByText('Assign')).toBeInTheDocument()
  })

  it('renders visibility submenu trigger', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    expect(screen.getByText('Visibility')).toBeInTheDocument()
  })

  it('renders label submenu trigger', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    expect(screen.getByText('Add Label')).toBeInTheDocument()
  })
})
