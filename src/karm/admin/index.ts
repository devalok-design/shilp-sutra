// ============================================================
// Admin Module — Barrel Exports
// ============================================================

// Types
export type {
  UserRole,
  AttendanceStatus,
  CorrectionStatus,
  BreakRequestStatus,
  AdminUser,
  AttendanceRecord,
  BreakRequest,
  BreakBalanceData,
  Adjustment,
  GroupedAttendance,
  DayInfo,
  RealtimeCallbacks,
} from './types'

// Dashboard
export {
  AdminDashboard,
  type AdminDashboardRootProps,
  type AdminDashboardCalendarProps,
  type AdminDashboardAttendanceOverviewProps,
  type AdminDashboardAssociateDetailProps,
  type AdminDashboardLeaveRequestsProps,
  type AdminDashboardContentProps,
  type TaskItem,
  type AttendanceCorrection,
  Calendar,
  type CalendarProps,
  BreakRequestCard,
  type BreakRequestProps,
  LeaveRequests,
  type LeaveRequestsProps,
  DashboardSkeleton as AdminDashboardSkeleton,
} from './dashboard'

// Break management
export {
  BreakAdmin,
  type BreakAdminProps,
  BreakAdminHeader,
  type BreakAdminHeaderProps,
  type BreakAdminFilters,
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
} from './break'

// Adjustments
export {
  ApprovedAdjustments,
  type ApprovedAdjustmentsProps,
} from './adjustments'

// Utilities (re-export for consumer convenience)
export { renderStatus } from './utils/render-status'
export {
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
} from './utils/date-utils'
export { removeAllEmojis, removeEmojiAtStart } from './utils/emoji-utils'
