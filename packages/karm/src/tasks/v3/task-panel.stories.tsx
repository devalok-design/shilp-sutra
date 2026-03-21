import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TaskPanel } from './task-panel'
import type { TaskPanelRootProps } from './task-panel-root'
import type { TaskPanelTask, TimelineEntry } from './task-panel-types'

// ============================================================
// Mock team members
// ============================================================

const arjun = { id: 'u1', name: 'Arjun Rao', image: null }
const priya = { id: 'u2', name: 'Priya Mehta', image: null }
const nick = { id: 'u3', name: 'Nick Padgett', image: null }

// ============================================================
// Time helpers
// ============================================================

const now = new Date()
const minutesAgo = (m: number) =>
  new Date(now.getTime() - m * 60_000).toISOString()
const hoursAgo = (h: number) =>
  new Date(now.getTime() - h * 3_600_000).toISOString()
const daysAgo = (d: number) =>
  new Date(now.getTime() - d * 86_400_000).toISOString()

// ============================================================
// Mock task
// ============================================================

const statusOptions = [
  { id: 'backlog', name: 'Backlog' },
  { id: 'todo', name: 'To Do' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' },
]

const mockTask: TaskPanelTask = {
  id: 'task-1',
  taskId: 'KRM-847',
  title: 'Fix authentication token refresh on expired sessions',
  description:
    'Users are being logged out unexpectedly when their JWT access token expires during an active session. The refresh token flow is not being triggered correctly, causing the API middleware to return 401 instead of silently refreshing. This affects all authenticated routes and is particularly disruptive during long form submissions.',
  descriptionUpdatedBy: { name: 'Arjun Rao', timestamp: hoursAgo(3) },
  status: 'in-progress',
  statusOptions,
  priority: 'HIGH',
  assignee: arjun,
  lead: nick,
  members: [arjun, priya, nick],
  dueDate: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
  labels: ['bug', 'auth', 'critical-path'],
  visibility: 'EVERYONE',
  project: 'Karm',
  createdAt: daysAgo(5),
  updatedAt: hoursAgo(1),
  subtasks: [
    {
      id: 'st-1',
      title: 'Audit current token refresh interceptor',
      priority: 'HIGH',
      columnId: 'done',
      column: { id: 'done', name: 'Done', isTerminal: true },
      assignees: [{ user: arjun }],
    },
    {
      id: 'st-2',
      title: 'Add retry queue for failed requests during refresh',
      priority: 'HIGH',
      columnId: 'in-progress',
      column: { id: 'in-progress', name: 'In Progress' },
      assignees: [{ user: arjun }],
    },
    {
      id: 'st-3',
      title: 'Write integration tests for token expiry flow',
      priority: 'MEDIUM',
      columnId: 'todo',
      column: { id: 'todo', name: 'To Do' },
      assignees: [{ user: priya }],
    },
    {
      id: 'st-4',
      title: 'Update auth error handling in API middleware',
      priority: 'MEDIUM',
      columnId: 'todo',
      column: { id: 'todo', name: 'To Do' },
      assignees: [],
    },
  ],
  isInReview: true,
  reviewSubmittedBy: { name: 'Arjun Rao', timestamp: hoursAgo(2) },
}

// ============================================================
// Mock timeline
// ============================================================

const mockTimeline: TimelineEntry[] = [
  {
    type: 'system-event',
    event: {
      id: 'ev-1',
      actorId: 'u3',
      actorName: 'Nick Padgett',
      action: 'status-change',
      description: 'moved this to In Progress',
      timestamp: daysAgo(4),
    },
  },
  {
    type: 'system-event',
    event: {
      id: 'ev-2',
      actorId: 'u3',
      actorName: 'Nick Padgett',
      action: 'assignment',
      description: 'assigned Arjun Rao',
      timestamp: daysAgo(4),
    },
  },
  {
    type: 'system-event',
    event: {
      id: 'ev-3',
      actorId: 'u3',
      actorName: 'Nick Padgett',
      action: 'priority',
      description: 'changed priority to High',
      timestamp: daysAgo(4),
    },
  },
  {
    type: 'system-event',
    event: {
      id: 'ev-4',
      actorId: 'u3',
      actorName: 'Nick Padgett',
      action: 'label-add',
      description: 'added label critical-path',
      timestamp: daysAgo(4),
    },
  },
  {
    type: 'comment',
    comment: {
      id: 'c-1',
      taskId: 'task-1',
      authorType: 'INTERNAL',
      authorId: 'u1',
      content:
        "I've traced the issue to the Axios interceptor. The refresh call is racing with parallel requests and the second refresh attempt fails because the first already invalidated the old refresh token. We need a request queue.",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
      internalAuthor: arjun,
    },
    reactions: [
      { emoji: '\u{1F44D}', count: 2, reacted: false },
      { emoji: '\u{1F914}', count: 1, reacted: true },
    ],
  },
  {
    type: 'comment',
    comment: {
      id: 'c-2',
      taskId: 'task-1',
      authorType: 'INTERNAL',
      authorId: 'u2',
      content:
        'Good find. I saw a similar pattern in the Notion client SDK -- they use a promise-based lock so only one refresh happens at a time. Want me to pair on this?',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
      internalAuthor: priya,
    },
  },
  {
    type: 'comment',
    comment: {
      id: 'c-3',
      taskId: 'task-1',
      authorType: 'CLIENT',
      authorId: 'client-1',
      content:
        "Hi team, just wanted to flag that our users are reporting this is happening more frequently now, especially on slower connections. Is there an ETA on the fix?",
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
      clientAuthor: {
        id: 'client-1',
        name: 'Sarah Chen',
        email: 'sarah@acme.com',
      },
    },
  },
  {
    type: 'comment',
    comment: {
      id: 'c-4',
      taskId: 'task-1',
      authorType: 'INTERNAL',
      authorId: 'u1',
      content:
        "Hi Sarah -- we've identified the root cause and the fix is in progress. The request queue is implemented and I'm writing tests now. Should have a PR up by end of day tomorrow.",
      createdAt: hoursAgo(20),
      updatedAt: hoursAgo(20),
      internalAuthor: arjun,
    },
  },
  {
    type: 'system-event',
    event: {
      id: 'ev-5',
      actorId: 'u1',
      actorName: 'Arjun Rao',
      action: 'status-change',
      description: 'moved this to Review',
      timestamp: hoursAgo(3),
    },
  },
  {
    type: 'review-event',
    event: {
      id: 'rev-1',
      reviewerId: 'u1',
      reviewerName: 'Arjun Rao',
      action: 'submitted',
      comment: 'Ready for review. The interceptor now uses a mutex lock pattern.',
      timestamp: hoursAgo(2),
    },
  },
  {
    type: 'comment',
    comment: {
      id: 'c-5',
      taskId: 'task-1',
      authorType: 'INTERNAL',
      authorId: 'u2',
      content:
        "Looks solid. One question -- what happens if the refresh token itself is expired? I see we're catching that in the interceptor but the redirect to /login seems to have a flash of the authenticated layout.",
      createdAt: hoursAgo(1),
      updatedAt: hoursAgo(1),
      internalAuthor: priya,
    },
    reactions: [
      { emoji: '\u{1F4AF}', count: 1, reacted: false },
    ],
  },
]

// ============================================================
// Shared callback stubs
// ============================================================

const sharedCallbacks = {
  onUpdateTitle: fn(),
  onUpdateDescription: fn(),
  onUpdateStatus: fn(),
  onUpdatePriority: fn(),
  onUpdateAssignee: fn(),
  onUpdateDueDate: fn(),
  onPostComment: fn(),
  onToggleSubtask: fn(),
  onAddSubtask: fn(),
  onApproveReview: fn(),
  onRequestChanges: fn(),
  onReact: fn(),
  onClose: fn(),
  onExpand: fn(),
}

// ============================================================
// Storybook meta
// ============================================================

const meta: Meta<TaskPanelRootProps> = {
  title: 'Karm/Tasks/TaskPanel v3',
  component: TaskPanel,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<TaskPanelRootProps>

// ============================================================
// Stories
// ============================================================

/**
 * Full-featured side panel from the staff perspective. Shows comments,
 * system events, file attachments, reactions, typing indicator, and
 * review banner.
 */
export const SidePanelStaff: Story = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <TaskPanel
        mode="side"
        open={true}
        task={mockTask}
        clientMode={false}
        currentUserId="u1"
        timeline={mockTimeline}
        lastViewedAt={hoursAgo(4)}
        typingUsers={[{ name: 'Priya Mehta', image: null }]}
        {...sharedCallbacks}
      >
        <div className="flex h-full flex-col">
          <TaskPanel.Header />
          <TaskPanel.QuickProps />
          <TaskPanel.ReviewBanner />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TaskPanel.Description />
            <TaskPanel.Subtasks />
            <TaskPanel.Timeline />
          </div>
          <TaskPanel.MessageInput />
        </div>
      </TaskPanel>
    </div>
  ),
}

/**
 * Client perspective: no system events, no internal comments, read-only
 * properties.
 */
export const SidePanelClient: Story = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <TaskPanel
        mode="side"
        open={true}
        task={mockTask}
        clientMode={true}
        currentUserId="client-1"
        timeline={mockTimeline}
        {...sharedCallbacks}
      >
        <div className="flex h-full flex-col">
          <TaskPanel.Header />
          <TaskPanel.QuickProps />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TaskPanel.Description />
            <TaskPanel.Subtasks />
            <TaskPanel.Timeline />
          </div>
          <TaskPanel.MessageInput />
        </div>
      </TaskPanel>
    </div>
  ),
}

/**
 * Peek mode: compact overlay with description and latest 2 timeline entries.
 */
export const Peek: Story = {
  render: () => (
    <div style={{ height: '100vh', position: 'relative' }}>
      <div className="p-ds-06 text-surface-fg">
        <p className="text-ds-lg font-semibold">Board View</p>
        <p className="text-ds-sm text-surface-fg-muted">
          Click a task card to see the peek panel on the right.
        </p>
      </div>
      <TaskPanel
        mode="peek"
        open={true}
        task={mockTask}
        clientMode={false}
        currentUserId="u1"
        timeline={mockTimeline}
        {...sharedCallbacks}
      >
        <TaskPanel.Header />
        <TaskPanel.QuickProps />
        <TaskPanel.Description />
        <TaskPanel.Timeline />
      </TaskPanel>
    </div>
  ),
}

/**
 * Full page mode with full timeline and message input.
 */
export const FullPage: Story = {
  render: () => (
    <div style={{ height: '100vh' }}>
      <TaskPanel
        mode="full"
        task={mockTask}
        clientMode={false}
        currentUserId="u1"
        timeline={mockTimeline}
        lastViewedAt={hoursAgo(4)}
        {...sharedCallbacks}
      >
        <div className="mx-auto flex h-full max-w-3xl flex-col">
          <TaskPanel.Header />
          <TaskPanel.QuickProps />
          <TaskPanel.ReviewBanner />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TaskPanel.Description />
            <TaskPanel.Subtasks />
            <TaskPanel.Timeline />
          </div>
          <TaskPanel.MessageInput />
        </div>
      </TaskPanel>
    </div>
  ),
}

/**
 * Empty task: new task with no comments, subtasks, or timeline entries.
 */
export const EmptyTask: Story = {
  render: () => {
    const emptyTask: TaskPanelTask = {
      id: 'task-new',
      taskId: 'KRM-999',
      title: 'New task',
      description: '',
      status: 'backlog',
      statusOptions,
      priority: 'MEDIUM',
      assignee: null,
      lead: null,
      members: [arjun, priya, nick],
      dueDate: null,
      labels: [],
      visibility: 'INTERNAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      isInReview: false,
    }

    return (
      <div style={{ height: '100vh' }}>
        <TaskPanel
          mode="side"
          open={true}
          task={emptyTask}
          clientMode={false}
          currentUserId="u1"
          timeline={[]}
          {...sharedCallbacks}
        >
          <div className="flex h-full flex-col">
            <TaskPanel.Header />
            <TaskPanel.QuickProps />
            <div className="flex flex-1 flex-col overflow-hidden">
              <TaskPanel.Description />
              <TaskPanel.Subtasks />
              <TaskPanel.Timeline />
            </div>
            <TaskPanel.MessageInput />
          </div>
        </TaskPanel>
      </div>
    )
  },
}
