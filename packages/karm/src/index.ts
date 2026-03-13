// ============================================================
// karm/ Module Boundary Rules
// ============================================================
// karm/ components may import from:
//   - ui/ components (../../ui/*)
//   - ui/lib/utils (cn utility)
//   - ui/lib/slot (Slot for asChild pattern)
//   - composed/ components (../../composed/*)
//   - shell/ components (../../shell/*)
//   - hooks/ (../../hooks/*)
//   - Within karm/ (sibling modules)
//
// karm/ components must NOT import from:
//   - primitives/_internal/
//   - @primitives/* path alias
//   - Any non-exported internal utility
//
// This ensures karm/ can be cleanly extracted to
// @devalok/shilp-sutra-karm in the future.
// ============================================================

// Page skeletons (domain-specific)
export { DevsabhaSkeleton, BandwidthSkeleton } from './page-skeletons'

// Board components
export {
  KanbanBoard,
  type KanbanBoardProps,
  BoardColumn,
  type BoardColumnProps,
  TaskCard,
  TaskCardCompact,
  TaskCardOverlay,
  TaskCardCompactOverlay,
  BoardProvider,
  useBoardContext,
  type BoardProviderProps,
  BoardToolbar,
  BulkActionBar,
  TaskContextMenu,
  type TaskContextMenuProps,
  useBoardKeyboard,
  ColumnHeader,
  ColumnEmpty,
  type BoardTask,
  type BoardMember,
  type BoardColumnType,
  type BoardData,
  type BoardFilters,
  type BoardViewMode,
  type NewTaskOptions,
  type BulkAction,
  type TaskCardProps,
  type TaskCardOverlayProps,
} from './board'

// Task components
export {
  TaskDetailPanel,
  type TaskDetailPanelProps,
  type FullTask,
  TaskProperties,
  type TaskPropertiesProps,
  type Member,
  type Column,
  type TaskData,
  ActivityTab,
  type ActivityTabProps,
  type AuditLogEntry,
  ConversationTab,
  type ConversationTabProps,
  type Comment,
  FilesTab,
  type FilesTabProps,
  type TaskFile,
  ReviewTab,
  type ReviewTabProps,
  type ReviewRequest,
  SubtasksTab,
  type SubtasksTabProps,
  type Subtask,
} from './tasks'

// Chat components
export {
  ChatPanel,
  type ChatPanelProps,
  type Agent,
  ChatInput,
  type ChatInputProps,
  MessageList,
  type ChatMessage,
  type MessageListProps,
  ConversationList,
  type Conversation,
  type ConversationListProps,
  StreamingText,
  type StreamingTextProps,
} from './chat'

// Dashboard components
export {
  AttendanceCTA,
  type AttendanceCTAProps,
  DailyBrief,
  type DailyBriefProps,
  type BriefData,
  ScratchpadWidget,
  type ScratchpadWidgetProps,
  type ScratchpadItem,
  SidebarScratchpad,
  type SidebarScratchpadProps,
} from './dashboard'

// Client portal components
export {
  AccentProvider,
  type AccentProviderProps,
  ClientPortalHeader,
  type ClientPortalHeaderProps,
  ProjectCard,
  type ProjectCardProps,
} from './client'

// Admin components
export {
  AdminDashboard,
  type AdminDashboardRootProps,
  type AdminDashboardCalendarProps,
  type AdminDashboardAttendanceOverviewProps,
  type AdminDashboardAssociateDetailProps,
  type AdminDashboardLeaveRequestsProps,
  type AdminDashboardContentProps,
  Calendar,
  type CalendarProps,
  BreakRequestCard,
  type BreakRequestProps,
  LeaveRequests,
  type LeaveRequestsProps,
  AdminDashboardSkeleton,
  RenderDate,
  type RenderDateProps,
  type DateAttendanceInfo,
  DashboardHeader,
  type DashboardHeaderProps,
  AttendanceOverview,
  type AttendanceOverviewProps,
  AssociateDetail,
  type AssociateDetailProps,
  CorrectionList,
  type CorrectionListProps,
  BreakAdmin,
  type BreakAdminProps,
  BreakAdminHeader,
  type BreakAdminHeaderProps,
  Breaks,
  type BreaksProps,
  LeaveRequest,
  type LeaveRequestProps,
  BreakBalance,
  type BreakBalanceProps,
  EditBreak,
  type EditBreakProps,
  EditBreakBalance,
  type EditBreakBalanceProps,
  DeleteBreak,
  type DeleteBreakProps,
  BreakAdminSkeleton,
  ApprovedAdjustments,
  type ApprovedAdjustmentsProps,
  AdjustmentType,
  renderAdjustmentType,
  renderStatus,
  formatDate,
  formatDateIST,
  formatTimeIST,
  formatDateWithWeekday,
  formatOptionalDate,
  getDaySuffix,
  isSameDay,
  getWeekDays,
  getMonthDays,
  getStartOfDay,
  getEndOfDay,
  removeAllEmojis,
  removeEmojiAtStart,
  type AdminUser,
  type AttendanceRecord,
  type GroupedAttendance,
  type RealtimeCallbacks,
  type TaskItem,
  type AttendanceCorrection,
  type BreakAdminFilters,
  type UserRole,
  type AttendanceStatus,
  type CorrectionStatus,
  type BreakRequestStatus,
  type BreakRequest,
  type BreakBalanceData,
  type Adjustment,
  type DayInfo,
} from './admin'

// Shell configuration
export { karmCommandRegistry } from './shell/karm-command-registry'
