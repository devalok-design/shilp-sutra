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
  it('renders description preview when collapsed', () => {
    renderWithProvider()
    // The 2-line preview is shown in the collapsed state
    expect(
      screen.getByText(
        'This is the task description with details about the bug.',
      ),
    ).toBeInTheDocument()
  })

  it('shows byline when expanded and descriptionUpdatedBy exists', async () => {
    renderWithProvider()
    // Expand the description
    const toggleBtn = screen.getByRole('button')
    await userEvent.click(toggleBtn)
    expect(screen.getByText(/Last edited by Bob/)).toBeInTheDocument()
  })

  it('client mode: shows description text, no byline, expand toggle still works', async () => {
    renderWithProvider({ clientMode: true })
    // Description preview text is visible
    expect(
      screen.getByText(
        'This is the task description with details about the bug.',
      ),
    ).toBeInTheDocument()
    // Expand to check no byline
    const toggleBtn = screen.getByRole('button')
    await userEvent.click(toggleBtn)
    // No byline in client mode
    expect(screen.queryByText(/Last edited by/)).not.toBeInTheDocument()
  })

  it('empty state renders placeholder for staff', () => {
    renderWithProvider({
      task: { ...mockTask, description: '', descriptionUpdatedBy: undefined },
    })
    expect(
      screen.getByText('+ Add a description...'),
    ).toBeInTheDocument()
  })

  it('empty state renders nothing for client', () => {
    const { container } = renderWithProvider({
      task: { ...mockTask, description: '', descriptionUpdatedBy: undefined },
      clientMode: true,
    })
    // Component returns null for empty + client
    expect(container.innerHTML).toBe('')
  })

  it('clicking description text in staff mode enters edit mode', async () => {
    renderWithProvider()
    // First expand the description by clicking the collapsed preview button
    const expandBtn = screen.getByRole('button')
    await userEvent.click(expandBtn)
    // Now click the description text (which has role="button" tabIndex=0 in expanded mode)
    const descText = screen.getByRole('button', {
      name: 'This is the task description with details about the bug.',
    })
    await userEvent.click(descText)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
