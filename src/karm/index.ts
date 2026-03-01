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
  type ButtonType,
  FAB,
  type FABSize,
  ExtendedFAB,
  type ExtendedFABSize,
  type ExtendedFABColor,
  IconButton,
  type IconButtonProps,
  AdminSwitch,
  Toggle,
  type ToggleSize,
  type ToggleColor,
  type ToggleOption,
} from './custom-buttons'

// Admin components
export {
  AdminDashboard,
  type AdminDashboardProps,
  Calendar,
  type CalendarProps,
  BreakRequestCard,
  DashboardSkeleton,
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
