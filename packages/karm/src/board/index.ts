export { KanbanBoard, type BoardData, type KanbanBoardProps } from './kanban-board'
export { BoardColumn, type BoardColumnData, type BoardColumnProps } from './board-column'
export { TaskCard, TaskCardOverlay, type BoardTask, type TaskCardProps, type TaskCardOverlayProps } from './task-card'

export type {
  BoardTask as BoardTaskV2, BoardMember, BoardColumn as BoardColumnV2, BoardData as BoardDataV2,
  BoardFilters, BoardViewMode, BulkAction,
} from './board-types'
export { COLUMN_WIDTH, COLUMN_ACCENT_COLORS, PRIORITY_ICONS, PRIORITY_COLORS, DEFAULT_FILTERS } from './board-constants'
