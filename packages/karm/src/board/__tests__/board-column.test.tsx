import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { DndContext } from '@dnd-kit/core'
import { BoardColumn } from '../board-column'
import type { BoardColumnData } from '../board-column'

const columnData: BoardColumnData = {
  id: 'col-1',
  name: 'To Do',
  isClientVisible: false,
  tasks: [
    {
      id: 'task-1',
      title: 'First task',
      priority: 'LOW',
      labels: [],
      dueDate: null,
      isBlocked: false,
      assignees: [],
    },
  ],
}

function renderColumn(column: BoardColumnData = columnData) {
  return render(
    <DndContext>
      <BoardColumn
        column={column}
        index={0}
        onAddTask={vi.fn()}
      />
    </DndContext>,
  )
}

describe('BoardColumn', () => {
  it('has no a11y violations', async () => {
    const { container } = renderColumn()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders column name', () => {
    const { getByText } = renderColumn()
    expect(getByText('To Do')).toBeInTheDocument()
  })

  it('renders task count', () => {
    const { getByText } = renderColumn()
    expect(getByText('1')).toBeInTheDocument()
  })

  it('renders add task button', () => {
    const { getByText } = renderColumn()
    expect(getByText('Add task')).toBeInTheDocument()
  })

  it('renders empty state when no tasks', () => {
    const emptyColumn: BoardColumnData = {
      ...columnData,
      tasks: [],
    }
    const { getByText } = renderColumn(emptyColumn)
    expect(getByText('No tasks')).toBeInTheDocument()
  })

  it('shows client visibility indicator when isClientVisible', () => {
    const visibleColumn: BoardColumnData = {
      ...columnData,
      isClientVisible: true,
    }
    const { getByLabelText } = renderColumn(visibleColumn)
    expect(getByLabelText('Visible to client')).toBeInTheDocument()
  })
})
