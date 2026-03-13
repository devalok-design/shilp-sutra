/**
 * @module @devalok/shilp-sutra/composed
 *
 * Higher-level composed components built from UI primitives: page headers, date pickers,
 * rich text editors, skeleton loaders, and domain-specific patterns.
 *
 * **Server-safe components** (import individually for Server Components):
 * `ContentCard`, `EmptyState`, `PageHeader`, `LoadingSkeleton`, `PageSkeletons`,
 * `PriorityIndicator`, `StatusBadge`
 *
 * @example
 * import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'
 * import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'
 */

export { PageHeader } from './page-header'
export type { PageHeaderProps, Breadcrumb } from './page-header'

export { ContentCard, contentCardVariants } from './content-card'
export type { ContentCardProps } from './content-card'

export { StatusBadge, statusBadgeVariants } from './status-badge'
export type { StatusBadgeProps } from './status-badge'

export { EmptyState } from './empty-state'
export type { EmptyStateProps } from './empty-state'

export { AvatarGroup } from './avatar-group'
export type { AvatarGroupProps, AvatarUser } from './avatar-group'

export { PriorityIndicator } from './priority-indicator'
export type { PriorityIndicatorProps, Priority } from './priority-indicator'

export { RichTextEditor, RichTextViewer } from './rich-text-editor'
export type { RichTextEditorProps, RichTextViewerProps, MentionItem } from './rich-text-editor'

export { DatePicker, DateRangePicker, CalendarGrid, TimePicker, DateTimePicker, Presets, useCalendar, YearPicker, MonthPicker } from './date-picker'
export type { DatePickerProps, DateRangePickerProps, CalendarGridProps, CalendarEvent, TimePickerProps, DateTimePickerProps, PresetsProps, PresetKey, YearPickerProps, MonthPickerProps } from './date-picker'

export { CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton } from './loading-skeleton'
export type { CardSkeletonProps, TableSkeletonProps, BoardSkeletonProps, ListSkeletonProps } from './loading-skeleton'

export {
  DashboardSkeleton,
  ProjectListSkeleton,
  TaskDetailSkeleton,
} from './page-skeletons'

export { ErrorDisplay } from './error-boundary'
export type { ErrorDisplayProps } from './error-boundary'

export { GlobalLoading } from './global-loading'
export type { GlobalLoadingProps } from './global-loading'

export { CommandPalette } from './command-palette'
export type { CommandPaletteProps, CommandGroup, CommandItem } from './command-palette'

export { MemberPicker } from './member-picker'
export type { MemberPickerProps, MemberPickerMember } from './member-picker'

export { SimpleTooltip } from './simple-tooltip'
export type { SimpleTooltipProps } from './simple-tooltip'

export { ScheduleView } from './schedule-view'
export type { ScheduleViewProps, ScheduleEvent } from './schedule-view'

export { ConfirmDialog } from './confirm-dialog'
export type { ConfirmDialogProps } from './confirm-dialog'

export { ActivityFeed } from './activity-feed'
export type { ActivityItem, ActivityFeedProps } from './activity-feed'

export { getInitials } from './lib/string-utils'
