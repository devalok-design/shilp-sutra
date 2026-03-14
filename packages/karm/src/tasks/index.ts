// Compound component (v2 composition API)
export { TaskPanel } from './task-panel'
export type {
  TaskPanelRootProps,
  TaskPanelHeaderProps,
  TaskPanelTitleProps,
  TaskPanelPropertiesProps,
  TaskPanelPropertyProps,
  TaskPanelTabsProps,
  TaskPanelTabProps,
  TaskPanelLoadingProps,
} from './task-panel'

// Pickers
export {
  TaskColumnPicker,
  type TaskColumnPickerProps,
  TaskPriorityPicker,
  type TaskPriorityPickerProps,
  TaskMemberPicker,
  type TaskMemberPickerProps,
  TaskAssigneePicker,
  type TaskAssigneePickerProps,
  TaskDatePicker,
  type TaskDatePickerProps,
  TaskLabelEditor,
  type TaskLabelEditorProps,
  TaskVisibilityPicker,
  type TaskVisibilityPickerProps,
} from './pickers'

// Tab pieces
export {
  // Subtask pieces
  SubtaskProgress,
  type SubtaskProgressProps,
  SubtaskList,
  type SubtaskListProps,
  SubtaskItem,
  type SubtaskItemProps,
  SubtaskAddForm,
  type SubtaskAddFormProps,
  // Conversation pieces
  MessageList,
  type MessageListProps,
  MessageBubble,
  type MessageBubbleProps,
  MessageInput,
  type MessageInputProps,
  VisibilityWarning,
  type VisibilityWarningProps,
  // File pieces
  FileDropZone,
  type FileDropZoneProps,
  FileList,
  type FileListProps,
  FileItem,
  type FileItemProps,
  // Review pieces
  ReviewCard,
  type ReviewCardProps,
  ReviewResponseForm,
  type ReviewResponseFormProps,
  ReviewRequestButton,
  type ReviewRequestButtonProps,
  // Activity pieces
  ActivityTimeline,
  type ActivityTimelineProps,
  ActivityEntry,
  type ActivityEntryProps,
} from './tabs'

// Pre-assembled tabs
export { SubtasksTab, type SubtasksTabProps } from './subtasks-tab'
export { ConversationTab, type ConversationTabProps } from './conversation-tab'
export { FilesTab, type FilesTabProps } from './files-tab'
export { ReviewTab, type ReviewTabProps } from './review-tab'
export { ActivityTab, type ActivityTabProps } from './activity-tab'

// Shared types
export type {
  Priority,
  Visibility,
  CommentAuthorType,
  LabelOption,
  Member,
  Column,
  Subtask,
  ReviewUser,
  ReviewRequest,
  CommentAuthor,
  Comment,
  TaskFile,
  AuditLogEntry,
} from './task-types'

// Legacy — properties component
export { TaskProperties, type TaskPropertiesProps, type TaskData } from './task-properties'

/** @deprecated Use TaskPanel composition API */
export { TaskDetailPanel, type TaskDetailPanelProps, type FullTask, type ExtraTab } from './task-detail-panel'
