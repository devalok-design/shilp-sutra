// packages/karm/src/board/board-types.ts

export interface BoardTask {
  id: string
  taskId: string
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
}

export interface BoardMember {
  id: string
  name: string
  image: string | null
}

export interface BoardColumn {
  id: string
  name: string
  isClientVisible?: boolean
  wipLimit?: number
  tasks: BoardTask[]
}

export interface BoardData {
  columns: BoardColumn[]
}

export interface BoardFilters {
  search: string
  assignees: string[]
  priorities: string[]
  labels: string[]
  dueDateRange: 'overdue' | 'today' | 'this-week' | 'none' | null
}

export type BoardViewMode = 'default' | 'compact'

export interface BulkAction {
  type: 'move' | 'priority' | 'assign' | 'label' | 'dueDate' | 'delete' | 'visibility'
  taskIds: string[]
  value?: string | null
}
