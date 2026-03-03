// ============================================================
// karm/ Module Boundary Rules
// ============================================================
// karm/ components may import from:
//   - ui/ components (../../ui/*)
//   - ui/lib/utils (cn utility)
//   - ui/lib/slot (Slot for asChild pattern)
//   - shared/ components (../../shared/*)
//   - layout/ components (../../layout/*)
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
  type BoardData,
  type KanbanBoardProps,
  BoardColumn,
  type BoardColumnData,
  type BoardColumnProps,
  TaskCard,
  TaskCardOverlay,
  type BoardTask,
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

// Segmented control components
export {
  SegmentedControl,
  type SegmentedControlProps,
  SegmentedControlItem,
  type SegmentedControlItemProps,
  segmentedControlItemVariants,
  type SegmentedControlSize,
  type SegmentedControlColor,
  type SegmentedControlOption,
} from './custom-buttons'

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
  type AdminUser,
  type AttendanceRecord,
  type GroupedAttendance,
  type RealtimeCallbacks,
} from './admin'
