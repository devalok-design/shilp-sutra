# Board Types

- Import: @devalok/shilp-sutra-karm/board
- Category: board

## BoardTask
    id: string
    taskId: string (display ID, e.g. "KRM-42")
    title: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    labels: string[]
    dueDate: string | null
    isBlocked: boolean
    visibility: 'INTERNAL' | 'EVERYONE'
    owner: BoardMember | null
    assignees: BoardMember[]
    subtaskCount: number
    subtasksDone: number

## BoardMember
    id: string
    name: string
    image: string | null

## BoardColumn
    id: string
    name: string
    isClientVisible: boolean (optional)
    wipLimit: number (optional)
    tasks: BoardTask[]

## BoardData
    columns: BoardColumn[]

## BoardFilters
    search: string
    assignees: string[]
    priorities: string[]
    labels: string[]
    dueDateRange: 'overdue' | 'today' | 'this-week' | 'none' | null

## BoardViewMode
    'default' | 'compact'

## NewTaskOptions
    title: string
    ownerId: string | null (optional)
    dueDate: string | null (optional)

## BulkAction
    type: 'move' | 'priority' | 'assign' | 'label' | 'dueDate' | 'delete' | 'visibility'
    taskIds: string[]
    value: string | null (optional)

## Gotchas
- BoardTask.taskId is the human-readable display ID (e.g. "KRM-42"), not the same as BoardTask.id (database UUID).
- BoardColumn.wipLimit is optional; when set and exceeded, the column renders in error state.
- BoardFilters.dueDateRange can be null or 'none' to indicate no filter.

## Changes
### v0.18.0
- **Added** Initial release
