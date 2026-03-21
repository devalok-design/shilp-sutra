import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask } from '../task-panel-types'
import { TaskPanelSubtasks } from '../task-panel-subtasks'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTask: TaskPanelTask = {
  id: '1',
  taskId: 'KRM-847',
  title: 'Fix login bug',
  description: '',
  status: 'in-progress',
  statusOptions: [{ id: 'in-progress', name: 'In Progress' }],
  priority: 'HIGH',
  assignee: null,
  lead: null,
  members: [],
  dueDate: null,
  labels: [],
  visibility: 'INTERNAL',
  createdAt: '2026-03-21T00:00:00Z',
  updatedAt: '2026-03-21T00:00:00Z',
  subtasks: [
    {
      id: 's1',
      title: 'Write tests',
      priority: 'HIGH',
      columnId: 'col-1',
      column: { id: 'col-1', name: 'In Progress', isTerminal: false },
      assignees: [],
    },
    {
      id: 's2',
      title: 'Fix bug',
      priority: 'MEDIUM',
      columnId: 'col-2',
      column: { id: 'col-2', name: 'Done', isTerminal: true },
      assignees: [],
    },
  ],
  isInReview: false,
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderWithProvider(
  props?: Partial<Omit<TaskPanelProviderProps, 'children'>>,
) {
  return render(
    <TaskPanelProvider
      task={mockTask}
      mode="side"
      clientMode={false}
      currentUserId="user-1"
      timeline={[]}
      {...props}
    >
      <TaskPanelSubtasks />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelSubtasks', () => {
  it('renders collapsed strip with correct count', () => {
    renderWithProvider()
    expect(screen.getByText('Subtasks')).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('expands to show subtask items on click', async () => {
    renderWithProvider()
    // Click the strip to expand
    await userEvent.click(screen.getByText('Subtasks'))
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('Fix bug')).toBeInTheDocument()
  })

  it('toggle calls onToggleSubtask', async () => {
    const onToggleSubtask = vi.fn()
    renderWithProvider({ onToggleSubtask })

    // Expand first
    await userEvent.click(screen.getByText('Subtasks'))

    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    expect(onToggleSubtask).toHaveBeenCalledWith('s1')
  })

  it('hidden in peek mode', () => {
    const { container } = renderWithProvider({ mode: 'peek' })
    expect(container.innerHTML).toBe('')
  })

  it('client mode: expands and shows disabled checkboxes', async () => {
    renderWithProvider({ clientMode: true })

    // Expand
    await userEvent.click(screen.getByText('Subtasks'))

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => {
      expect(cb).toBeDisabled()
    })
  })

  it('empty state shows add prompt for staff', () => {
    renderWithProvider({
      task: { ...mockTask, subtasks: [] },
    })
    expect(
      screen.getByText('+ Break this into subtasks'),
    ).toBeInTheDocument()
  })

  it('empty state renders nothing for client', () => {
    const { container } = renderWithProvider({
      task: { ...mockTask, subtasks: [] },
      clientMode: true,
    })
    // Component returns null for empty + client
    expect(container.innerHTML).toBe('')
  })
})
