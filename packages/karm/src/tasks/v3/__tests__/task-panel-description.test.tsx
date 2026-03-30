import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask } from '../task-panel-types'
import { TaskPanelDescription } from '../task-panel-description'

// ---------------------------------------------------------------------------
// Mock RichTextEditor / RichTextViewer to avoid TipTap in jsdom
// ---------------------------------------------------------------------------

vi.mock('@/composed/rich-text-editor', () => ({
  RichTextEditor: React.forwardRef(
    ({ content, onChange, placeholder, className, ...rest }: any, ref: any) => (
      <div
        data-testid="rich-text-editor"
        className={className}
        ref={ref}
        {...rest}
      >
        <textarea
          data-testid="rte-textarea"
          value={content ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    ),
  ),
  RichTextViewer: React.forwardRef(
    ({ content, className, ...rest }: any, ref: any) => (
      <div
        data-testid="rich-text-viewer"
        className={className}
        ref={ref}
      >
        {/* Render as text node so getByText still works for simple strings */}
        {content}
      </div>
    ),
  ),
}))

// ---------------------------------------------------------------------------
// Mock ResizeObserver — simulate overflow so "Show more" appears
// ---------------------------------------------------------------------------

let resizeCallback: ResizeObserverCallback
const originalResizeObserver = globalThis.ResizeObserver

beforeAll(() => {
  globalThis.ResizeObserver = class {
    constructor(cb: ResizeObserverCallback) {
      resizeCallback = cb
    }
    observe(el: Element) {
      // Simulate overflow: scrollHeight > clientHeight
      Object.defineProperty(el, 'scrollHeight', {
        value: 200,
        configurable: true,
      })
      Object.defineProperty(el, 'clientHeight', {
        value: 72,
        configurable: true,
      })
      resizeCallback([], this as any)
    }
    unobserve() {}
    disconnect() {}
  } as any
})

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver
})

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
      <TaskPanelDescription />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanelDescription', () => {
  it('renders rich text viewer when description has HTML content', () => {
    renderWithProvider()
    expect(screen.getByTestId('rich-text-viewer')).toBeInTheDocument()
  })

  it('click viewer enters edit mode for staff', async () => {
    renderWithProvider()
    // In collapsed mode, the viewer wrapper has role="button" for staff
    const viewerWrapper = screen.getByTestId('rich-text-viewer').closest(
      '[role="button"]',
    )!
    await userEvent.click(viewerWrapper)
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
  })

  it('VIEW_ONLY shows viewer, click does not enter edit mode', async () => {
    renderWithProvider({ clientMode: 'VIEW_ONLY' })
    const viewer = screen.getByTestId('rich-text-viewer')
    expect(viewer).toBeInTheDocument()
    // The viewer should NOT be inside a role="button" wrapper for VIEW_ONLY
    const viewerParent = viewer.closest('[role="button"]')
    expect(viewerParent).toBeNull()
    // Clicking viewer should not produce an editor
    await userEvent.click(viewer)
    expect(screen.queryByTestId('rich-text-editor')).not.toBeInTheDocument()
  })

  it('COLLABORATOR can edit', async () => {
    renderWithProvider({ clientMode: 'COLLABORATOR' })
    const viewerWrapper = screen.getByTestId('rich-text-viewer').closest(
      '[role="button"]',
    )!
    await userEvent.click(viewerWrapper)
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
  })

  it('empty state shows add prompt for staff', () => {
    renderWithProvider({
      task: { ...mockTask, description: '', descriptionUpdatedBy: undefined },
    })
    expect(
      screen.getByText('+ Add a description...'),
    ).toBeInTheDocument()
  })

  it("empty state shows 'No description added yet.' for VIEW_ONLY", () => {
    renderWithProvider({
      task: { ...mockTask, description: '', descriptionUpdatedBy: undefined },
      clientMode: 'VIEW_ONLY',
    })
    expect(
      screen.getByText('No description added yet.'),
    ).toBeInTheDocument()
  })

  it('byline shows in expanded mode for staff', async () => {
    renderWithProvider()
    // ResizeObserver mock simulates overflow, so "Show more" should appear
    const showMore = screen.getByRole('button', { name: /show more/i })
    expect(showMore).toBeInTheDocument()
    // Click "Show more" to expand
    await userEvent.click(showMore)
    // In expanded mode the byline should be visible
    expect(screen.getByText(/Last edited by Bob/)).toBeInTheDocument()
    // "Show less" should now be visible
    expect(
      screen.getByRole('button', { name: /show less/i }),
    ).toBeInTheDocument()
  })
})
