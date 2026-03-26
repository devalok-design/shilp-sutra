import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask } from '../task-panel-types'
import { TaskPanelQuickProps } from '../task-panel-quick-props'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockTask: TaskPanelTask = {
  id: '1',
  taskId: 'KRM-847',
  title: 'Fix login bug',
  description: '',
  status: 'in-progress',
  statusOptions: [
    { id: 'todo', name: 'To Do' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'done', name: 'Done' },
  ],
  priority: 'HIGH',
  assignees: [{ id: 'u1', name: 'Jane Doe', image: null }],
  leads: [],
  members: [
    { id: 'u1', name: 'Jane Doe', image: null },
    { id: 'u2', name: 'John Smith', image: null },
  ],
  dueDate: '2027-04-01T00:00:00Z',
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
      <TaskPanelQuickProps />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelQuickProps', () => {
  it('renders all 4 pills with correct content', () => {
    renderWithProvider()

    // Status pill shows status name
    expect(screen.getByText('In Progress')).toBeInTheDocument()

    // Assignee pill shows name
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()

    // Priority pill shows level
    expect(screen.getByText('High')).toBeInTheDocument()

    // Due date pill shows formatted date
    expect(screen.getByText('Apr 1')).toBeInTheDocument()
  })

  it('renders pills as non-interactive in client mode', () => {
    renderWithProvider({ clientMode: true })

    // All pills should be <span> elements, not buttons
    const statusPill = screen.getByTestId('status-pill')
    expect(statusPill.tagName).toBe('SPAN')

    const assigneePill = screen.getByTestId('assignee-pill')
    expect(assigneePill.tagName).toBe('SPAN')

    const priorityPill = screen.getByTestId('priority-pill')
    expect(priorityPill.tagName).toBe('SPAN')

    const dueDatePill = screen.getByTestId('due-date-pill')
    expect(dueDatePill.tagName).toBe('SPAN')
  })

  it('status pill opens popover on click in staff mode', async () => {
    const onUpdateStatus = vi.fn()
    renderWithProvider({ onUpdateStatus })

    const statusPill = screen.getByTestId('status-pill')
    expect(statusPill.tagName).toBe('BUTTON')

    await userEvent.click(statusPill)

    // Popover should show all status options
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('calls onUpdateStatus when a status option is selected', async () => {
    const onUpdateStatus = vi.fn()
    renderWithProvider({ onUpdateStatus })

    await userEvent.click(screen.getByTestId('status-pill'))
    await userEvent.click(screen.getByText('Done'))

    expect(onUpdateStatus).toHaveBeenCalledWith('done')
  })

  it('shows "Unassigned" when assignees is empty', () => {
    renderWithProvider({
      task: { ...mockTask, assignees: [] },
    })

    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('shows "No due date" when dueDate is null', () => {
    renderWithProvider({
      task: { ...mockTask, dueDate: null },
    })

    expect(screen.getByText('No due date')).toBeInTheDocument()
  })

  it('renders peek triage row in peek mode (staff)', () => {
    renderWithProvider({ mode: 'peek' })

    expect(screen.getByTestId('peek-triage-row')).toBeInTheDocument()
  })

  it('does not render peek triage row in side mode', () => {
    renderWithProvider({ mode: 'side' })

    expect(screen.queryByTestId('peek-triage-row')).not.toBeInTheDocument()
  })

  it('does not render peek triage row in peek mode (client)', () => {
    renderWithProvider({ mode: 'peek', clientMode: true })

    expect(screen.queryByTestId('peek-triage-row')).not.toBeInTheDocument()
  })
})
