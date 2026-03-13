// packages/karm/src/board/board-constants.ts
import type { BoardFilters } from './board-types'

export const COLUMN_WIDTH = 320

export const COLUMN_ACCENT_COLORS = [
  'bg-category-cyan',
  'bg-category-amber',
  'bg-category-teal',
  'bg-category-indigo',
  'bg-category-orange',
  'bg-category-emerald',
  'bg-category-slate',
  'bg-accent-9',
] as const

export const PRIORITY_ICONS = {
  LOW: 'IconArrowDown',
  MEDIUM: 'IconArrowRight',
  HIGH: 'IconArrowUp',
  URGENT: 'IconAlertTriangle',
} as const

export const PRIORITY_COLORS = {
  LOW: 'text-surface-fg-subtle',
  MEDIUM: 'text-warning',
  HIGH: 'text-error',
  URGENT: 'text-error',
} as const

export const DEFAULT_FILTERS: BoardFilters = {
  search: '',
  assignees: [],
  priorities: [],
  labels: [],
  dueDateRange: null,
}
