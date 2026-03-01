'use client'

import * as React from 'react'
import { cn } from '../../ui/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '../../ui/sheet'
import VisuallyHidden from '../../ui/visually-hidden'
import { Skeleton } from '../../ui/skeleton'
import { TaskProperties, type Member, type Column } from './task-properties'
import { SubtasksTab, type Subtask } from './subtasks-tab'
import { ReviewTab, type ReviewRequest } from './review-tab'
import { ConversationTab, type Comment } from './conversation-tab'
import { FilesTab, type TaskFile } from './files-tab'
import { ActivityTab, type AuditLogEntry } from './activity-tab'
import {
  ListChecks,
  GitPullRequest,
  MessageCircle,
  Paperclip,
  Activity,
} from 'lucide-react'

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
  comments: Comment[]
  files: TaskFile[]
  createdAt: string
  updatedAt: string
}

interface TaskDetailPanelProps {
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
  { id: 'subtasks', label: 'Subtasks', icon: ListChecks },
  { id: 'review', label: 'Review', icon: GitPullRequest },
  { id: 'conversation', label: 'Conversation', icon: MessageCircle },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'activity', label: 'Activity', icon: Activity },
] as const

type TabId = typeof TABS[number]['id']

// ============================================================
// Loading Skeleton
// ============================================================

function PanelSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-7 w-3/4 bg-[var(--color-field)]" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-[120px] bg-[var(--color-field)]" />
            <Skeleton className="h-4 flex-1 bg-[var(--color-field)]" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 border-b border-[var(--color-border-default)] pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16 bg-[var(--color-field)]" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full bg-[var(--color-field)]" />
        <Skeleton className="h-10 w-full bg-[var(--color-field)]" />
        <Skeleton className="h-10 w-4/5 bg-[var(--color-field)]" />
      </div>
    </div>
  )
}

// ============================================================
// Task Detail Panel
// ============================================================

function TaskDetailPanel({
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
  onDeleteFile,
  onTabChange,
  renderEditor,
  renderViewer,
  renderPriorityIndicator,
  renderDatePicker,
  isUploading = false,
}: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>(clientMode ? 'conversation' : 'subtasks')
  const [editingTitle, setEditingTitle] = React.useState(false)
  const [titleValue, setTitleValue] = React.useState('')
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  // Reset state when task changes
  React.useEffect(() => {
    if (task) {
      setTitleValue(task.title)
      setEditingTitle(false)
    }
  }, [task?.id])

  // Reset active tab when opening
  React.useEffect(() => {
    if (open) {
      setActiveTab(clientMode ? 'conversation' : 'subtasks')
    }
  }, [open, clientMode])

  const handleTabChange = (tabId: TabId) => {
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

  const displayComments = enrichedComments || task?.comments || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'w-full sm:max-w-none sm:w-[40%] min-w-[380px] p-0',
          'flex flex-col overflow-hidden',
          'border-l border-[var(--color-border-default)] bg-[var(--color-layer-01)]',
        )}
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
            <div className="shrink-0 border-b border-[var(--color-border-default)] px-6 pb-4 pt-6">
              {!clientMode && editingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full bg-transparent text-[18px] font-body font-semibold leading-snug text-[var(--color-text-primary)] outline-none"
                />
              ) : (
                <h2
                  onClick={clientMode ? undefined : () => setEditingTitle(true)}
                  className={cn(
                    'text-[18px] font-body font-semibold leading-snug text-[var(--color-text-primary)]',
                    !clientMode && 'cursor-text hover:text-[var(--color-interactive)] transition-colors',
                  )}
                >
                  {task.title}
                </h2>
              )}
              {task.parentTaskId && (
                <p className="mt-1 text-[11px] font-body text-[var(--color-text-placeholder)]">
                  Subtask
                </p>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Properties Section */}
              <div className="border-b border-[var(--color-border-default)] px-6 py-4">
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
              <div className="sticky top-0 z-10 border-b border-[var(--color-border-default)] bg-[var(--color-layer-01)] px-6">
                <div className="flex gap-0">
                  {visibleTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id

                    let count: number | null = null
                    if (tab.id === 'subtasks') count = task.subtasks.length
                    if (tab.id === 'review') count = task.reviewRequests.length
                    if (tab.id === 'conversation') count = displayComments.length
                    if (tab.id === 'files') count = task.files.length

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                          'relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-body font-medium transition-colors',
                          isActive
                            ? 'text-[var(--color-interactive)]'
                            : 'text-[var(--color-text-placeholder)] hover:text-[var(--color-text-secondary)]',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span>{tab.label}</span>
                        {count !== null && count > 0 && (
                          <span
                            className={cn(
                              'ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-semibold',
                              isActive
                                ? 'bg-[var(--color-interactive)]/15 text-[var(--color-interactive)]'
                                : 'bg-[var(--color-field)] text-[var(--color-text-placeholder)]',
                            )}
                          >
                            {count}
                          </span>
                        )}

                        {isActive && (
                          <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[var(--color-interactive)]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-6 py-4">
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
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

TaskDetailPanel.displayName = 'TaskDetailPanel'

export { TaskDetailPanel }
export type { TaskDetailPanelProps }
