import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import {
  IconAlertTriangleFilled,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
} from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import { cn } from '@/ui/lib/utils'
import { Avatar, AvatarFallback } from '@/ui/avatar'
import { DevalokGrain } from '@/ui/devalok-grain'
import { TaskPanel } from './task-panel'
import type { TaskPanelRootProps } from './task-panel-root'
import type { TaskPanelTask, TaskPanelMode, TimelineEntry, UploadingFile } from './task-panel-types'

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

const htmlDescription =
  '<p>Users are being logged out unexpectedly when their <strong>JWT access token</strong> expires during an active session.</p><ul><li>The refresh token flow is not triggered correctly</li><li>API middleware returns <code>401</code> instead of refreshing</li><li>Affects all authenticated routes</li></ul><p>Particularly disruptive during <em>long form submissions</em>.</p>'

const mockTask: TaskPanelTask = {
  id: 'task-1',
  taskId: 'KRM-847',
  title: 'Fix authentication token refresh on expired sessions',
  description: htmlDescription,
  descriptionUpdatedBy: { name: 'Arjun Rao', timestamp: hoursAgo(3) },
  status: 'in-progress',
  statusOptions,
  priority: 'HIGH',
  assignees: [
    { ...arjun, bandwidth: 'ELEVATED' as const },
    { ...priya, bandwidth: 'HEALTHY' as const },
  ],
  leads: [
    { ...nick, isOnLeave: true },
  ],
  members: [arjun, priya, nick],
  dueDate: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
  startDate: new Date(now.getTime() - 2 * 86_400_000).toISOString(),
  phase: { id: 'phase-2', name: 'Development' },
  phaseOptions: [
    { id: 'phase-1', name: 'Discovery' },
    { id: 'phase-2', name: 'Development' },
    { id: 'phase-3', name: 'Testing' },
    { id: 'phase-4', name: 'Launch' },
  ],
  createdByType: 'LOKWASI' as const,
  createdByName: 'Nick Padgett',
  projectName: 'Karm',
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
  reviewFiles: [
    { name: 'token-refresh-fix.patch', size: '4.2 KB' },
    { name: 'auth-flow-diagram.png', size: '156 KB' },
  ],
  dependencies: {
    blockedBy: [
      { id: 'dep-1', taskId: 'KRM-812', title: 'Set up token rotation service', status: 'In Progress' },
    ],
    blocking: [
      { id: 'dep-2', taskId: 'KRM-856', title: 'OAuth2 integration for client portal', status: 'Backlog' },
      { id: 'dep-3', taskId: 'KRM-862', title: 'Session timeout UX improvements', status: 'Backlog' },
    ],
  },
  files: [
    {
      id: 'file-1',
      name: 'token-refresh-fix.patch',
      fileUrl: '#',
      downloadUrl: '#',
      fileType: 'patch',
      size: 4300,
      uploadedBy: { id: 'u1', name: 'Arjun Rao', image: null },
      createdAt: hoursAgo(5),
    },
    {
      id: 'file-2',
      name: 'auth-flow-diagram.png',
      fileUrl: '#',
      downloadUrl: '#',
      fileType: 'png',
      size: 159744,
      uploadedBy: { id: 'u2', name: 'Priya Mehta', image: null },
      createdAt: hoursAgo(3),
      gDriveUrl: 'https://drive.google.com/example',
    },
  ],
}

// ============================================================
// Rich mock data for file gallery / upload stories
// ============================================================

const richFiles: TaskPanelTask['files'] = [
  {
    id: 'file-1', name: 'auth-flow-v3.fig', fileUrl: '#', downloadUrl: '#',
    fileType: 'fig', size: 2_400_000, source: 'figma',
    embedUrl: 'https://www.figma.com/file/example',
    uploadedBy: { id: 'u1', name: 'Arjun Rao', image: null }, createdAt: hoursAgo(5), status: 'final',
  },
  {
    id: 'file-2', name: 'hero-mockup.png', fileUrl: 'https://picsum.photos/800/600', downloadUrl: '#',
    fileType: 'png', size: 356_000, source: 'upload', thumbnailUrl: 'https://picsum.photos/200/150',
    uploadedBy: { id: 'u2', name: 'Priya Mehta', image: null }, createdAt: hoursAgo(3), isClientVisible: true,
  },
  {
    id: 'file-3', name: 'brand-guidelines.pdf', fileUrl: '#', downloadUrl: '#',
    fileType: 'pdf', size: 4_800_000, source: 'upload',
    uploadedBy: { id: 'u3', name: 'Nick Padgett', image: null }, createdAt: daysAgo(2), status: 'final', isClientVisible: true,
  },
  {
    id: 'file-4', name: 'client-presentation.pptx', fileUrl: '#', downloadUrl: '#',
    fileType: 'pptx', size: 12_000_000, source: 'gdrive',
    gDriveUrl: 'https://drive.google.com/example',
    uploadedBy: { id: 'u1', name: 'Arjun Rao', image: null }, createdAt: daysAgo(1),
  },
  {
    id: 'file-5', name: 'Onboarding walkthrough', fileUrl: '#', downloadUrl: '#',
    fileType: 'video', size: 0, source: 'loom',
    embedUrl: 'https://www.loom.com/share/example',
    uploadedBy: { id: 'u2', name: 'Priya Mehta', image: null }, createdAt: hoursAgo(8),
  },
  {
    id: 'file-6', name: 'internal-notes.docx', fileUrl: '#', downloadUrl: '#',
    fileType: 'docx', size: 84_000, source: 'upload',
    uploadedBy: { id: 'u1', name: 'Arjun Rao', image: null }, createdAt: hoursAgo(1), isClientVisible: false,
  },
]

const mockUploadingFiles: UploadingFile[] = [
  { id: 'up-1', name: 'revised-mockup-v4.fig', progress: 67 },
  { id: 'up-2', name: 'recording.mp4', progress: 23 },
  { id: 'up-3', name: 'broken-export.psd', progress: 0, error: 'Upload failed — file too large' },
]

const richMockTask: TaskPanelTask = {
  ...mockTask,
  description: htmlDescription,
  files: richFiles,
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
    type: 'comment',
    deleted: true,
    comment: {
      id: 'c-deleted',
      taskId: 'task-1',
      authorType: 'INTERNAL',
      authorId: 'u2',
      content: '',
      createdAt: hoursAgo(18),
      updatedAt: hoursAgo(18),
      internalAuthor: priya,
    },
  },
  // Fix 11: AI agent response in timeline
  {
    type: 'agent-response',
    response: {
      id: 'agent-1',
      agentId: 'sutradhar',
      agentName: 'Sutradhar',
      content: 'I analyzed the token refresh flow and found 3 potential issues:\n\n1. The refresh token is not being rotated after use\n2. Concurrent requests race on the refresh endpoint\n3. The retry queue doesn\'t handle 403 responses\n\nI can create subtasks for each of these if you\'d like.',
      summary: 'Found 3 issues in the token refresh flow',
      isStreaming: false,
      timestamp: hoursAgo(5),
    },
    reactions: [{ emoji: '\u{1F3AF}', count: 2, reacted: false }],
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
  onAddAssignee: fn(),
  onRemoveAssignee: fn(),
  onAddLead: fn(),
  onRemoveLead: fn(),
  onUpdateDueDate: fn(),
  onUpdateStartDate: fn(),
  onUpdatePhase: fn(),
  onPostComment: fn(),
  onToggleVisibility: fn(),
  onToggleSubtask: fn(),
  onAddSubtask: fn(),
  onAddLabel: fn(),
  onRemoveLabel: fn(),
  onApproveReview: fn(),
  onRequestChanges: fn(),
  onEditComment: fn(),
  onDeleteComment: fn(),
  onReact: fn(),
  onDeleteTask: fn(),
  onMoveToProject: fn(),
  onDuplicateTask: fn(),
  onCopyLink: fn(),
  onUploadFile: fn(),
  onDeleteFile: fn(),
  onClose: fn(),
  onExpand: fn(),
}

// ============================================================
// Storybook meta
// ============================================================

const meta: Meta<TaskPanelRootProps> = {
  title: 'Karm/Tasks/TaskPanel v3',
  component: TaskPanel,
  tags: ['autodocs', 'experimental'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<TaskPanelRootProps>

// ============================================================
// Reusable story wrapper with trigger button
// ============================================================

// ---------------------------------------------------------------------------
// Priority icon helper for trigger card
// ---------------------------------------------------------------------------

const PRIORITY_ICONS = {
  URGENT: IconAlertTriangleFilled,
  HIGH: IconArrowUp,
  MEDIUM: IconMinus,
  LOW: IconArrowDown,
} as const

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'text-error-9',
  HIGH: 'text-warning-9',
  MEDIUM: 'text-surface-fg-muted',
  LOW: 'text-surface-fg-subtle',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Trigger card — replicates TaskCard visual structure without DnD
// ---------------------------------------------------------------------------

function TriggerCard({
  task,
  onClick,
}: {
  task: TaskPanelTask
  onClick: () => void
}) {
  const PriorityIcon = PRIORITY_ICONS[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[320px] rounded-ds-lg border border-transparent bg-surface-raised pl-3 pr-ds-03 py-ds-03 text-left shadow-raised transition-all hover:shadow-raised-hover hover:-translate-y-px hover:border-surface-border-strong"
    >
      {/* Row 1 — Task ID + Priority */}
      <div className="flex items-center gap-ds-02">
        <span className="text-ds-xs font-mono leading-none text-surface-fg-subtle">
          {task.taskId}
        </span>
        <Icon
          icon={PriorityIcon}
          size="xs"
          className={cn('flex-shrink-0', priorityColor)}
        />
      </div>

      {/* Row 2 — Title */}
      <p className="mt-ds-02 text-ds-sm font-medium text-surface-fg line-clamp-2">
        {task.title}
      </p>

      {/* Row 3 — Bottom metadata: assignees */}
      <div className="mt-ds-03 flex items-center gap-ds-02">
        {task.assignees.length > 0 ? (
          <div className="flex items-center flex-shrink-0">
            {task.assignees.slice(0, 3).map((user, i) => (
              <Avatar
                key={user.id}
                size="xs"
                className={cn(
                  'text-ds-xs border-2 border-surface-base',
                  i > 0 && '-ml-ds-02b',
                )}
                title={user.name}
              >
                <AvatarFallback className="font-body font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignees.length > 3 && (
              <span className="ml-ds-01 text-ds-xs text-surface-fg-subtle">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        ) : (
          <span className="text-ds-xs text-surface-fg-subtle">Unassigned</span>
        )}
        <div className="flex-1" />
        {task.labels.length > 0 && (
          <span className="text-ds-xs text-surface-fg-subtle">
            {task.labels.length} label{task.labels.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Story wrapper
// ---------------------------------------------------------------------------

function TaskPanelDemo({
  mode,
  clientMode = false,
  task = mockTask,
  timeline: timelineProp = mockTimeline,
  typingUsers,
  lastViewedAt,
  label,
  isAgentStreaming,
  agentStreamingText,
  uploadingFiles,
}: {
  mode: TaskPanelMode
  clientMode?: boolean | 'VIEW_ONLY' | 'COLLABORATOR'
  task?: TaskPanelTask
  timeline?: TimelineEntry[]
  typingUsers?: { name: string; image?: string | null }[]
  lastViewedAt?: string
  label: string
  isAgentStreaming?: boolean
  agentStreamingText?: string
  uploadingFiles?: UploadingFile[]
}) {
  const [open, setOpen] = useState(false)
  const [taskState, setTaskState] = useState(task)

  const callbacks = {
    ...sharedCallbacks,
    onClose: () => setOpen(false),
    onExpand: fn(),
    onToggleVisibility: () => setTaskState((t) => ({
      ...t,
      visibility: t.visibility === 'EVERYONE' ? 'INTERNAL' as const : 'EVERYONE' as const,
    })),
    onUpdateStatus: (statusId: string) => setTaskState((t) => ({ ...t, status: statusId })),
    onUpdatePriority: (priority: string) => setTaskState((t) => ({ ...t, priority: priority as TaskPanelTask['priority'] })),
    onUpdateStartDate: (date: Date | null) => setTaskState((t) => ({ ...t, startDate: date?.toISOString() ?? null })),
    onUpdatePhase: (phaseId: string | null) => setTaskState((t) => ({
      ...t,
      phase: phaseId ? t.phaseOptions?.find((p) => p.id === phaseId) ?? null : null,
    })),
    onToggleSubtask: (subtaskId: string) => setTaskState((t) => ({
      ...t,
      subtasks: t.subtasks.map((s) =>
        s.id === subtaskId
          ? {
              ...s,
              column: s.column?.isTerminal
                ? { id: 'todo', name: 'To Do' }
                : { id: 'done', name: 'Done', isTerminal: true },
              columnId: s.column?.isTerminal ? 'todo' : 'done',
            }
          : s,
      ),
    })),
    onAddSubtask: (title: string) => setTaskState((t) => ({
      ...t,
      subtasks: [
        ...t.subtasks,
        {
          id: `st-${Date.now()}`,
          title,
          priority: 'MEDIUM' as const,
          columnId: 'todo',
          column: { id: 'todo', name: 'To Do' },
          assignees: [],
        },
      ],
    })),
    onAddLabel: (label: string) => setTaskState((t) => ({
      ...t,
      labels: t.labels.includes(label) ? t.labels : [...t.labels, label],
    })),
    onRemoveLabel: (label: string) => setTaskState((t) => ({
      ...t,
      labels: t.labels.filter((l) => l !== label),
    })),
    onAddAssignee: (memberId: string) => setTaskState((t) => {
      if (t.assignees.some((a) => a.id === memberId)) return t
      const member = t.members.find((m) => m.id === memberId)
      if (!member) return t
      return { ...t, assignees: [...t.assignees, { ...member, bandwidth: 'HEALTHY' as const }] }
    }),
    onRemoveAssignee: (memberId: string) => setTaskState((t) => ({
      ...t,
      assignees: t.assignees.filter((a) => a.id !== memberId),
      leads: t.leads.filter((l) => l.id !== memberId),
    })),
    onAddLead: (memberId: string) => setTaskState((t) => {
      if (t.leads.some((l) => l.id === memberId)) return t
      const member = t.members.find((m) => m.id === memberId)
      if (!member) return t
      return { ...t, leads: [...t.leads, { ...member, bandwidth: 'HEALTHY' as const }] }
    }),
    onRemoveLead: (memberId: string) => setTaskState((t) => ({
      ...t,
      leads: t.leads.filter((l) => l.id !== memberId),
    })),
    onUpdateDueDate: (date: Date | null) => setTaskState((t) => ({
      ...t,
      dueDate: date?.toISOString() ?? null,
    })),
    onUpdateTitle: (title: string) => setTaskState((t) => ({ ...t, title })),
    onUpdateDescription: (desc: string) => setTaskState((t) => ({ ...t, description: desc })),
  }

  const panelContent = (
    <>
      {/* Wings — composable, positioned to the left of the sheet */}
      {mode === 'side' && (
        <TaskPanel.Wings>
          {taskState.isInReview && <TaskPanel.ReviewCard />}
          {!clientMode && <TaskPanel.PropertiesCard />}
        </TaskPanel.Wings>
      )}

      <div className="flex h-full flex-col">
        {/* Hero section — header + description share a subtle grain */}
        <div className="relative overflow-hidden isolate border-b border-surface-border-subtle">
          <DevalokGrain intensity="subtle" surface="soft" tint="var(--color-accent-9)" />
          <TaskPanel.Header />
          <TaskPanel.Description />
        </div>
        {mode === 'peek' && <TaskPanel.QuickProps />}
        <div className="flex flex-1 flex-col overflow-hidden">
          {mode !== 'peek' && <TaskPanel.Subtasks />}
          {mode !== 'peek' && <TaskPanel.Files />}
          {mode !== 'peek' && <TaskPanel.Dependencies />}
          <TaskPanel.Timeline />
        </div>
        {mode !== 'peek' && <TaskPanel.MessageInput />}
      </div>
    </>
  )

  return (
    <div style={{ height: '100vh' }} className="bg-surface-base p-ds-08">
      {/* Simulated board background */}
      <div className="mb-ds-06">
        <h2 className="text-ds-lg font-semibold text-surface-fg mb-ds-02">
          Karm Board
        </h2>
        <p className="text-ds-sm text-surface-fg-muted mb-ds-05">
          {label}
        </p>

        {/* Trigger card — replicates TaskCard structure */}
        <TriggerCard task={taskState} onClick={() => setOpen(true)} />
      </div>

      {/* Panel — wings render as composable children */}
      <TaskPanel
        mode={mode}
        open={open}
        task={taskState}
        clientMode={clientMode}
        currentUserId={clientMode ? 'client-1' : 'u1'}
        timeline={timelineProp}
        lastViewedAt={lastViewedAt}
        typingUsers={typingUsers}
        isAgentStreaming={isAgentStreaming}
        agentStreamingText={agentStreamingText}
        uploadingFiles={uploadingFiles}
        {...callbacks}
      >
        {mode === 'full' ? (
          /* Full page mode with properties sidebar */
          <div className="flex h-full">
            <div className="flex flex-1 flex-col">
              {/* Hero section — header + description */}
              <div className="relative overflow-hidden isolate border-b border-surface-border-subtle">
                <DevalokGrain intensity="subtle" surface="soft" tint="var(--color-accent-9)" />
                <TaskPanel.Header />
                <TaskPanel.Description />
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <TaskPanel.Subtasks />
                <TaskPanel.Files />
                <TaskPanel.Dependencies />
                <TaskPanel.Timeline />
              </div>
              <TaskPanel.MessageInput />
            </div>
            <div className="w-[280px] shrink-0 border-l border-surface-border overflow-y-auto p-ds-05">
              <TaskPanel.PropertiesCard />
            </div>
          </div>
        ) : (
          panelContent
        )}
      </TaskPanel>
    </div>
  )
}

// ============================================================
// Stories
// ============================================================

/** Click the task card to open the side panel. Staff experience with wing panels (review + properties) appearing to the left. */
export const SidePanelStaff: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      label="Click the task card below to open the side panel (staff view). Review and properties wings appear to the left."
      lastViewedAt={hoursAgo(4)}
      typingUsers={[{ name: 'Priya Mehta', image: null }]}
    />
  ),
}

/** Client perspective — no system events, no internal comments, read-only properties. Review wing shows "Under Review" status. */
export const SidePanelClient: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      clientMode
      label="Click the task card below to open the side panel (client view). Review wing shows 'Under Review' status."
    />
  ),
}

/** Peek mode — compact overlay with description and latest 2 timeline entries. */
export const Peek: Story = {
  render: () => (
    <TaskPanelDemo
      mode="peek"
      label="Click the task card below to open the peek preview"
    />
  ),
}

/** Full page mode — takes over the viewport with full timeline and message input. */
export const FullPage: Story = {
  render: () => (
    <TaskPanelDemo
      mode="full"
      label="Click the task card below to open full page view"
      lastViewedAt={hoursAgo(4)}
    />
  ),
}

/** Empty task — new task with no comments, subtasks, or timeline entries. Wings include PropertiesCard (no ReviewCard since not in review). */
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
      assignees: [],
      leads: [],
      members: [arjun, priya, nick],
      dueDate: null,
      startDate: null,
      labels: [],
      visibility: 'INTERNAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      isInReview: false,
    }

    return (
      <TaskPanelDemo
        mode="side"
        task={emptyTask}
        timeline={[]}
        label="Click the task card below to see empty states. Properties wing appears to the left."
      />
    )
  },
}

/** Staff side panel with no review — only properties wing visible. */
export const SidePanelNoReview: Story = {
  render: () => {
    const noReviewTask: TaskPanelTask = {
      ...mockTask,
      isInReview: false,
      reviewSubmittedBy: undefined,
    }

    return (
      <TaskPanelDemo
        mode="side"
        task={noReviewTask}
        label="Click the task card — only properties wing appears (no review in progress)"
        lastViewedAt={hoursAgo(4)}
      />
    )
  },
}

/** AI agent actively streaming a response in the timeline. */
export const AIStreaming: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      label="Click the task card to see the AI agent streaming a response at the bottom of the timeline."
      lastViewedAt={hoursAgo(4)}
      isAgentStreaming
      agentStreamingText="Analyzing the token refresh flow. I can see the interceptor is using a simple flag to prevent concurrent refreshes, but there's a race condition when multiple tabs are open simultaneously..."
    />
  ),
}

/** Task with overdue due date — should show red styling. */
export const OverdueTask: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={{ ...mockTask, dueDate: daysAgo(3), isInReview: false }}
      label="Task with overdue due date — should show red styling"
    />
  ),
}

/** Task created by AI agent — should show AI badge. */
export const AICreatedTask: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={{ ...mockTask, createdByType: 'SYSTEM', createdByName: 'Devadoot', isInReview: false }}
      label="Task created by AI agent — should show AI badge"
    />
  ),
}

/** Client collaborator — can edit priority, due date, description, post messages. */
export const ClientCollaborator: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      clientMode="COLLABORATOR"
      task={{ ...mockTask, isInReview: false }}
      label="Client collaborator — can edit priority, due date, description, post messages"
    />
  ),
}

/** Rich HTML description rendered with TipTap viewer */
export const RichDescription: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={{ ...richMockTask, isInReview: false }}
      label="Click to see rich HTML description with formatting"
    />
  ),
}

/** Full file gallery — design files, documents, media, links across categories */
export const FileGallery: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={richMockTask}
      label="Click to see categorized file gallery with thumbnails and mixed file types"
    />
  ),
}

/** Files mid-upload with progress bars and an error state */
export const FileUploadProgress: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={richMockTask}
      uploadingFiles={mockUploadingFiles}
      label="Click to see upload progress bars and error states"
    />
  ),
}

/** VIEW_ONLY client — downloads visible files, no upload actions */
export const ClientViewOnlyFiles: Story = {
  render: () => (
    <TaskPanelDemo
      mode="side"
      clientMode="VIEW_ONLY"
      task={richMockTask}
      label="Client view-only — sees only client-visible files, no upload"
    />
  ),
}

/** Inline review banner (in full page layout) */
export const ReviewBannerVisible: Story = {
  render: () => (
    <TaskPanelDemo
      mode="full"
      task={mockTask}
      label="Full page — review banner visible at top"
    />
  ),
}

/** Dark mode — staff side panel */
export const DarkMode: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <TaskPanelDemo
      mode="side"
      task={richMockTask}
      label="Dark mode — staff view with rich content"
      lastViewedAt={hoursAgo(4)}
    />
  ),
}
