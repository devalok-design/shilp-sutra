# TaskDetailPanel

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    task: FullTask | null (REQUIRED)
    loading: boolean (default: false)
    open: boolean (REQUIRED)
    onOpenChange: (open: boolean) => void (REQUIRED)
    columns: Column[] (REQUIRED)
    members: Member[] (REQUIRED)
    activities: AuditLogEntry[] (default: [])
    enrichedComments: Comment[] | null (override comments from separate API)
    clientMode: boolean (default: false) — hides staff-only tabs/fields
    clientEditableFields: string[] (default: ['priority', 'dueDate'])
    headerSlot: ReactNode (content between title and properties)
    extraTabs: ExtraTab[] (default: []) — additional tab panels alongside built-in tabs
    onTitleUpdate: (title: string) => void
    onPropertyUpdate: (field: string, value: unknown) => void
    onAssign: (userId: string) => void
    onUnassign: (userId: string) => void
    onCreateSubtask: (title: string) => void
    onToggleSubtask: (taskId: string, isComplete: boolean) => void
    onRequestReview: (reviewerId: string) => void
    onUpdateReviewStatus: (reviewId: string, status: string, feedback?: string) => void
    onPostComment: (content: string, authorType: 'INTERNAL' | 'CLIENT') => void
    onUploadFile: (file: File, title?: string) => void
    onUploadDeliverable: (file: File, deliverableId?: string) => void
    onDeleteFile: (fileId: string) => void
    onTabChange: (tab: string) => void
    renderEditor: (props: { content: string; onChange: (content: string) => void; placeholder: string }) => ReactNode
    renderViewer: (props: { content: string; className?: string }) => ReactNode
    renderPriorityIndicator: (props: { priority: string }) => ReactNode
    renderDatePicker: (props: { value: Date | null; onChange: (date: Date | null) => void; placeholder: string; className?: string }) => ReactNode
    isUploading: boolean (default: false)

## FullTask Shape
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
    comments: Comment[] (optional)
    files: TaskFile[]
    createdAt: string
    updatedAt: string
    metadata: Record<string, unknown> (optional)

## ExtraTab Shape
    id: string
    label: string
    icon: ReactNode (optional)
    content: ReactNode
    position: 'before' | 'after' (default: 'after')

## Built-in Tabs
    subtasks, review, conversation, files, activity

## Defaults
    loading=false, clientMode=false, clientEditableFields=['priority','dueDate'], activities=[], extraTabs=[], isUploading=false

## Example
```jsx
<TaskDetailPanel
  task={selectedTask}
  open={isPanelOpen}
  onOpenChange={setIsPanelOpen}
  columns={projectColumns}
  members={teamMembers}
  activities={auditLog}
  onPropertyUpdate={(field, value) => updateTask(field, value)}
  onPostComment={(content, type) => postComment(content, type)}
/>
```

## Gotchas
- Renders as a Sheet (side panel) on the right, 40% width (min 380px).
- In clientMode, only the Conversation tab is shown. Staff-only tabs (subtasks, review, files, activity) are hidden.
- In clientMode, title editing is disabled and properties respect clientEditableFields.
- Title is editable by clicking on it (staff mode only).
- enrichedComments takes priority over task.comments when both are provided.
- extraTabs with position="before" render before built-in tabs; default "after" appends them.
- Forwards ref to SheetContent.

## Changes
### v0.18.0
- **Added** Initial release
