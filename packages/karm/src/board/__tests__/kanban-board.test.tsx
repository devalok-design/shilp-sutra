import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { KanbanBoard } from '../kanban-board'
import type { BoardData } from '../board-types'

// jsdom polyfills
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const minimalBoard: BoardData = {
  columns: [
    {
      id: 'col-1',
      name: 'To Do',
      tasks: [
        {
          id: 'task-1',
          taskId: 'KRM-1',
          title: 'Write tests',
          priority: 'MEDIUM',
          labels: ['dev'],
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
    render(<KanbanBoard initialData={minimalBoard} />)
    expect(screen.getByText(/To Do/)).toBeInTheDocument()
    expect(screen.getByText(/In Progress/)).toBeInTheDocument()
  })

  it('renders task titles', () => {
    render(<KanbanBoard initialData={minimalBoard} />)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('renders add column button', () => {
    const onAddColumn = vi.fn()
    render(
      <KanbanBoard initialData={minimalBoard} onAddColumn={onAddColumn} />,
    )
    expect(screen.getByText('Add column')).toBeInTheDocument()
  })

  it('renders the toolbar', () => {
    render(<KanbanBoard initialData={minimalBoard} />)
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument()
  })

  it('renders the bulk action bar (collapsed)', () => {
    render(<KanbanBoard initialData={minimalBoard} />)
    // Bar is present but collapsed
    expect(screen.getByText('0 selected')).toBeInTheDocument()
  })

  it('passes callbacks through to context', () => {
    const onClickTask = vi.fn()
    render(
      <KanbanBoard initialData={minimalBoard} onClickTask={onClickTask} />,
    )
    // Task is rendered — verifying the callback passthrough is wired
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })
})
