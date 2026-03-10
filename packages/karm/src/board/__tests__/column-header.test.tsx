import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { ColumnHeader } from '../column-header'
import { BoardProvider } from '../board-context'
import type { BoardColumn, BoardData } from '../board-types'

// ============================================================
// Fixtures
// ============================================================

const baseColumn: BoardColumn = {
  id: 'col-1',
  name: 'In Progress',
  isClientVisible: false,
  tasks: [
    {
      id: 't1',
      taskId: 'KRM-1',
      title: 'Build login page',
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
      title: 'Write unit tests',
      priority: 'MEDIUM',
      labels: [],
      dueDate: null,
      isBlocked: false,
      visibility: 'INTERNAL',
      owner: { id: 'u1', name: 'Alice', image: null },
      assignees: [{ id: 'u3', name: 'Carol', image: null }],
      subtaskCount: 0,
      subtasksDone: 0,
    },
  ],
}

function makeBoardData(column: BoardColumn): BoardData {
  return { columns: [column] }
}

interface WrapperOptions {
  column?: BoardColumn
  onColumnRename?: (id: string, name: string) => void
  onColumnDelete?: (id: string) => void
  onColumnToggleVisibility?: (id: string, visible: boolean) => void
  onColumnWipLimitChange?: (id: string, limit: number | null) => void
  onTaskAdd?: (columnId: string, options: { title: string; ownerId?: string; dueDate?: string }) => void
}

function renderHeader(opts: WrapperOptions = {}) {
  const {
    column = baseColumn,
    onColumnRename = vi.fn(),
    onColumnDelete = vi.fn(),
    onColumnToggleVisibility = vi.fn(),
    onColumnWipLimitChange = vi.fn(),
    onTaskAdd = vi.fn(),
  } = opts

  return render(
    <BoardProvider
      initialData={makeBoardData(column)}
      onColumnRename={onColumnRename}
      onColumnDelete={onColumnDelete}
      onColumnToggleVisibility={onColumnToggleVisibility}
      onColumnWipLimitChange={onColumnWipLimitChange}
      onTaskAdd={onTaskAdd}
    >
      <ColumnHeader column={column} index={0} />
    </BoardProvider>,
  )
}

// ============================================================
// Tests
// ============================================================

describe('ColumnHeader', () => {
  it('has no a11y violations', async () => {
    const { container } = renderHeader()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders column name', () => {
    renderHeader()
    expect(screen.getByText(/In Progress/)).toBeInTheDocument()
  })

  it('renders accent dot', () => {
    const { container } = renderHeader()
    const dot = container.querySelector('.rounded-full.h-2\\.5')
    expect(dot).toBeInTheDocument()
  })

  it('renders task count in brackets next to column name', () => {
    renderHeader()
    const heading = screen.getByLabelText('In Progress, 2 tasks')
    expect(heading).toHaveTextContent('In Progress(2)')
  })

  // ---- WIP indicator ----

  it('renders WIP limit badge when wipLimit is set', () => {
    const column: BoardColumn = { ...baseColumn, wipLimit: 5 }
    renderHeader({ column })
    expect(screen.getByLabelText('WIP limit: 5')).toHaveTextContent('/ 5')
  })

  it('renders WIP exceeded styling when tasks exceed limit', () => {
    const column: BoardColumn = { ...baseColumn, wipLimit: 1 }
    renderHeader({ column })
    const badge = screen.getByLabelText('WIP limit: 1, exceeded')
    expect(badge).toHaveTextContent('/ 1')
    expect(badge).toHaveClass('text-error')
  })

  it('renders WIP badge without exceeded styling when tasks equal limit', () => {
    const column: BoardColumn = { ...baseColumn, wipLimit: 2 }
    renderHeader({ column })
    const badge = screen.getByLabelText('WIP limit: 2')
    expect(badge).not.toHaveClass('text-error')
  })

  // ---- Avatar stack ----

  it('renders AvatarGroup with unique members across tasks', () => {
    renderHeader()
    // AvatarGroup renders 2-char initials: Alice→AL, Bob→BO, Carol→CA
    expect(screen.getByText('AL')).toBeInTheDocument()
    expect(screen.getByText('BO')).toBeInTheDocument()
    expect(screen.getByText('CA')).toBeInTheDocument()
  })

  // ---- Rename ----

  it('enters rename mode on double-click of column name', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.dblClick(screen.getByText(/In Progress/))
    expect(screen.getByLabelText('Column name')).toBeInTheDocument()
  })

  it('calls onColumnRename with trimmed name on Enter', async () => {
    const onColumnRename = vi.fn()
    const user = userEvent.setup()
    renderHeader({ onColumnRename })

    await user.dblClick(screen.getByText(/In Progress/))
    const input = screen.getByLabelText('Column name')
    await user.clear(input)
    await user.type(input, 'Doing{Enter}')

    expect(onColumnRename).toHaveBeenCalledWith('col-1', 'Doing')
  })

  it('cancels rename on Escape without calling onColumnRename', async () => {
    const onColumnRename = vi.fn()
    const user = userEvent.setup()
    renderHeader({ onColumnRename })

    await user.dblClick(screen.getByText(/In Progress/))
    await user.keyboard('{Escape}')

    expect(onColumnRename).not.toHaveBeenCalled()
    expect(screen.getByText(/In Progress/)).toBeInTheDocument()
  })

  // ---- Column menu: Visibility ----

  it('shows "Show to client" when isClientVisible is false', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByLabelText('Column options'))
    expect(screen.getByText('Show to client')).toBeInTheDocument()
  })

  it('shows "Hide from client" when isClientVisible is true', async () => {
    const user = userEvent.setup()
    const column: BoardColumn = { ...baseColumn, isClientVisible: true }
    renderHeader({ column })
    await user.click(screen.getByLabelText('Column options'))
    expect(screen.getByText('Hide from client')).toBeInTheDocument()
  })

  it('calls onColumnToggleVisibility when clicked', async () => {
    const onColumnToggleVisibility = vi.fn()
    const user = userEvent.setup()
    renderHeader({ onColumnToggleVisibility })

    await user.click(screen.getByLabelText('Column options'))
    await user.click(screen.getByText('Show to client'))

    expect(onColumnToggleVisibility).toHaveBeenCalledWith('col-1', true)
  })

  // ---- Column menu: Delete ----

  it('calls onColumnDelete when "Delete column" is clicked', async () => {
    const onColumnDelete = vi.fn()
    const user = userEvent.setup()
    renderHeader({ onColumnDelete })

    await user.click(screen.getByLabelText('Column options'))
    await user.click(screen.getByText('Delete column'))

    expect(onColumnDelete).toHaveBeenCalledWith('col-1')
  })

  // ---- Add task ----

  it('renders add task button', () => {
    renderHeader()
    expect(screen.getByLabelText('Add task')).toBeInTheDocument()
  })

  it('shows task title input after clicking add task button', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByLabelText('Add task'))
    expect(screen.getByLabelText('New task title')).toBeInTheDocument()
  })

  it('calls onTaskAdd with options object on Enter', async () => {
    const onTaskAdd = vi.fn()
    const user = userEvent.setup()
    renderHeader({ onTaskAdd })

    await user.click(screen.getByLabelText('Add task'))
    await user.type(screen.getByLabelText('New task title'), 'New feature{Enter}')

    expect(onTaskAdd).toHaveBeenCalledWith('col-1', {
      title: 'New feature',
      ownerId: null,
      dueDate: null,
    })
  })

  it('collapses add task form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByLabelText('Add task'))
    await user.click(screen.getByRole('button', { name: 'Cancel adding task' }))

    // Form is still in DOM but collapsed and unfocusable
    expect(screen.getByLabelText('New task title')).toHaveAttribute('tabindex', '-1')
  })

  // ---- Accent color cycling ----

  it('uses different accent colors for different indices', () => {
    const { container: c0 } = render(
      <BoardProvider initialData={makeBoardData(baseColumn)}>
        <ColumnHeader column={baseColumn} index={0} />
      </BoardProvider>,
    )
    const { container: c1 } = render(
      <BoardProvider initialData={makeBoardData(baseColumn)}>
        <ColumnHeader column={baseColumn} index={1} />
      </BoardProvider>,
    )
    const dot0 = c0.querySelector('.rounded-full.h-2\\.5')
    const dot1 = c1.querySelector('.rounded-full.h-2\\.5')
    expect(dot0?.className).not.toEqual(dot1?.className)
  })
})
