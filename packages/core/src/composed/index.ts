/**
 * @module @devalok/shilp-sutra/composed
 *
 * Higher-level composed components built from UI primitives: page headers, date pickers,
 * rich text editors, skeleton loaders, and domain-specific patterns.
 *
 * **Server-safe components** (import individually for Server Components):
 * `ContentCard`, `PageHeader`, `LoadingSkeleton`, `PageSkeletons`,
 * `PriorityIndicator`
 *
 * @example
 * import { PageHeader } from '@devalok/shilp-sutra/composed/page-header'
 * import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'
 */

export type { ActivityFeedProps, ActivityItem, GroupLabels } from './activity-feed'
export { ActivityFeed, groupItemsByTime } from './activity-feed'
export type { AvatarGroupProps, AvatarUser } from './avatar-group'
export { AvatarGroup } from './avatar-group'
export type { BulkActionBarAction,BulkActionBarProps } from './bulk-action-bar'
export { BulkActionBar } from './bulk-action-bar'
export type { CommandGroup, CommandItem, CommandPaletteProps, FooterHint } from './command-palette'
export { CommandPalette } from './command-palette'
export type { ConfirmDialogProps } from './confirm-dialog'
export { ConfirmDialog } from './confirm-dialog'
export type { ContentCardProps } from './content-card'
export { ContentCard, contentCardVariants } from './content-card'
// date-picker family removed from barrel in 0.40.0 — hard peer `date-fns` was
// pulled even by consumers not using any date components. Import per-component:
//   import { DatePicker, DateRangePicker, DateTimePicker, TimePicker, CalendarGrid, MonthPicker, YearPicker, Presets, useCalendar } from '@devalok/shilp-sutra/composed/date-picker'
export type { DeadlineIndicatorProps } from './deadline-indicator'
export { DeadlineIndicator } from './deadline-indicator'
// EmojiPicker / EmojiPickerPopover removed from barrel in 0.40.0 — hard peers
// `@emoji-mart/data` + `@emoji-mart/react` were pulled even when consumers did
// not render either component. Import per-component:
//   import { EmojiPicker, EmojiPickerPopover, type EmojiData } from '@devalok/shilp-sutra/composed/emoji-picker'
export type { EmptyStateProps } from './empty-state'
export { EmptyState } from './empty-state'
export type { ErrorBoundaryProps,ErrorDisplayProps } from './error-boundary'
export { ErrorBoundary,ErrorDisplay } from './error-boundary'
// TipTap extension primitives removed from barrel in 0.40.0 — hard peer
// `@tiptap/*` was pulled even when consumers used no rich-text components.
// Import per-component:
//   import { EmojiNode, type EmojiNodeAttrs } from '@devalok/shilp-sutra/composed/extensions/emoji-node'
//   import { createEmojiSuggestion } from '@devalok/shilp-sutra/composed/extensions/emoji-suggestion'
// SlashCommand types remain barrel-safe (type-only, no runtime peer import):
export type { SlashCommand, SlashCommandGroup } from './extensions/slash-command'
// FilePreview removed from barrel in 0.40.0 — hard peers `react-pdf` +
// `react-zoom-pan-pinch` were pulled even when consumers never rendered it.
// Import per-component:
//   import { FilePreview, type FilePreviewProps } from '@devalok/shilp-sutra/composed/file-preview'
export type { FilterBarProps, FilterMultiSelectProps,FilterSelectProps } from './filter-bar'
export { FilterBar, FilterMultiSelect,FilterSelect } from './filter-bar'
export type { FormSectionProps } from './form-section'
export { FormSection } from './form-section'
export type { GlobalLoadingProps } from './global-loading'
export { GlobalLoading } from './global-loading'
export type { InlineEditProps } from './inline-edit'
export { InlineEdit } from './inline-edit'
export { getInitials } from './lib/string-utils'
export type { BoardSkeletonProps, CardSkeletonProps, ListSkeletonProps,TableSkeletonProps } from './loading-skeleton'
export { BoardSkeleton, CardSkeleton, ListSkeleton,TableSkeleton } from './loading-skeleton'
// MarkdownViewer removed from barrel in 0.40.0 — hard peers `react-markdown`,
// `react-syntax-highlighter`, `remark-gfm` were pulled even when consumers
// never rendered it. Import per-component:
//   import { MarkdownViewer, type MarkdownViewerProps } from '@devalok/shilp-sutra/composed/markdown-viewer'
export type { MasterDetailProps } from './master-detail'
export { MasterDetail } from './master-detail'
export type { MemberPickerMember,MemberPickerProps } from './member-picker'
export { MemberPicker } from './member-picker'
export type { MultiSelectGroup,MultiSelectItem, MultiSelectPopoverProps } from './multi-select-popover'
export { MultiSelectPopover } from './multi-select-popover'
export type { Breadcrumb,PageHeaderProps } from './page-header'
export { PageHeader } from './page-header'
export {
  DashboardSkeleton,
  ProjectListSkeleton,
  TaskDetailSkeleton,
} from './page-skeletons'
export type { Priority,PriorityIndicatorProps } from './priority-indicator'
export { PriorityIndicator } from './priority-indicator'
export type {
  ResponsiveModalContentProps,
  ResponsiveModalProps,
} from './responsive-modal'
export {
  ResponsiveModal,
  ResponsiveModalBackground,
  ResponsiveModalBody,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalOverlay,
  ResponsiveModalPortal,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from './responsive-modal'
// RichChatInput + RichTextEditor families removed from barrel in 0.40.0 — hard
// peer `@tiptap/*` was pulled even by consumers using no rich-text components.
// Import per-component:
//   import { RichChatInput, AudioPlayer, AudioWaveform, useVoiceRecorder, type RichChatInputProps } from '@devalok/shilp-sutra/composed/rich-chat-input'
//   import { RichTextEditor, RichTextViewer, type RichTextEditorProps, type MentionItem } from '@devalok/shilp-sutra/composed/rich-text-editor'
export type { ScheduleEvent,ScheduleViewProps } from './schedule-view'
export { ScheduleView } from './schedule-view'
export type { SimpleTooltipProps } from './simple-tooltip'
export { SimpleTooltip } from './simple-tooltip'
export type { StatusBadgeProps } from './status-badge'
export { StatusBadge } from './status-badge'
