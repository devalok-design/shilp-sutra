# Admin Types

- Import: @devalok/shilp-sutra-karm/admin
- Server-safe: Yes
- Category: admin

Type-only exports for the admin module. No runtime code.

## Types

### UserRole
```ts
type UserRole = 'Apprentice' | 'Associate' | 'Admin' | 'SuperAdmin'
```

### AttendanceStatus
```ts
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'BREAK' | 'Not_Marked' | 'HOLIDAY' | 'WEEKEND'
```

### CorrectionStatus
```ts
type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
```

### BreakRequestStatus
```ts
type BreakRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
```

### AdminUser
```ts
interface AdminUser {
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
```

### AttendanceRecord
```ts
interface AttendanceRecord {
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
```

### BreakRequest
```ts
interface BreakRequest {
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
```

### BreakBalanceData
```ts
interface BreakBalanceData {
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
```

### Adjustment
```ts
interface Adjustment {
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
```

### GroupedAttendance
```ts
interface GroupedAttendance {
  present: Array<{ user: AdminUser; attendance: AttendanceRecord }>
  absent: Array<{ user: AdminUser; attendance?: AttendanceRecord }>
  onBreak: Array<{ user: AdminUser; attendance: AttendanceRecord; breakRequest?: BreakRequest }>
  yetToMark: Array<{ user: AdminUser }>
}
```

### DayInfo
```ts
interface DayInfo {
  day: string
  date: number
  fullDate: Date
  isToday: boolean
  isActive: boolean
  isPadding?: boolean
  hasBreak?: boolean
  isAbsent?: boolean
  isDisabled?: boolean
}
```

### RealtimeCallbacks
```ts
interface RealtimeCallbacks {
  onBreakRequestCreated?: (data: BreakRequest) => void
  onBreakRequestApproved?: (data: BreakRequest) => void
  onBreakRequestRejected?: (data: BreakRequest) => void
  onBreakRequestCancelled?: (data: BreakRequest) => void
  onAttendanceCorrectionCreated?: (data: AttendanceRecord) => void
  onAttendanceCorrectionProcessed?: (data: AttendanceRecord) => void
  onTaskUpdated?: (data: unknown) => void
}
```

## Gotchas
- `AttendanceStatus` includes `'Not_Marked'` (mixed case with underscore) — not `'NOT_MARKED'`
- `BreakRequest.correction` is a boolean flag that indicates the request is an attendance correction, not a break
- `AdminUser.designation` and `AdminUser.image` are nullable (`string | null`)
- `AdminUser.createdAt` accepts both `string` and `Date`
- `DayInfo` is used by the calendar components — `isPadding` marks days from adjacent months

## Changes
### v0.9.0
- **Added** Initial release with all admin domain types
