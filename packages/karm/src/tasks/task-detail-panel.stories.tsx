import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TaskDetailPanel, type FullTask } from './task-detail-panel'
import type { Member, Column } from './task-properties'
import type { Subtask } from './subtasks-tab'
import type { ReviewRequest } from './review-tab'
import type { Comment } from './conversation-tab'
import type { TaskFile } from './files-tab'
import type { AuditLogEntry } from './activity-tab'

// ============================================================
// Mock Data — Shared
// ============================================================

const now = new Date()
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString()
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString()

const members: Member[] = [
  { id: 'user-1', name: 'Arjun Mehta', email: 'arjun@devalok.com', image: null },
  { id: 'user-2', name: 'Priya Sharma', email: 'priya@devalok.com', image: null },
  { id: 'user-3', name: 'Kavita Reddy', email: 'kavita@devalok.com', image: null },
  { id: 'user-4', name: 'Rahul Verma', email: 'rahul@devalok.com', image: null },
]

const columns: Column[] = [
  { id: 'col-backlog', name: 'Backlog', isDefault: true },
  { id: 'col-todo', name: 'To Do' },
  { id: 'col-progress', name: 'In Progress' },
  { id: 'col-review', name: 'Review' },
  { id: 'col-done', name: 'Done', isTerminal: true },
]

// ============================================================
// Mock Data — Subtasks
// ============================================================

const subtasks: Subtask[] = [
  {
    id: 'st-1',
    title: 'Set up Prisma schema for user preferences',
    priority: 'HIGH',
    columnId: 'col-done',
    column: { id: 'col-done', name: 'Done', isTerminal: true },
    assignees: [{ user: { id: 'user-1', name: 'Arjun Mehta', image: null } }],
  },
  {
    id: 'st-2',
    title: 'Implement preferences API endpoints',
    priority: 'HIGH',
    columnId: 'col-progress',
    column: { id: 'col-progress', name: 'In Progress' },
    assignees: [{ user: { id: 'user-2', name: 'Priya Sharma', image: null } }],
  },
  {
    id: 'st-3',
    title: 'Write integration tests',
    priority: 'MEDIUM',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [{ user: { id: 'user-3', name: 'Kavita Reddy', image: null } }],
  },
  {
    id: 'st-4',
    title: 'Build notification settings UI',
    priority: 'LOW',
    columnId: 'col-backlog',
    column: { id: 'col-backlog', name: 'Backlog' },
    assignees: [],
  },
]

// ============================================================
// Mock Data — Reviews
// ============================================================

const reviewRequests: ReviewRequest[] = [
  {
    id: 'rev-1',
    taskId: 'task-1',
    status: 'PENDING',
    feedback: null,
    requestedBy: { id: 'user-2', name: 'Priya Sharma', image: null },
    reviewer: { id: 'user-3', name: 'Kavita Reddy', image: null },
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'rev-2',
    taskId: 'task-1',
    status: 'APPROVED',
    feedback: 'Clean implementation, well-structured code. Ship it!',
    requestedBy: { id: 'user-1', name: 'Arjun Mehta', image: null },
    reviewer: { id: 'user-2', name: 'Priya Sharma', image: null },
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
]

// ============================================================
// Mock Data — Comments
// ============================================================

const comments: Comment[] = [
  {
    id: 'c-1',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-1',
    content: 'Started working on the API layer. The vendor documentation is incomplete, so I am reverse-engineering from their Swagger spec.',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    internalAuthor: { id: 'user-1', name: 'Arjun Mehta', email: 'arjun@devalok.com', image: null },
  },
  {
    id: 'c-2',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-2',
    content: 'Check the internal wiki under "Vendor API Quirks" -- there are notes from last quarter that should help.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    internalAuthor: { id: 'user-2', name: 'Priya Sharma', email: 'priya@devalok.com', image: null },
  },
  {
    id: 'c-3',
    taskId: 'task-1',
    authorType: 'CLIENT',
    authorId: 'client-1',
    content: 'Any update on the ETA for this integration? Our team is blocked on the reporting module.',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    clientAuthor: { id: 'client-1', name: 'Rohan Gupta', email: 'rohan@acmecorp.in' },
  },
  {
    id: 'c-4',
    taskId: 'task-1',
    authorType: 'INTERNAL',
    authorId: 'user-1',
    content: 'We are on track for delivery by end of this sprint. The core endpoints are done; just finishing up error handling and rate limiting.',
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
    internalAuthor: { id: 'user-1', name: 'Arjun Mehta', email: 'arjun@devalok.com', image: null },
  },
]

// ============================================================
// Mock Data — Files
// ============================================================

const files: TaskFile[] = [
  {
    id: 'file-1',
    taskId: 'task-1',
    title: 'api-design-spec.pdf',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'pdf',
    uploadedBy: { id: 'user-2', name: 'Priya Sharma', image: null },
    createdAt: daysAgo(4),
  },
  {
    id: 'file-2',
    taskId: 'task-1',
    title: 'wireframe-v2.png',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'png',
    uploadedBy: { id: 'user-3', name: 'Kavita Reddy', image: null },
    createdAt: daysAgo(2),
  },
  {
    id: 'file-3',
    taskId: 'task-1',
    title: 'sample-response.json',
    fileUrl: '#',
    downloadUrl: '#',
    fileType: 'json',
    uploadedBy: { id: 'user-1', name: 'Arjun Mehta', image: null },
    createdAt: daysAgo(1),
  },
]

// ============================================================
// Mock Data — Activities
// ============================================================

const baseLogEntry = {
  actorType: 'USER' as const,
  actorId: 'user-1',
  entityType: 'V2Task',
  entityId: 'task-1',
  projectId: 'proj-1',
}

const activities: AuditLogEntry[] = [
  {
    ...baseLogEntry,
    id: 'log-1',
    timestamp: minutesAgo(10),
    action: 'task.moved',
    metadata: { actorName: 'Arjun Mehta', fromColumn: 'In Progress', toColumn: 'Review' },
  },
  {
    ...baseLogEntry,
    id: 'log-2',
    timestamp: hoursAgo(1),
    action: 'task.file_uploaded',
    metadata: { actorName: 'Arjun Mehta', fileName: 'sample-response.json' },
  },
  {
    ...baseLogEntry,
    id: 'log-3',
    timestamp: hoursAgo(3),
    action: 'task.review_requested',
    metadata: { actorName: 'Priya Sharma', reviewerName: 'Kavita Reddy' },
  },
  {
    ...baseLogEntry,
    id: 'log-4',
    timestamp: daysAgo(1),
    action: 'task.commented',
    metadata: { actorName: 'Arjun Mehta' },
  },
  {
    ...baseLogEntry,
    id: 'log-5',
    timestamp: daysAgo(2),
    action: 'task.assigned',
    metadata: { actorName: 'Priya Sharma', assigneeName: 'Arjun Mehta' },
  },
  {
    ...baseLogEntry,
    id: 'log-6',
    timestamp: daysAgo(3),
    action: 'task.created',
    metadata: { actorName: 'Priya Sharma' },
  },
]

// ============================================================
// Mock Data — Full Tasks
// ============================================================

const fullTask: FullTask = {
  id: 'task-1',
  title: 'Implement vendor API integration for payment processing',
  description: 'Integrate with the Razorpay API for handling subscriptions and one-time payments. Must support webhooks for async status updates.',
  projectId: 'proj-1',
  columnId: 'col-review',
  column: { id: 'col-review', name: 'Review' },
  ownerId: 'user-1',
  owner: members[0],
  priority: 'HIGH',
  dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  labels: ['backend', 'payments', 'v2'],
  visibility: 'EVERYONE',
  parentTaskId: null,
  depth: 0,
  order: 1,
  isBlocked: false,
  assignees: [{ user: members[0] }, { user: members[1] }],
  subtasks,
  reviewRequests,
  comments,
  files,
  createdAt: daysAgo(5),
  updatedAt: minutesAgo(10),
}

const minimalTask: FullTask = {
  id: 'task-2',
  title: 'Update project README',
  description: null,
  projectId: 'proj-1',
  columnId: 'col-backlog',
  column: { id: 'col-backlog', name: 'Backlog' },
  ownerId: null,
  owner: null,
  priority: 'LOW',
  dueDate: null,
  labels: [],
  visibility: 'INTERNAL',
  parentTaskId: null,
  depth: 0,
  order: 5,
  isBlocked: false,
  assignees: [],
  subtasks: [],
  reviewRequests: [],
  comments: [],
  files: [],
  createdAt: daysAgo(1),
  updatedAt: daysAgo(1),
}

const subtaskOfParent: FullTask = {
  ...fullTask,
  id: 'task-3',
  title: 'Write webhook handler for payment status callbacks',
  parentTaskId: 'task-1',
  depth: 1,
  subtasks: [],
  reviewRequests: [],
  comments: comments.slice(0, 2),
  files: files.slice(0, 1),
}

const urgentBlockedTask: FullTask = {
  id: 'task-4',
  title: 'Fix critical memory leak in SSE connection handler',
  description: 'Production servers are running out of memory every 6 hours due to unclosed SSE connections. Needs immediate attention.',
  projectId: 'proj-1',
  columnId: 'col-progress',
  column: { id: 'col-progress', name: 'In Progress' },
  ownerId: 'user-4',
  owner: members[3],
  priority: 'URGENT',
  dueDate: new Date(Date.now() - 86400000).toISOString(),
  labels: ['bug', 'production', 'memory-leak', 'SSE'],
  visibility: 'INTERNAL',
  parentTaskId: null,
  depth: 0,
  order: 0,
  isBlocked: true,
  assignees: [{ user: members[3] }, { user: members[0] }],
  subtasks: subtasks.slice(0, 2),
  reviewRequests: [reviewRequests[0]],
  comments: comments.slice(0, 2),
  files: [],
  createdAt: daysAgo(1),
  updatedAt: hoursAgo(2),
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof TaskDetailPanel> = {
  title: 'Karm/Tasks/TaskDetailPanel',
  component: TaskDetailPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { TaskDetailPanel } from "@devalok/shilp-sutra-karm/tasks"`',
      },
    },
  },
  args: {
    open: false,
    onOpenChange: fn(),
    columns,
    members,
    activities,
    onTitleUpdate: fn(),
    onPropertyUpdate: fn(),
    onAssign: fn(),
    onUnassign: fn(),
    onCreateSubtask: fn(),
    onToggleSubtask: fn(),
    onRequestReview: fn(),
    onUpdateReviewStatus: fn(),
    onPostComment: fn(),
    onUploadFile: fn(),
    onDeleteFile: fn(),
    onTabChange: fn(),
  },
}

export default meta
type Story = StoryObj<typeof TaskDetailPanel>

// ============================================================
// Stories
// ============================================================

/** Full task detail panel with all data populated: subtasks, reviews, comments, files, activity */
export const Default: Story = {
  args: {
    task: fullTask,
    open: true,
  },
}

/** Minimal task with empty tabs and no metadata */
export const MinimalTask: Story = {
  tags: ['!autodocs'],
  args: {
    task: minimalTask,
    open: true,
    activities: [],
  },
}

/** Loading skeleton shown while task data is being fetched */
export const Loading: Story = {
  tags: ['!autodocs'],
  args: {
    task: null,
    open: true,
    loading: true,
    activities: [],
  },
}

/** Panel opened with null task and no loading state -- shows skeleton */
export const NullTask: Story = {
  tags: ['!autodocs'],
  args: {
    task: null,
    open: true,
    loading: false,
    activities: [],
  },
}

/** Subtask view -- shows "Subtask" label beneath the title */
export const SubtaskView: Story = {
  tags: ['!autodocs'],
  args: {
    task: subtaskOfParent,
    open: true,
  },
}

/** Urgent blocked task with overdue date and many labels */
export const UrgentBlocked: Story = {
  tags: ['!autodocs'],
  args: {
    task: urgentBlockedTask,
    open: true,
  },
}

/** Client portal mode: only conversation tab visible, no editing, "Team" badges */
export const ClientMode: Story = {
  tags: ['!autodocs'],
  args: {
    task: fullTask,
    open: true,
    clientMode: true,
    clientEditableFields: ['priority', 'dueDate'],
  },
}

/** Client mode with minimal task data */
export const ClientModeMinimal: Story = {
  tags: ['!autodocs'],
  args: {
    task: minimalTask,
    open: true,
    clientMode: true,
    activities: [],
  },
}

/** Panel with enriched comments overriding task.comments */
export const EnrichedComments: Story = {
  tags: ['!autodocs'],
  args: {
    task: fullTask,
    open: true,
    enrichedComments: [
      ...comments,
      {
        id: 'c-enriched',
        taskId: 'task-1',
        authorType: 'INTERNAL' as const,
        authorId: 'user-3',
        content: 'Enriched comment loaded from a separate API endpoint with additional context.',
        createdAt: minutesAgo(5),
        updatedAt: minutesAgo(5),
        internalAuthor: { id: 'user-3', name: 'Kavita Reddy', email: 'kavita@devalok.com', image: null },
      },
    ],
  },
}

/** Panel in closed state -- not rendered visually but useful for testing open/close */
export const Closed: Story = {
  args: {
    task: fullTask,
    open: false,
  },
}

/** File upload in progress */
export const FileUploading: Story = {
  tags: ['!autodocs'],
  args: {
    task: fullTask,
    open: true,
    isUploading: true,
  },
}
