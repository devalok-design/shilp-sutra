import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask } from '../task-panel-types'
import { TaskPanelHeader } from '../task-panel-header'

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
  assignees: [],
  leads: [],
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
      <TaskPanelHeader />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelHeader', () => {
  it('renders task ID and title', () => {
    renderWithProvider()
    expect(screen.getByText('KRM-847')).toBeInTheDocument()
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    renderWithProvider({ onClose })

    const closeBtn = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('hides expand button in full mode', () => {
    renderWithProvider({ mode: 'full' })

    expect(
      screen.queryByRole('button', { name: /expand/i }),
    ).not.toBeInTheDocument()
  })

  it('shows expand button in side mode', () => {
    renderWithProvider({ mode: 'side' })

    expect(
      screen.getByRole('button', { name: /expand/i }),
    ).toBeInTheDocument()
  })

  it('calls onExpand when expand button is clicked', async () => {
    const onExpand = vi.fn()
    renderWithProvider({ onExpand })

    const expandBtn = screen.getByRole('button', { name: /expand/i })
    await userEvent.click(expandBtn)
    expect(onExpand).toHaveBeenCalledOnce()
  })

  it('renders title as read-only in client mode', () => {
    renderWithProvider({ clientMode: true })

    // InlineEdit in readOnly mode does not render a textbox role
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    // Title text should still be visible
    expect(screen.getByText('Fix login bug')).toBeInTheDocument()
  })

  it('renders title as editable in staff mode', () => {
    renderWithProvider({ clientMode: false })

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
