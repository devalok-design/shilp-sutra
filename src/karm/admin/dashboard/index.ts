// ============================================================
// Admin Dashboard — Barrel Exports
// ============================================================

export {
  AdminDashboard,
  type AdminDashboardProps,
} from './admin-dashboard'

// Re-exported from sub-components for backwards compatibility
export { type TaskItem } from './associate-detail'
export { type AttendanceCorrection } from './correction-list'

export { Calendar, type CalendarProps } from './calendar'

export { BreakRequestCard, type BreakRequestProps } from './break-request'

export { LeaveRequests, type LeaveRequestsProps } from './leave-requests'

export { DashboardSkeleton } from './dashboard-skeleton'

// ============================================================
// Extracted sub-components (available for standalone use)
// ============================================================

export {
  RenderDate,
  type RenderDateProps,
  type DateAttendanceInfo,
} from './render-date'

export {
  DashboardHeader,
  type DashboardHeaderProps,
} from './dashboard-header'

export {
  AttendanceOverview,
  type AttendanceOverviewProps,
} from './attendance-overview'

export {
  AssociateDetail,
  type AssociateDetailProps,
} from './associate-detail'

export {
  CorrectionList,
  type CorrectionListProps,
} from './correction-list'
