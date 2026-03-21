import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask } from '../task-panel-types'
import { TaskPanelDescription } from '../task-panel-description'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTask: TaskPanelTask = {
  id: '1',
  taskId: 'KRM-847',
  title: 'Fix login bug',
  description: 'This is the task description with details about the bug.',
  descriptionUpdatedBy: { name: 'Bob', timestamp: '2026-03-21T10:00:00Z' },
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
  subtasks: [],
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
      <TaskPanelDescription />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelDescription', () => {
  it('renders description content', () => {
    renderWithProvider()
    expect(
      screen.getByText(
        'This is the task description with details about the bug.',
      ),
    ).toBeInTheDocument()
  })

  it('shows byline when descriptionUpdatedBy exists', () => {
    renderWithProvider()
    expect(screen.getByText(/Last edited by Bob/)).toBeInTheDocument()
  })

  it('client mode: no edit interaction, no byline', () => {
    renderWithProvider({ clientMode: true })
    // Description text is visible
    expect(
      screen.getByText(
        'This is the task description with details about the bug.',
      ),
    ).toBeInTheDocument()
    // No byline
    expect(screen.queryByText(/Last edited by/)).not.toBeInTheDocument()
    // No button role on the description (read-only)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('empty state renders placeholder for staff', () => {
    renderWithProvider({
      task: { ...mockTask, description: '', descriptionUpdatedBy: undefined },
    })
    expect(screen.getByText('Add a description...')).toBeInTheDocument()
  })

  it('empty state renders nothing for client', () => {
    const { container } = renderWithProvider({
      task: { ...mockTask, description: '', descriptionUpdatedBy: undefined },
      clientMode: true,
    })
    // Component returns null for empty + client
    expect(container.innerHTML).toBe('')
  })

  it('clicking description in staff mode enters edit mode', async () => {
    renderWithProvider()
    const descButton = screen.getByRole('button')
    await userEvent.click(descButton)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
