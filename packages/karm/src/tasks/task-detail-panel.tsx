'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/ui/sheet'
import { VisuallyHidden } from '@/ui/visually-hidden'
import { Skeleton } from '@/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/ui'
import { TaskProperties, type Member, type Column } from './task-properties'
import { SubtasksTab, type Subtask } from './subtasks-tab'
import { ReviewTab, type ReviewRequest } from './review-tab'
import { ConversationTab, type Comment } from './conversation-tab'
import { FilesTab, type TaskFile } from './files-tab'
import { ActivityTab, type AuditLogEntry } from './activity-tab'
import {
  IconListCheck,
  IconGitPullRequest,
  IconMessageCircle,
  IconPaperclip,
  IconActivity,
} from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface FullTask {
  id: string
  title: string
  description: string | null
  projectId: string
  columnId: string
  column: { id: string; name: string }
  ownerId: string | null
  owner: Member | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string | null
  labels: string[]
  visibility: 'INTERNAL' | 'EVERYONE'
  parentTaskId: string | null
  depth: number
  order: number
  isBlocked: boolean
  assignees: { user: Member }[]
  subtasks: Subtask[]
  reviewRequests: ReviewRequest[]
  comments?: Comment[]
  files: TaskFile[]
  createdAt: string
  updatedAt: string
  /** Consumer-defined metadata bag. Ignored by the component, available in render props/callbacks. */
  metadata?: Record<string, unknown>
}

export interface ExtraTab {
  /** Unique tab key */
  id: string
  /** Tab trigger text */
  label: string
  /** Optional icon in tab trigger */
  icon?: React.ReactNode
  /** Tab panel content */
  content: React.ReactNode
  /** Position relative to built-in tabs. Default: 'after' */
  position?: 'before' | 'after'
}

interface TaskDetailPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  task: FullTask | null
  loading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: Column[]
  members: Member[]
  activities?: AuditLogEntry[]
  /** Override comments (e.g. enriched from a separate API) */
  enrichedComments?: Comment[] | null
  /** Client portal mode: hides staff-only tabs/fields */
  clientMode?: boolean
  /** Fields the client can edit (only used when clientMode=true) */
  clientEditableFields?: string[]
  /** Content rendered in the header area between title and properties */
  headerSlot?: React.ReactNode
  /** Additional tab panels injected alongside built-in tabs */
  extraTabs?: ExtraTab[]

  // Callbacks
  onTitleUpdate?: (title: string) => void
  onPropertyUpdate?: (field: string, value: unknown) => void
  onAssign?: (userId: string) => void
  onUnassign?: (userId: string) => void
  onCreateSubtask?: (title: string) => void
  onToggleSubtask?: (taskId: string, isComplete: boolean) => void
  onRequestReview?: (reviewerId: string) => void
  onUpdateReviewStatus?: (reviewId: string, status: string, feedback?: string) => void
  onPostComment?: (content: string, authorType: 'INTERNAL' | 'CLIENT') => void
  onUploadFile?: (file: File, title?: string) => void
  /** Upload a deliverable version (separate from generic file attachments) */
  onUploadDeliverable?: (file: File, deliverableId?: string) => void
  onDeleteFile?: (fileId: string) => void
  onTabChange?: (tab: string) => void

  /** Optional render props for rich text editor/viewer in comments */
  renderEditor?: (props: {
    content: string
    onChange: (content: string) => void
    placeholder: string
  }) => React.ReactNode
  renderViewer?: (props: { content: string; className?: string }) => React.ReactNode
  /** Optional priority indicator component */
  renderPriorityIndicator?: (props: { priority: string }) => React.ReactNode
  /** Optional date picker component */
  renderDatePicker?: (props: {
    value: Date | null
    onChange: (date: Date | null) => void
    placeholder: string
    className?: string
  }) => React.ReactNode

  isUploading?: boolean
}

// ============================================================
// Tab Config
// ============================================================

const TABS = [
  { id: 'subtasks', label: 'Subtasks', icon: IconListCheck },
  { id: 'review', label: 'Review', icon: IconGitPullRequest },
  { id: 'conversation', label: 'Conversation', icon: IconMessageCircle },
  { id: 'files', label: 'Files', icon: IconPaperclip },
  { id: 'activity', label: 'Activity', icon: IconActivity },
] as const

type TabId = typeof TABS[number]['id']

// ============================================================
// Loading Skeleton
// ============================================================

function PanelSkeleton() {
  return (
    <div className="space-y-ds-06 p-ds-06">
      <Skeleton className="h-ds-xs-plus w-3/4 bg-surface-3" />
      <div className="space-y-ds-04">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-ds-04">
            <Skeleton className="h-[16px] w-[120px] bg-surface-3" />
            <Skeleton className="h-[16px] flex-1 bg-surface-3" />
          </div>
        ))}
      </div>
      <div className="flex gap-ds-05 border-b border-surface-border-strong pb-ds-03">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[12px] w-[64px] bg-surface-3" />
        ))}
      </div>
      <div className="space-y-ds-04">
        <Skeleton className="h-ds-md w-full bg-surface-3" />
        <Skeleton className="h-ds-md w-full bg-surface-3" />
        <Skeleton className="h-ds-md w-4/5 bg-surface-3" />
      </div>
    </div>
  )
}

// ============================================================
// Task Detail Panel
// ============================================================

const TaskDetailPanel = React.forwardRef<HTMLDivElement, TaskDetailPanelProps>(function TaskDetailPanel({
  task,
  loading = false,
  open,
  onOpenChange,
  columns,
  members,
  activities = [],
  enrichedComments,
  clientMode = false,
  clientEditableFields = ['priority', 'dueDate'],
  headerSlot,
  extraTabs = [],
  onTitleUpdate,
  onPropertyUpdate,
  onAssign,
  onUnassign,
  onCreateSubtask,
  onToggleSubtask,
  onRequestReview,
  onUpdateReviewStatus,
  onPostComment,
  onUploadFile,
  onUploadDeliverable,
  onDeleteFile,
  onTabChange,
  renderEditor,
  renderViewer,
  renderPriorityIndicator,
  renderDatePicker,
  isUploading = false,
  className,
  ...props
}, ref) {
  const [activeTab, setActiveTab] = React.useState<string>(clientMode ? 'conversation' : 'subtasks')
  const [editingTitle, setEditingTitle] = React.useState(false)
  const [titleValue, setTitleValue] = React.useState('')
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  // Reset state when task changes
  React.useEffect(() => {
    if (task) {
      setTitleValue(task.title)
      setEditingTitle(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  // Reset active tab when opening
  React.useEffect(() => {
    if (open) {
      setActiveTab(clientMode ? 'conversation' : 'subtasks')
    }
  }, [open, clientMode])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  // Title editing
  const handleTitleBlur = () => {
    setEditingTitle(false)
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== task?.title) {
      onTitleUpdate?.(trimmed)
    } else if (task) {
      setTitleValue(task.title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleBlur()
    }
    if (e.key === 'Escape') {
      setEditingTitle(false)
      if (task) setTitleValue(task.title)
    }
  }

  React.useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  // Computed values
  const terminalColumnId = columns.find((c) => c.isTerminal)?.id
  const defaultColumnId = columns.find((c) => c.isDefault)?.id || columns[0]?.id || ''

  const visibleTabs = clientMode
    ? TABS.filter((t) => t.id === 'conversation')
    : TABS

  const beforeTabs = extraTabs.filter((t) => t.position === 'before')
  const afterTabs = extraTabs.filter((t) => t.position !== 'before')

  const displayComments = enrichedComments || task?.comments || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={ref}
        side="right"
        className={cn(
          /* intentional: task detail side panel takes 40% of screen, min 380px for form usability */
          'w-full sm:max-w-none sm:w-[40%] min-w-[380px] p-0',
          'flex flex-col overflow-hidden',
          'border-l border-surface-border-strong bg-surface-1',
          className,
        )}
        {...props}
      >
        <VisuallyHidden>
          <SheetTitle>
            {task?.title || 'Task Details'}
          </SheetTitle>
        </VisuallyHidden>

        {loading || !task ? (
          <PanelSkeleton />
        ) : (
          <>
            {/* Header -- Title */}
            <div className="shrink-0 border-b border-surface-border-strong px-ds-06 pb-ds-05 pt-ds-06">
              {!clientMode && editingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full bg-transparent text-ds-lg font-semibold text-surface-fg outline-none"
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <h2
                  onClick={clientMode ? undefined : () => setEditingTitle(true)}
                  className={cn(
                    'text-ds-lg font-semibold text-surface-fg',
                    !clientMode && 'cursor-text hover:text-accent-11 transition-colors',
                  )}
                >
                  {task.title}
                </h2>
              )}
              {task.parentTaskId && (
                <p className="mt-ds-02 text-ds-sm text-surface-fg-subtle">
                  Subtask
                </p>
              )}
              {headerSlot && (
                <div className="mt-ds-03 flex items-center gap-ds-03">
                  {headerSlot}
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Properties Section */}
              <div className="border-b border-surface-border-strong px-ds-06 py-ds-05">
                <TaskProperties
                  task={task}
                  columns={columns}
                  members={members}
                  onUpdate={(field, value) => {
                    if (clientMode && !clientEditableFields.includes(field)) return
                    onPropertyUpdate?.(field, value)
                  }}
                  onAssign={(userId) => onAssign?.(userId)}
                  onUnassign={(userId) => onUnassign?.(userId)}
                  readOnly={clientMode}
                  editableFields={clientMode ? clientEditableFields : undefined}
                  renderPriorityIndicator={renderPriorityIndicator}
                  renderDatePicker={renderDatePicker}
                />
              </div>

              {/* Tab Bar */}
              <div className="sticky top-0 z-raised bg-surface-1 px-ds-06">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList variant="line">
                    {beforeTabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.icon && <span className="[&>svg]:h-ico-sm [&>svg]:w-ico-sm shrink-0">{tab.icon}</span>}
                        {tab.label}
                      </TabsTrigger>
                    ))}
                    {visibleTabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        <tab.icon className="h-ico-sm w-ico-sm" stroke={1.5} />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                    {afterTabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.icon && <span className="[&>svg]:h-ico-sm [&>svg]:w-ico-sm shrink-0">{tab.icon}</span>}
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Tab Content */}
              <div className="px-ds-06 py-ds-05">
                {activeTab === 'subtasks' && (
                  <SubtasksTab
                    subtasks={task.subtasks ?? []}
                    terminalColumnId={terminalColumnId}
                    projectId={task.projectId}
                    parentTaskId={task.id}
                    defaultColumnId={defaultColumnId}
                    onCreateSubtask={clientMode ? () => {} : (title) => onCreateSubtask?.(title)}
                    onToggleSubtask={clientMode ? () => {} : (id, complete) => onToggleSubtask?.(id, complete)}
                    readOnly={clientMode}
                  />
                )}

                {activeTab === 'review' && !clientMode && (
                  <ReviewTab
                    reviews={task.reviewRequests}
                    members={members}
                    onRequestReview={(id) => onRequestReview?.(id)}
                    onUpdateStatus={(id, status, feedback) => onUpdateReviewStatus?.(id, status, feedback)}
                  />
                )}

                {activeTab === 'conversation' && (
                  <ConversationTab
                    comments={displayComments}
                    taskVisibility={task.visibility}
                    onPostComment={(content, authorType) => onPostComment?.(content, authorType)}
                    clientMode={clientMode}
                    renderEditor={renderEditor}
                    renderViewer={renderViewer}
                  />
                )}

                {activeTab === 'files' && (
                  <FilesTab
                    files={task.files ?? []}
                    onUpload={clientMode ? () => {} : (file, title) => onUploadFile?.(file, title)}
                    onDelete={clientMode ? () => {} : (id) => onDeleteFile?.(id)}
                    isUploading={isUploading}
                    readOnly={clientMode}
                  />
                )}

                {activeTab === 'activity' && (
                  <ActivityTab activities={activities} />
                )}

                {/* Extra tab content */}
                {extraTabs.map((tab) =>
                  activeTab === tab.id ? (
                    <React.Fragment key={tab.id}>{tab.content}</React.Fragment>
                  ) : null,
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
})

TaskDetailPanel.displayName = 'TaskDetailPanel'

export { TaskDetailPanel }
export type { TaskDetailPanelProps }
