import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { KanbanBoard } from '../kanban-board'
import type { BoardData } from '../kanban-board'

const minimalBoard: BoardData = {
  columns: [
    {
      id: 'col-1',
      name: 'To Do',
      tasks: [
        {
          id: 'task-1',
          title: 'Write tests',
          priority: 'MEDIUM',
          labels: ['dev'],
          dueDate: null,
          isBlocked: false,
          assignees: [],
        },
      ],
    },
    {
      id: 'col-2',
      name: 'In Progress',
      tasks: [],
    },
  ],
}

describe('KanbanBoard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <KanbanBoard initialData={minimalBoard} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders column names', () => {
    const { getByText } = render(
      <KanbanBoard initialData={minimalBoard} />,
    )
    expect(getByText('To Do')).toBeInTheDocument()
    expect(getByText('In Progress')).toBeInTheDocument()
  })

  it('renders task titles', () => {
    const { getByText } = render(
      <KanbanBoard initialData={minimalBoard} />,
    )
    expect(getByText('Write tests')).toBeInTheDocument()
  })

  it('renders add column button', () => {
    const onAddColumn = vi.fn()
    const { getByText } = render(
      <KanbanBoard initialData={minimalBoard} onAddColumn={onAddColumn} />,
    )
    expect(getByText('Add column')).toBeInTheDocument()
  })
})
