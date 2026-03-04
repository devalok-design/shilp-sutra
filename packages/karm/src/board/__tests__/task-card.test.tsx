import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { TaskCard } from '../task-card'
import type { BoardTask } from '../task-card'

const minimalTask: BoardTask = {
  id: 'task-1',
  title: 'Implement feature',
  priority: 'HIGH',
  labels: ['frontend', 'urgent'],
  dueDate: null,
  isBlocked: false,
  assignees: [
    { id: 'user-1', name: 'Alice Smith', image: null },
  ],
}

function renderTaskCard(task: BoardTask = minimalTask) {
  return render(
    <DndContext>
      <SortableContext items={[task.id]}>
        <TaskCard task={task} />
      </SortableContext>
    </DndContext>,
  )
}

describe('TaskCard', () => {
  it('has no a11y violations', async () => {
    const { container } = renderTaskCard()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders task title', () => {
    const { getByText } = renderTaskCard()
    expect(getByText('Implement feature')).toBeInTheDocument()
  })

  it('renders labels', () => {
    const { getByText } = renderTaskCard()
    expect(getByText('frontend')).toBeInTheDocument()
    expect(getByText('urgent')).toBeInTheDocument()
  })

  it('renders assignee avatar fallback', () => {
    const { getByText } = renderTaskCard()
    expect(getByText('AS')).toBeInTheDocument()
  })

  it('renders drag handle with accessible label', () => {
    const { getByLabelText } = renderTaskCard()
    expect(getByLabelText(/drag handle for task/i)).toBeInTheDocument()
  })

  it('renders blocked indicator', () => {
    const blockedTask: BoardTask = {
      ...minimalTask,
      isBlocked: true,
    }
    const { container } = renderTaskCard(blockedTask)
    expect(container.querySelector('.border-l-error')).toBeInTheDocument()
  })
})
