import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BoardColumn } from '../board-column'
import { BoardProvider } from '../board-context'
import type { BoardColumn as BoardColumnType, BoardData, BoardTask } from '../board-types'

const mockTask: BoardTask = {
  id: 'task-1',
  taskId: 'KRM-1',
  title: 'First task',
  priority: 'LOW',
  labels: [],
  dueDate: null,
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: { id: 'u1', name: 'Alice', image: null },
  assignees: [],
  subtaskCount: 0,
  subtasksDone: 0,
}

const columnData: BoardColumnType = {
  id: 'col-1',
  name: 'To Do',
  isClientVisible: false,
  tasks: [mockTask],
}

function renderColumn(column: BoardColumnType = columnData) {
  const data: BoardData = { columns: [column] }
  return render(
    <BoardProvider initialData={data}>
      <DndContext>
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <BoardColumn column={column} index={0} />
        </SortableContext>
      </DndContext>
    </BoardProvider>,
  )
}

describe('BoardColumn', () => {
  it('has no a11y violations', async () => {
    const { container } = renderColumn()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders column name via ColumnHeader', () => {
    renderColumn()
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders task count', () => {
    renderColumn()
    expect(screen.getByLabelText('1 tasks')).toBeInTheDocument()
  })

  it('renders tasks in default mode', () => {
    renderColumn()
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('KRM-1')).toBeInTheDocument()
  })

  it('renders add task button at bottom', () => {
    renderColumn()
    expect(screen.getByText('Add task')).toBeInTheDocument()
  })

  it('renders empty state with illustration when no tasks', () => {
    const emptyColumn: BoardColumnType = { ...columnData, tasks: [] }
    const { container } = renderColumn(emptyColumn)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders WIP exceeded tint when over limit', () => {
    const wipColumn: BoardColumnType = {
      ...columnData,
      wipLimit: 0,
      tasks: [mockTask],
    }
    const { container } = renderColumn(wipColumn)
    // The column root div should have the error surface tint
    const columnEl = container.firstChild as HTMLElement
    expect(columnEl.className).toContain('bg-error-surface')
  })
})
