import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TaskPanel } from './task-panel'
import {
  TaskColumnPicker,
  TaskPriorityPicker,
  TaskMemberPicker,
  TaskAssigneePicker,
  TaskDatePicker,
  TaskLabelEditor,
  TaskVisibilityPicker,
} from './pickers'
import { SubtasksTab } from './subtasks-tab'
import { ConversationTab } from './conversation-tab'
import { FilesTab } from './files-tab'
import { ReviewTab } from './review-tab'
import { ActivityTab } from './activity-tab'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/ui/sheet'
import { VisuallyHidden } from '@/ui/visually-hidden'
import {
  IconListCheck,
  IconGitPullRequest,
  IconMessageCircle,
  IconPaperclip,
  IconActivity,
  IconColumns,
  IconFlag,
  IconUser,
  IconUsers,
  IconCalendar,
  IconTag,
  IconEye,
  IconClock,
} from '@tabler/icons-react'
import type {
  Priority,
  Visibility,
  Member,
  Column,
  Subtask,
  ReviewRequest,
  Comment,
  TaskFile,
  AuditLogEntry,
} from './task-types'

// ============================================================
// Mock Data
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

const baseLogEntry = {
  actorType: 'USER' as const,
  actorId: 'user-1',
  entityType: 'V2Task',
  entityId: 'task-1',
  projectId: 'proj-1',
}

const activities: AuditLogEntry[] = [
  { ...baseLogEntry, id: 'log-1', timestamp: minutesAgo(10), action: 'task.moved', metadata: { actorName: 'Arjun Mehta', fromColumn: 'In Progress', toColumn: 'Review' } },
  { ...baseLogEntry, id: 'log-2', timestamp: hoursAgo(1), action: 'task.file_uploaded', metadata: { actorName: 'Arjun Mehta', fileName: 'sample-response.json' } },
  { ...baseLogEntry, id: 'log-3', timestamp: hoursAgo(3), action: 'task.review_requested', metadata: { actorName: 'Priya Sharma', reviewerName: 'Kavita Reddy' } },
  { ...baseLogEntry, id: 'log-4', timestamp: daysAgo(1), action: 'task.commented', metadata: { actorName: 'Arjun Mehta' } },
  { ...baseLogEntry, id: 'log-5', timestamp: daysAgo(2), action: 'task.assigned', metadata: { actorName: 'Priya Sharma', assigneeName: 'Arjun Mehta' } },
  { ...baseLogEntry, id: 'log-6', timestamp: daysAgo(3), action: 'task.created', metadata: { actorName: 'Priya Sharma' } },
]

// ============================================================
// Shared callbacks
// ============================================================

const noop = fn()
const noopStr = fn() as (...args: unknown[]) => void

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof TaskPanel> = {
  title: 'Karm/Tasks/TaskPanel',
  component: TaskPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { TaskPanel } from "@devalok/shilp-sutra-karm/tasks"`\n\n' +
          'Compound component for building task detail panels. Container-agnostic — works in Sheet, Dialog, or plain div.',
      },
    },
  },
}

export default meta
type Story = StoryObj

// ============================================================
// Helpers
// ============================================================

/** Wraps TaskPanel in a Sheet for stories that test the typical side-panel use case */
function SheetWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Sheet open onOpenChange={noop}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-none sm:w-[40%] min-w-[380px] p-0 flex flex-col overflow-hidden border-l border-surface-border-strong bg-surface-1"
      >
        <VisuallyHidden>
          <SheetTitle>Task Details</SheetTitle>
        </VisuallyHidden>
        {children}
      </SheetContent>
    </Sheet>
  )
}

// ============================================================
// Reusable property rows
// ============================================================

function AllProperties({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <TaskPanel.Properties>
      <TaskPanel.Property icon={<IconColumns />} label="Status">
        <TaskColumnPicker
          columns={columns}
          value="col-review"
          onChange={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
      <TaskPanel.Property icon={<IconFlag />} label="Priority">
        <TaskPriorityPicker
          value={'HIGH' as Priority}
          onChange={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
      <TaskPanel.Property icon={<IconUser />} label="Owner">
        <TaskMemberPicker
          members={members}
          value="user-1"
          onChange={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
      <TaskPanel.Property icon={<IconUsers />} label="Assignees">
        <TaskAssigneePicker
          members={members}
          value={[members[0], members[1]]}
          onAssign={noopStr}
          onUnassign={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
      <TaskPanel.Property icon={<IconCalendar />} label="Due Date">
        <TaskDatePicker
          value={new Date(Date.now() + 3 * 86400000)}
          onChange={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
      <TaskPanel.Property icon={<IconTag />} label="Labels">
        <TaskLabelEditor
          value={['backend', 'payments', 'v2']}
          onChange={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
      <TaskPanel.Property icon={<IconEye />} label="Visibility">
        <TaskVisibilityPicker
          value={'EVERYONE' as Visibility}
          onChange={noopStr}
          readOnly={readOnly}
        />
      </TaskPanel.Property>
    </TaskPanel.Properties>
  )
}

// ============================================================
// Stories
// ============================================================

/** Default: Sheet + TaskPanel with all properties + 3 tabs (subtasks, conversation, files) */
export const Default: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title
            value="Implement vendor API integration for payment processing"
            editable
            onUpdate={noopStr}
          />
        </TaskPanel.Header>
        <AllProperties />
        <TaskPanel.Tabs defaultTab="subtasks" onTabChange={noopStr}>
          <TaskPanel.Tab id="subtasks" icon={<IconListCheck />} label="Subtasks">
            <SubtasksTab
              subtasks={subtasks}
              terminalColumnId="col-done"
              projectId="proj-1"
              parentTaskId="task-1"
              defaultColumnId="col-backlog"
              onCreateSubtask={noopStr}
              onToggleSubtask={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={comments}
              taskVisibility="EVERYONE"
              onPostComment={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="files" icon={<IconPaperclip />} label="Files">
            <FilesTab
              files={files}
              onUpload={noopStr}
              onDelete={noopStr}
            />
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** FullFeatured: All 7 pickers + all 5 tabs */
export const FullFeatured: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title
            value="Implement vendor API integration for payment processing"
            editable
            onUpdate={noopStr}
          />
        </TaskPanel.Header>
        <AllProperties />
        <TaskPanel.Tabs defaultTab="subtasks" onTabChange={noopStr}>
          <TaskPanel.Tab id="subtasks" icon={<IconListCheck />} label="Subtasks">
            <SubtasksTab
              subtasks={subtasks}
              terminalColumnId="col-done"
              projectId="proj-1"
              parentTaskId="task-1"
              defaultColumnId="col-backlog"
              onCreateSubtask={noopStr}
              onToggleSubtask={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="review" icon={<IconGitPullRequest />} label="Review">
            <ReviewTab
              reviews={reviewRequests}
              members={members}
              onRequestReview={noopStr}
              onUpdateStatus={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={comments}
              taskVisibility="EVERYONE"
              onPostComment={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="files" icon={<IconPaperclip />} label="Files">
            <FilesTab
              files={files}
              onUpload={noopStr}
              onDelete={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="activity" icon={<IconActivity />} label="Activity">
            <ActivityTab activities={activities} />
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** ClientMode: Only conversation tab, read-only pickers, no staff-only features */
export const ClientMode: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title value="Implement vendor API integration for payment processing" />
        </TaskPanel.Header>
        <TaskPanel.Properties>
          <TaskPanel.Property icon={<IconColumns />} label="Status">
            <TaskColumnPicker columns={columns} value="col-review" onChange={noopStr} readOnly />
          </TaskPanel.Property>
          <TaskPanel.Property icon={<IconFlag />} label="Priority">
            <TaskPriorityPicker value={'HIGH' as Priority} onChange={noopStr} readOnly />
          </TaskPanel.Property>
          <TaskPanel.Property icon={<IconCalendar />} label="Due Date">
            <TaskDatePicker value={new Date(Date.now() + 3 * 86400000)} onChange={noopStr} readOnly />
          </TaskPanel.Property>
        </TaskPanel.Properties>
        <TaskPanel.Tabs defaultTab="conversation">
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={comments}
              taskVisibility="EVERYONE"
              onPostComment={noopStr}
              clientMode
            />
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** CustomTab: Standard tabs + a custom "Time Log" tab */
export const CustomTab: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title
            value="Implement vendor API integration for payment processing"
            editable
            onUpdate={noopStr}
          />
        </TaskPanel.Header>
        <AllProperties />
        <TaskPanel.Tabs defaultTab="subtasks" onTabChange={noopStr}>
          <TaskPanel.Tab id="subtasks" icon={<IconListCheck />} label="Subtasks">
            <SubtasksTab
              subtasks={subtasks}
              terminalColumnId="col-done"
              projectId="proj-1"
              parentTaskId="task-1"
              defaultColumnId="col-backlog"
              onCreateSubtask={noopStr}
              onToggleSubtask={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={comments}
              taskVisibility="EVERYONE"
              onPostComment={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="time-log" icon={<IconClock />} label="Time Log">
            <div className="space-y-ds-04">
              <div className="flex items-center justify-between text-ds-sm">
                <span className="text-surface-fg-muted">Arjun Mehta</span>
                <span className="font-medium text-surface-fg">3h 25m</span>
              </div>
              <div className="flex items-center justify-between text-ds-sm">
                <span className="text-surface-fg-muted">Priya Sharma</span>
                <span className="font-medium text-surface-fg">1h 50m</span>
              </div>
              <div className="mt-ds-04 border-t border-surface-border pt-ds-03 flex items-center justify-between text-ds-sm font-semibold">
                <span className="text-surface-fg">Total</span>
                <span className="text-accent-11">5h 15m</span>
              </div>
            </div>
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** CustomProperty: Standard pickers + a custom "Time Tracked" property row */
export const CustomProperty: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title
            value="Implement vendor API integration for payment processing"
            editable
            onUpdate={noopStr}
          />
        </TaskPanel.Header>
        <TaskPanel.Properties>
          <TaskPanel.Property icon={<IconColumns />} label="Status">
            <TaskColumnPicker columns={columns} value="col-review" onChange={noopStr} />
          </TaskPanel.Property>
          <TaskPanel.Property icon={<IconFlag />} label="Priority">
            <TaskPriorityPicker value={'HIGH' as Priority} onChange={noopStr} />
          </TaskPanel.Property>
          <TaskPanel.Property icon={<IconClock />} label="Time Tracked">
            <span className="text-ds-sm font-medium text-accent-11">5h 15m</span>
          </TaskPanel.Property>
          <TaskPanel.Property icon={<IconUser />} label="Owner">
            <TaskMemberPicker members={members} value="user-1" onChange={noopStr} />
          </TaskPanel.Property>
        </TaskPanel.Properties>
        <TaskPanel.Tabs defaultTab="conversation">
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={comments}
              taskVisibility="EVERYONE"
              onPostComment={noopStr}
            />
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** Minimal: Just title + priority + conversation */
export const Minimal: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title value="Update project README" />
        </TaskPanel.Header>
        <TaskPanel.Properties>
          <TaskPanel.Property icon={<IconFlag />} label="Priority">
            <TaskPriorityPicker value={'LOW' as Priority} onChange={noopStr} />
          </TaskPanel.Property>
        </TaskPanel.Properties>
        <TaskPanel.Tabs defaultTab="conversation">
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={[]}
              taskVisibility="INTERNAL"
              onPostComment={noopStr}
            />
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** LoadingState: TaskPanel.Loading skeleton */
export const LoadingState: Story = {
  render: () => (
    <SheetWrapper>
      <TaskPanel>
        <TaskPanel.Loading />
      </TaskPanel>
    </SheetWrapper>
  ),
}

/** ContainerAgnostic: TaskPanel in a plain div (no Sheet) to prove it works anywhere */
export const ContainerAgnostic: Story = {
  render: () => (
    <div className="mx-auto mt-ds-08 w-[480px] h-[600px] border border-surface-border-strong rounded-lg bg-surface-1 overflow-hidden">
      <TaskPanel>
        <TaskPanel.Header>
          <TaskPanel.Title
            value="Implement vendor API integration for payment processing"
            editable
            onUpdate={noopStr}
            subtask
          />
        </TaskPanel.Header>
        <TaskPanel.Properties>
          <TaskPanel.Property icon={<IconFlag />} label="Priority">
            <TaskPriorityPicker value={'HIGH' as Priority} onChange={noopStr} />
          </TaskPanel.Property>
          <TaskPanel.Property icon={<IconColumns />} label="Status">
            <TaskColumnPicker columns={columns} value="col-review" onChange={noopStr} />
          </TaskPanel.Property>
        </TaskPanel.Properties>
        <TaskPanel.Tabs defaultTab="conversation">
          <TaskPanel.Tab id="subtasks" icon={<IconListCheck />} label="Subtasks">
            <SubtasksTab
              subtasks={subtasks.slice(0, 2)}
              terminalColumnId="col-done"
              projectId="proj-1"
              parentTaskId="task-1"
              defaultColumnId="col-backlog"
              onCreateSubtask={noopStr}
              onToggleSubtask={noopStr}
            />
          </TaskPanel.Tab>
          <TaskPanel.Tab id="conversation" icon={<IconMessageCircle />} label="Conversation">
            <ConversationTab
              comments={comments.slice(0, 2)}
              taskVisibility="EVERYONE"
              onPostComment={noopStr}
            />
          </TaskPanel.Tab>
        </TaskPanel.Tabs>
      </TaskPanel>
    </div>
  ),
}
