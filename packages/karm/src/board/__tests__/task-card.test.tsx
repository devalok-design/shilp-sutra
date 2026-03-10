import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from '../task-card'
import { BoardProvider } from '../board-context'
import type { BoardTask } from '../board-types'

const mockTask: BoardTask = {
  id: '1',
  taskId: 'KRM-42',
  title: 'Implement authentication flow',
  priority: 'HIGH',
  labels: ['frontend', 'auth'],
  dueDate: new Date().toISOString(),
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: { id: 'u1', name: 'Alice', image: null },
  assignees: [{ id: 'u2', name: 'Bob', image: null }],
  subtaskCount: 5,
  subtasksDone: 3,
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [mockTask] }] }}>
      <DndContext>
        <SortableContext items={[mockTask.id]} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </BoardProvider>
  )
}

describe('TaskCard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders task ID', () => {
    render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(screen.getByText('KRM-42')).toBeInTheDocument()
  })

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(screen.getByText('Implement authentication flow')).toBeInTheDocument()
  })

  it('renders labels', () => {
    render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('auth')).toBeInTheDocument()
  })

  it('renders subtask progress', () => {
    render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('renders owner avatar initials', () => {
    render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders blocked indicator when blocked', () => {
    const blockedTask = { ...mockTask, isBlocked: true }
    render(<TaskCard task={blockedTask} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [blockedTask] }] }}>
          <DndContext>
            <SortableContext items={[blockedTask.id]} strategy={verticalListSortingStrategy}>
              {children}
            </SortableContext>
          </DndContext>
        </BoardProvider>
      ),
    })
    expect(screen.getByLabelText('Blocked')).toBeInTheDocument()
  })

  it('renders visibility badge when EVERYONE', () => {
    const publicTask = { ...mockTask, visibility: 'EVERYONE' as const }
    render(<TaskCard task={publicTask} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [publicTask] }] }}>
          <DndContext>
            <SortableContext items={[publicTask.id]} strategy={verticalListSortingStrategy}>
              {children}
            </SortableContext>
          </DndContext>
        </BoardProvider>
      ),
    })
    expect(screen.getByLabelText('Client visible')).toBeInTheDocument()
  })

  it('renders drag handle', () => {
    render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    expect(screen.getByLabelText(/drag handle/i)).toBeInTheDocument()
  })

  it('does not render labels row when no labels', () => {
    const noLabelsTask = { ...mockTask, labels: [] }
    render(<TaskCard task={noLabelsTask} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [noLabelsTask] }] }}>
          <DndContext>
            <SortableContext items={[noLabelsTask.id]} strategy={verticalListSortingStrategy}>
              {children}
            </SortableContext>
          </DndContext>
        </BoardProvider>
      ),
    })
    expect(screen.queryByText('frontend')).not.toBeInTheDocument()
  })

  it('does not render subtask progress when subtaskCount is 0', () => {
    const noSubtaskTask = { ...mockTask, subtaskCount: 0, subtasksDone: 0 }
    render(<TaskCard task={noSubtaskTask} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [noSubtaskTask] }] }}>
          <DndContext>
            <SortableContext items={[noSubtaskTask.id]} strategy={verticalListSortingStrategy}>
              {children}
            </SortableContext>
          </DndContext>
        </BoardProvider>
      ),
    })
    expect(screen.queryByText('0/0')).not.toBeInTheDocument()
  })

  it('shows overflow count for more than 3 labels', () => {
    const manyLabelsTask = { ...mockTask, labels: ['a', 'b', 'c', 'd', 'e'] }
    render(<TaskCard task={manyLabelsTask} />, {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [manyLabelsTask] }] }}>
          <DndContext>
            <SortableContext items={[manyLabelsTask.id]} strategy={verticalListSortingStrategy}>
              {children}
            </SortableContext>
          </DndContext>
        </BoardProvider>
      ),
    })
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('renders priority icon for HIGH priority', () => {
    const { container } = render(<TaskCard task={mockTask} />, { wrapper: Wrapper })
    // HIGH uses IconArrowUp which renders an svg with tabler-icon-arrow-up class
    const icon = container.querySelector('.tabler-icon-arrow-up')
    expect(icon).toBeInTheDocument()
  })
})
