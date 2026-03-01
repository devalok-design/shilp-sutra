// ============================================================
// Admin Module — Shared Types
// ============================================================

export type UserRole = 'Apprentice' | 'Associate' | 'Admin' | 'SuperAdmin'

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'BREAK'
  | 'Not_Marked'
  | 'HOLIDAY'
  | 'WEEKEND'

export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type BreakRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export interface AdminUser {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  devalokEmail?: string
  designation: string | null
  image: string | null
  role: UserRole
  isActive: boolean
  createdAt: string | Date
}

export interface AttendanceRecord {
  id: string
  userId: string
  date: string
  timeIn: string | null
  timeOut: string | null
  status: AttendanceStatus
  correctionStatus?: CorrectionStatus | null
  reason?: string | null
  adminComment?: string | null
  requestedDate?: string | null
  newTimeIn?: string | null
  newTimeOut?: string | null
  oldTimeIn?: string | null
  oldTimeOut?: string | null
  user?: AdminUser
}

export interface BreakRequest {
  id: string
  userId: string
  startDate: string
  endDate: string
  numberOfDays: number
  reason: string
  status: BreakRequestStatus
  adminComment?: string | null
  correction?: boolean
  user?: Pick<AdminUser, 'id' | 'name' | 'firstName' | 'image'>
}

export interface BreakBalanceData {
  id: string
  userId: string
  totalDays: number
  usedDays?: number
  carryForward: number
  cashout: number
  yearlyBalance?: number
  other?: number
  user?: Pick<AdminUser, 'id' | 'name' | 'firstName' | 'image'>
  createdAt: string
  updatedAt: string
}

export interface Adjustment {
  id: string
  userId: string
  numberOfDays: number
  type: string
  reason: string
  status: string
  comment: string | null
  approvedBy: string | null
  createdAt: string
  updatedAt: string
  user?: Pick<AdminUser, 'name' | 'email'>
  approver?: Pick<AdminUser, 'name' | 'email'>
}

export interface GroupedAttendance {
  present: Array<{
    user: AdminUser
    attendance: AttendanceRecord
  }>
  absent: Array<{
    user: AdminUser
    attendance?: AttendanceRecord
  }>
  onBreak: Array<{
    user: AdminUser
    attendance: AttendanceRecord
    breakRequest?: BreakRequest
  }>
  yetToMark: Array<{ user: AdminUser }>
}

export interface DayInfo {
  day: string
  date: number
  fullDate: Date
  isToday: boolean
  isActive: boolean
  isPadding?: boolean
  hasBreak?: boolean
  isAbsent?: boolean
}

/** SSE real-time event callbacks */
export interface RealtimeCallbacks {
  onBreakRequestCreated?: (data: unknown) => void
  onBreakRequestApproved?: (data: unknown) => void
  onBreakRequestRejected?: (data: unknown) => void
  onBreakRequestCancelled?: (data: unknown) => void
  onAttendanceCorrectionCreated?: (data: unknown) => void
  onAttendanceCorrectionProcessed?: (data: unknown) => void
  onTaskUpdated?: (data: unknown) => void
}
