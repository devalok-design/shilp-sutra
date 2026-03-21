import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask } from '../task-panel-types'
import { TaskPanelReviewBanner } from '../task-panel-review-banner'

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
  isInReview: true,
  reviewSubmittedBy: { name: 'Alice', timestamp: '2026-03-21T12:00:00Z' },
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
      <TaskPanelReviewBanner />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelReviewBanner', () => {
  it('renders when isInReview=true and staff mode', () => {
    renderWithProvider()
    expect(screen.getByText('REVIEW REQUESTED')).toBeInTheDocument()
    expect(screen.getByText(/Submitted by Alice/)).toBeInTheDocument()
  })

  it('hidden when clientMode=true', async () => {
    renderWithProvider({ clientMode: true })
    await waitFor(() =>
      expect(screen.queryByText('REVIEW REQUESTED')).not.toBeInTheDocument(),
    )
  })

  it('hidden when isInReview=false', async () => {
    renderWithProvider({
      task: { ...mockTask, isInReview: false },
    })
    await waitFor(() =>
      expect(screen.queryByText('REVIEW REQUESTED')).not.toBeInTheDocument(),
    )
  })

  it('Approve button calls onApproveReview', async () => {
    const onApproveReview = vi.fn()
    renderWithProvider({ onApproveReview })

    const approveBtn = screen.getByRole('button', { name: /approve/i })
    await userEvent.click(approveBtn)
    expect(onApproveReview).toHaveBeenCalledOnce()
  })

  it('Request Changes button calls onRequestChanges', async () => {
    const onRequestChanges = vi.fn()
    renderWithProvider({ onRequestChanges })

    const changesBtn = screen.getByRole('button', { name: /request changes/i })
    await userEvent.click(changesBtn)
    expect(onRequestChanges).toHaveBeenCalledOnce()
  })
})
