# TaskProperties

- Import: @devalok/shilp-sutra-karm/tasks
- Server-safe: No
- Category: tasks

## Props
    task: TaskData (REQUIRED)
    columns: Column[] (REQUIRED)
    members: Member[] (REQUIRED)
    onUpdate: (field: string, value: unknown) => void (REQUIRED)
    onAssign: (userId: string) => void (REQUIRED)
    onUnassign: (userId: string) => void (REQUIRED)
    readOnly: boolean (default: false)
    editableFields: string[] (field names the client can still edit when readOnly=true)
    renderPriorityIndicator: (props: { priority: string }) => ReactNode
    renderDatePicker: (props: { value: Date | null; onChange: (date: Date | null) => void; placeholder: string; className?: string }) => ReactNode
    onConfirmVisibilityChange: () => void (called when switching to EVERYONE; if omitted, change applies immediately)
    ...HTMLAttributes<HTMLDivElement>

## TaskData Shape
    id: string
    columnId: string
    column: { id: string; name: string }
    ownerId: string | null
    owner: Member | null
    assignees: { user: Member }[]
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    dueDate: string | null
    labels: string[]
    visibility: 'INTERNAL' | 'EVERYONE'

## Member Shape
    id: string
    name: string
    email: string (optional)
    image: string | null (optional)

## Column Shape
    id: string
    name: string
    isDefault: boolean (optional)
    isTerminal: boolean (optional)

## Property Rows
    Column — popover picker
    Owner — MemberPicker (hidden in readOnly mode)
    Assignees — MemberPicker (multi-select), pill chips with remove
    Priority — popover picker with dot color indicators
    Due Date — native date input or custom renderDatePicker
    Labels — pill chips with add/remove inline input
    Visibility — toggle button (Internal / Everyone, hidden in readOnly mode)

## Defaults
    readOnly=false

## Example
```jsx
<TaskProperties
  task={taskData}
  columns={columns}
  members={members}
  onUpdate={(field, value) => updateTask(field, value)}
  onAssign={(userId) => assignUser(userId)}
  onUnassign={(userId) => unassignUser(userId)}
/>
```

## Gotchas
- In readOnly mode, Owner and Visibility rows are completely hidden.
- editableFields only applies when readOnly=true (e.g. ['priority', 'dueDate'] lets clients change those).
- onUpdate field values: 'columnId', 'ownerId', 'priority', 'dueDate', 'labels', 'visibility'.
- Uses MemberPicker from core composed library for owner/assignee selection.
- onConfirmVisibilityChange is a guard hook: when provided and user switches to EVERYONE, it is called instead of onUpdate, allowing a confirmation dialog.
- Priority and Due Date rows are always rendered as interactive popovers regardless of readOnly. Enforcement of readOnly for these fields is done at the callback level. If using TaskProperties standalone in readOnly mode, supply a no-op onUpdate to prevent unintended changes.
- Forwards ref to outer div.

## Changes
### v0.18.0
- **Added** Initial release
