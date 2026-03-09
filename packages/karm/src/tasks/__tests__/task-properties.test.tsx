import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { TaskProperties } from '../task-properties'
import type { TaskData, Member, Column } from '../task-properties'

const mockMembers: Member[] = [
  { id: 'user-1', name: 'Alice Smith', email: 'alice@test.com', image: null },
  { id: 'user-2', name: 'Bob Jones', email: 'bob@test.com', image: null },
]

const mockColumns: Column[] = [
  { id: 'col-1', name: 'To Do', isDefault: true },
  { id: 'col-2', name: 'In Progress' },
  { id: 'col-3', name: 'Done', isTerminal: true },
]

const mockTask: TaskData = {
  id: 'task-1',
  columnId: 'col-1',
  column: { id: 'col-1', name: 'To Do' },
  ownerId: 'user-1',
  owner: mockMembers[0],
  assignees: [{ user: mockMembers[0] }],
  priority: 'HIGH',
  dueDate: '2026-04-01T00:00:00Z',
  labels: ['frontend', 'auth'],
  visibility: 'INTERNAL',
}

describe('TaskProperties', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders column name', () => {
    render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    )
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders owner name', () => {
    render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    )
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders priority indicator', () => {
    render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    )
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('renders labels', () => {
    render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    )
    expect(screen.getByText('frontend')).toBeInTheDocument()
    expect(screen.getByText('auth')).toBeInTheDocument()
  })

  it('renders visibility indicator', () => {
    render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
      />,
    )
    expect(screen.getByText('Internal')).toBeInTheDocument()
  })

  it('renders read-only column in readOnly mode', () => {
    render(
      <TaskProperties
        task={mockTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByText('To Do')).toBeInTheDocument()
    // Owner row should be hidden in readOnly mode
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
  })

  it('shows "None" for empty assignees in readOnly mode', () => {
    const noAssigneesTask: TaskData = {
      ...mockTask,
      assignees: [],
    }
    render(
      <TaskProperties
        task={noAssigneesTask}
        columns={mockColumns}
        members={mockMembers}
        onUpdate={vi.fn()}
        onAssign={vi.fn()}
        onUnassign={vi.fn()}
        readOnly
      />,
    )
    expect(screen.getByText('None')).toBeInTheDocument()
  })
})
