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

// Board components
export {
  KanbanBoard,
  type BoardData,
  BoardColumn,
  type BoardColumnData,
  TaskCard,
  TaskCardOverlay,
  type BoardTask,
} from './board'

// Task components
export {
  TaskDetailPanel,
  TaskProperties,
  type Member,
  type Column,
  type TaskData,
  ActivityTab,
  ConversationTab,
  FilesTab,
  ReviewTab,
  SubtasksTab,
} from './tasks'

// Chat components
export {
  ChatPanel,
  ChatInput,
  MessageList,
  type ChatMessage,
  ConversationList,
  type Conversation,
  StreamingText,
} from './chat'

// Dashboard components
export {
  AttendanceCTA,
  DailyBrief,
  type BriefData,
} from './dashboard'

// Client portal components
export {
  AccentProvider,
  ClientPortalHeader,
  ProjectCard,
} from './client'

// Custom button components
export {
  CustomButton,
  type ButtonVariant,
  type ButtonType,
  /** @deprecated Use Button from ui/ instead */
  IconButton,
  type IconButtonProps,
  Toggle,
  type ToggleSize,
  type ToggleColor,
  type ToggleOption,
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
  AdminDashboardSkeleton,
  BreakAdmin,
  type BreakAdminProps,
  BreakAdminHeader,
  Breaks,
  LeaveRequest,
  BreakBalance,
  EditBreak,
  EditBreakBalance,
  DeleteBreak,
  BreakAdminSkeleton,
  ApprovedAdjustments,
  type ApprovedAdjustmentsProps,
  type AdminUser,
  type AttendanceRecord,
  type GroupedAttendance,
  type RealtimeCallbacks,
} from './admin'
