// packages/karm/src/board/board-constants.ts
import type { BoardFilters } from './board-types'

export const COLUMN_WIDTH = 320

export const COLUMN_ACCENT_COLORS = [
  'bg-category-cyan-9',
  'bg-category-amber-9',
  'bg-category-teal-9',
  'bg-category-indigo-9',
  'bg-category-orange-9',
  'bg-category-emerald-9',
  'bg-category-slate-9',
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
  MEDIUM: 'text-warning-11',
  HIGH: 'text-error-11',
  URGENT: 'text-error-11',
} as const

export const DEFAULT_FILTERS: BoardFilters = {
  search: '',
  assignees: [],
  priorities: [],
  labels: [],
  dueDateRange: null,
}
