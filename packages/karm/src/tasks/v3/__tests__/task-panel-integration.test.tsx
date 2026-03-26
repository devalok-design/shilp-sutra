import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import {
  TaskPanelProvider,
  type TaskPanelProviderProps,
} from '../task-panel-context'
import type { TaskPanelTask, TimelineEntry } from '../task-panel-types'
import { TaskPanelHeader } from '../task-panel-header'
import { TaskPanelQuickProps } from '../task-panel-quick-props'
import { TaskPanelDescription } from '../task-panel-description'
import { TaskPanelSubtasks } from '../task-panel-subtasks'
import { TaskPanelTimeline } from '../task-panel-timeline'
import { TaskPanelPropertiesCard } from '../task-panel-wing-properties'

// ---------------------------------------------------------------------------
// Polyfills
// ---------------------------------------------------------------------------

beforeAll(() => {
  // MessageList uses scrollTo
  Element.prototype.scrollTo = vi.fn() as any
})

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// framer-motion — avoid animations in tests
vi.mock('framer-motion', () => {
  const motionHandler = {
    get(_: any, tag: string) {
      if (tag === 'create') {
        // motion.create(Component) → return the component unchanged
        return (Component: any) => Component
      }
      // motion.div, motion.span, etc.
      return ({ children, ...props }: any) => {
        const el = tag === 'span' ? 'span' : 'div'
        // Filter out motion-specific props to avoid React warnings
        const filtered = Object.fromEntries(
          Object.entries(props).filter(
            ([k]) =>
              !['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'layout', 'layoutId'].includes(k),
          ),
        )
        if (el === 'span') {
          return <span {...filtered}>{children}</span>
        }
        return <div {...filtered}>{children}</div>
      }
    },
  }
  return {
    motion: new Proxy({}, motionHandler),
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
  }
})

// StreamingText — avoid markdown rendering deps
vi.mock('../../../chat/streaming-text', () => ({
  StreamingText: ({ text, ...props }: any) => (
    <div data-testid="streaming-content" {...props}>{text}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const now = new Date()
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 86_400_000).toISOString()
const daysFromNow = (d: number) =>
  new Date(now.getTime() + d * 86_400_000).toISOString()

const statusOptions = [
  { id: 'todo', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'done', name: 'Done' },
]

const phaseOptions = [
  { id: 'phase-1', name: 'Discovery' },
  { id: 'phase-2', name: 'Development' },
]

const mockTask: TaskPanelTask = {
  id: 'task-1',
  taskId: 'KRM-847',
  title: 'Fix authentication token refresh',
  description:
    'Users are being logged out unexpectedly when their JWT expires.',
  status: 'in-progress',
  statusOptions,
  priority: 'HIGH',
  assignees: [{ id: 'u1', name: 'Arjun Rao', image: null }],
  leads: [{ id: 'u2', name: 'Nick Padgett', image: null }],
  members: [
    { id: 'u1', name: 'Arjun Rao', image: null },
    { id: 'u2', name: 'Nick Padgett', image: null },
    { id: 'u3', name: 'Priya Mehta', image: null },
  ],
  dueDate: daysFromNow(5),
  startDate: daysAgo(2),
  labels: ['bug', 'auth'],
  visibility: 'EVERYONE',
  createdAt: daysAgo(5),
  updatedAt: daysAgo(0),
  subtasks: [
    {
      id: 'st-1',
      title: 'Audit token interceptor',
      priority: 'HIGH',
      columnId: 'done',
      column: { id: 'done', name: 'Done', isTerminal: true },
      assignees: [],
    },
    {
      id: 'st-2',
      title: 'Add retry queue',
      priority: 'MEDIUM',
      columnId: 'in-progress',
      column: { id: 'in-progress', name: 'In Progress' },
      assignees: [],
    },
  ],
  isInReview: false,
  phase: { id: 'phase-2', name: 'Development' },
  phaseOptions,
  createdByType: 'LOKWASI',
  createdByName: 'Nick Padgett',
  projectName: 'Karm',
}

const mockTimeline: TimelineEntry[] = [
  {
    type: 'system-event',
    event: {
      id: 'ev-1',
      actorId: 'u1',
      actorName: 'Arjun Rao',
      action: 'status-change',
      description: 'moved this to In Progress',
      timestamp: daysAgo(3),
    },
  },
  {
    type: 'comment',
    comment: {
      id: 'c-1',
      taskId: 'task-1',
      authorType: 'INTERNAL',
      authorId: 'u1',
      content: 'Found the root cause in the interceptor.',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      internalAuthor: { id: 'u1', name: 'Arjun Rao', email: 'arjun@test.com', image: null },
    },
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Renders the full composed TaskPanel (all subcomponents) inside the provider.
 * Uses TaskPanelProvider directly to avoid Sheet/Dialog portal issues in jsdom.
 */
function renderFullPanel(
  overrides?: Partial<Omit<TaskPanelProviderProps, 'children'>>,
) {
  return render(
    <TaskPanelProvider
      task={mockTask}
      mode="side"
      clientMode={false}
      currentUserId="u1"
      timeline={mockTimeline}
      {...overrides}
    >
      <TaskPanelHeader />
      <TaskPanelQuickProps />
      <TaskPanelDescription />
      <TaskPanelSubtasks />
      <TaskPanelTimeline />
      <TaskPanelPropertiesCard />
    </TaskPanelProvider>,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TaskPanel v3 — integration', () => {
  // 1. Full panel renders all subcomponents
  it('renders all major subcomponents', () => {
    renderFullPanel()

    // Header: task ID + title
    expect(screen.getByText('KRM-847')).toBeInTheDocument()
    expect(screen.getByText('Fix authentication token refresh')).toBeInTheDocument()

    // Quick props pills
    expect(screen.getByTestId('status-pill')).toBeInTheDocument()
    expect(screen.getByTestId('priority-pill')).toBeInTheDocument()
    expect(screen.getByTestId('assignee-pill')).toBeInTheDocument()
    expect(screen.getByTestId('due-date-pill')).toBeInTheDocument()

    // Description content
    expect(screen.getByText('Users are being logged out unexpectedly when their JWT expires.')).toBeInTheDocument()

    // Subtasks section
    expect(screen.getByText('Subtasks')).toBeInTheDocument()

    // Timeline content
    expect(screen.getByText('Found the root cause in the interceptor.')).toBeInTheDocument()

    // Properties wing
    expect(screen.getByTestId('properties-wing')).toBeInTheDocument()
  })

  // 2. Quick props show correct values
  it('shows correct values in quick property pills', () => {
    renderFullPanel()

    // Status shows resolved name
    expect(screen.getByTestId('status-pill')).toHaveTextContent('In Progress')

    // Priority shows label
    expect(screen.getByTestId('priority-pill')).toHaveTextContent('High')

    // Assignee shows name
    expect(screen.getByTestId('assignee-pill')).toHaveTextContent('Arjun Rao')

    // Due date pill is present (date is in the future)
    const dueDatePill = screen.getByTestId('due-date-pill')
    expect(dueDatePill).toBeInTheDocument()
    // Should not show overdue styling
    expect(dueDatePill.className).not.toContain('bg-error')
  })

  // 3. Properties wing shows all properties
  it('properties wing shows status, priority, visibility, due date, people, and details', () => {
    renderFullPanel()

    const wing = screen.getByTestId('properties-wing')

    // Status badge text within the wing
    expect(within(wing).getByText('In Progress')).toBeInTheDocument()

    // Priority chip label
    expect(within(wing).getByText('High')).toBeInTheDocument()

    // Visibility switch is present (only in staff mode)
    const visSwitch = within(wing).getByRole('switch')
    expect(visSwitch).toBeInTheDocument()

    // Due date text
    expect(within(wing).getByText(/Due /)).toBeInTheDocument()

    // People — Arjun is an assignee, Nick is a lead
    // The peopleLabel should show lead name + count
    expect(within(wing).getByText(/Nick/)).toBeInTheDocument()
  })

  // 4. Overdue date shows red/error styling
  it('shows error styling when due date is overdue', () => {
    renderFullPanel({
      task: { ...mockTask, dueDate: daysAgo(3) },
    })

    // Quick props: due date pill should have error background
    const dueDatePill = screen.getByTestId('due-date-pill')
    expect(dueDatePill.className).toContain('bg-error')

    // Pill text should indicate overdue
    expect(dueDatePill).toHaveTextContent(/overdue/i)

    // Properties wing: calendar icon or text should have error color
    const wing = screen.getByTestId('properties-wing')
    expect(within(wing).getByText(/overdue/i)).toBeInTheDocument()
  })

  // 5. Actions menu opens and shows items
  it('opens actions dropdown and shows copy link, duplicate, delete items', async () => {
    const user = userEvent.setup()
    renderFullPanel()

    // Open the actions menu
    const actionsBtn = screen.getByRole('button', { name: /task actions/i })
    await user.click(actionsBtn)

    // Menu items should appear
    expect(screen.getByText('Copy link')).toBeInTheDocument()
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
    expect(screen.getByText('Delete task')).toBeInTheDocument()
  })

  // 6. Client mode hides internal content
  it('hides visibility toggle and delete option in client VIEW_ONLY mode', async () => {
    const user = userEvent.setup()
    renderFullPanel({ clientMode: true })

    // Properties wing — visibility switch should NOT be present
    const wing = screen.getByTestId('properties-wing')
    expect(within(wing).queryByRole('switch')).not.toBeInTheDocument()

    // Open the actions menu
    const actionsBtn = screen.getByRole('button', { name: /task actions/i })
    await user.click(actionsBtn)

    // Delete should be hidden in client mode
    expect(screen.queryByText('Delete task')).not.toBeInTheDocument()

    // Duplicate should still be visible
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
  })

  // 7. Breadcrumb shows project name
  it('shows project name in header breadcrumb', () => {
    renderFullPanel()

    expect(screen.getByText('Karm')).toBeInTheDocument()
  })

  it('does not show breadcrumb project name when projectName is absent', () => {
    renderFullPanel({
      task: { ...mockTask, projectName: undefined },
    })

    // "Karm" should not appear — task ID still should
    expect(screen.queryByText('Karm')).not.toBeInTheDocument()
    expect(screen.getByText('KRM-847')).toBeInTheDocument()
  })

  // 8. Creator attribution shows correct badge
  // The creator section is inside the collapsible "Details" section (defaultOpen=false),
  // so we must expand it first.
  it('shows AI badge when createdByType is SYSTEM', async () => {
    const user = userEvent.setup()
    renderFullPanel({
      task: {
        ...mockTask,
        createdByType: 'SYSTEM',
        createdByName: 'Devadoot',
      },
    })

    const wing = screen.getByTestId('properties-wing')
    // Expand "Details" section
    await user.click(within(wing).getByText('Details'))

    expect(within(wing).getByText('Devadoot')).toBeInTheDocument()
    expect(within(wing).getByText('AI')).toBeInTheDocument()
  })

  it('shows Client badge when createdByType is CLIENT', async () => {
    const user = userEvent.setup()
    renderFullPanel({
      task: {
        ...mockTask,
        createdByType: 'CLIENT',
        createdByName: 'Sarah Chen',
      },
    })

    const wing = screen.getByTestId('properties-wing')
    await user.click(within(wing).getByText('Details'))

    expect(within(wing).getByText('Sarah Chen')).toBeInTheDocument()
    expect(within(wing).getByText('Client')).toBeInTheDocument()
  })

  it('shows no badge when createdByType is LOKWASI', async () => {
    const user = userEvent.setup()
    renderFullPanel({
      task: {
        ...mockTask,
        createdByType: 'LOKWASI',
        createdByName: 'Nick Padgett',
      },
    })

    const wing = screen.getByTestId('properties-wing')
    await user.click(within(wing).getByText('Details'))

    // Name should be there in the "Created by" section
    expect(within(wing).getByText('Nick Padgett')).toBeInTheDocument()
    // Neither AI nor Client badge should appear
    expect(within(wing).queryByText('AI')).not.toBeInTheDocument()
  })
})
