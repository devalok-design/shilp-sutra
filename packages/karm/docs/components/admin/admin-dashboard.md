# AdminDashboard

- Import: @devalok/shilp-sutra-karm/admin
- Server-safe: No
- Category: admin

Compound component for the admin attendance dashboard. Uses React Context internally.
All sub-components must be rendered inside `<AdminDashboard.Root>`.

Exports: AdminDashboard (compound), AdminDashboardSkeleton, Calendar, BreakRequestCard, LeaveRequests, DashboardHeader, AttendanceOverview, AssociateDetail, CorrectionList, RenderDate

## Props

### AdminDashboard.Root (AdminDashboardRootProps)
    currentUserId: string (REQUIRED)
    currentUserRole: UserRole (REQUIRED)
    currentUser: AdminUser
    assetsBaseUrl: string (default: "")
    userImages: Record<string, string> (default: {})
    isLoading: boolean (default: false)
    onAssociateChange: (user: AdminUser | null) => void
    children: ReactNode (REQUIRED)
    ...HTMLDivElement attributes (className, etc.)

### AdminDashboard.Calendar (AdminDashboardCalendarProps)
    dateAttendanceMap: Map<string, DateAttendanceInfo> | null (default: null)
    onDateChange: (date: string) => void
    onTimeFrameChange: (timeFrame: string) => void
    users: AdminUser[] (default: [])
    selectedUserAttendance: AttendanceRecord | null (default: null)
    ...HTMLDivElement attributes

### AdminDashboard.AttendanceOverview (AdminDashboardAttendanceOverviewProps)
    groupedAttendance: GroupedAttendance | null (default: null)
    users: AdminUser[] (default: [])
    ...HTMLDivElement attributes

### AdminDashboard.AssociateDetail (AdminDashboardAssociateDetailProps)
    attendance: AttendanceRecord | null (default: null)
    tasks: TaskItem[] (default: [])
    breakRequest: BreakRequest | null (default: null)
    onUpdateAttendanceStatus: (params: { userId: string; date: string; isPresent: boolean }) => void | Promise<void>
    onToggleTaskStatus: (taskId: string, newStatus: string) => void | Promise<void>
    onAddTask: (title: string, assigneeId: string) => void | Promise<void>
    onReorderTasks: (draggedTaskId: string, targetTaskId: string) => void | Promise<void>
    onCancelBreak: (params: { requestId: string; deleteSingleDay: boolean; dateToCancel: string | Date; userId: string }) => void | Promise<void>
    onRefreshSelectedUserAttendance: () => void | Promise<void>
    onRefreshAttendanceData: () => void | Promise<void>
    ...HTMLDivElement attributes

### AdminDashboard.LeaveRequests (AdminDashboardLeaveRequestsProps)
    requests: BreakRequest[] (default: [])
    corrections: AttendanceCorrection[] (default: [])
    onApproveBreak: (params: { requestId: string; adminComment: string; userId: string }) => void | Promise<void>
    onRejectBreak: (params: { requestId: string; adminComment: string; userId: string }) => void | Promise<void>
    onApproveCorrection: (correctionId: string) => void | Promise<void>
    onRejectCorrection: (correctionId: string) => void | Promise<void>
    ...HTMLDivElement attributes

### AdminDashboard.Content (AdminDashboardContentProps)
    children: ReactNode (REQUIRED)
    ...HTMLDivElement attributes

### Calendar (CalendarProps) — standalone
    onDateSelect: (date: Date) => void (REQUIRED)
    hasCorrection: (date: Date) => boolean
    ...HTMLDivElement attributes

### BreakRequestCard (BreakRequestProps) — standalone
    selectedDate: string | Date (REQUIRED)
    userId: string (REQUIRED)
    breakRequest: BreakRequest | null
    assetsBaseUrl: string
    onCancelBreak: (params: { requestId: string; deleteSingleDay: boolean; dateToCancel: string | Date; userId: string }) => void | Promise<void>
    onRefreshAttendance: () => void | Promise<void>
    onRefreshGroupedAttendance: () => void | Promise<void>
    ...HTMLDivElement attributes

### LeaveRequests (LeaveRequestsProps) — standalone
    requests: BreakRequest[] (REQUIRED)
    currentUserId: string (REQUIRED)
    userImages: Record<string, string>
    activeTimeFrame: string
    onApproveBreak: (params: { requestId: string; adminComment: string; userId: string }) => void | Promise<void>
    onRejectBreak: (params: { requestId: string; adminComment: string; userId: string }) => void | Promise<void>
    ...HTMLDivElement attributes

### DashboardHeader (DashboardHeaderProps) — standalone
    selectedMonth: string (REQUIRED)
    yearsList: string[] (REQUIRED)
    isTodaySelected: boolean (REQUIRED)
    selectedAssociate: AdminUser | null (REQUIRED)
    users: AdminUser[] (REQUIRED)
    userImages: Record<string, string> (REQUIRED)
    activeTimeFrame: string (REQUIRED)
    onMonthSelection: (monthYear: string) => void (REQUIRED)
    onTodayClick: () => void (REQUIRED)
    onSelectAssociate: (user: AdminUser | null) => void (REQUIRED)
    onTimeFrameChange: (id: string) => void (REQUIRED)
    onDateChange: (direction: "prev" | "next") => void (REQUIRED)
    ...HTMLDivElement attributes

### AttendanceOverview (AttendanceOverviewProps) — standalone
    isFutureDate: boolean (REQUIRED)
    users: AdminUser[] (REQUIRED)
    groupedAttendance: GroupedAttendance | null (REQUIRED)
    userImages: Record<string, string> (REQUIRED)
    selectedDate: string (REQUIRED)
    ...HTMLDivElement attributes

### AssociateDetail (AssociateDetailProps) — standalone
    selectedAssociate: AdminUser (REQUIRED)
    selectedDate: string (REQUIRED)
    selectedUserAttendance: AttendanceRecord | null (REQUIRED)
    userTasks: TaskItem[] (REQUIRED)
    selectedBreakRequest: BreakRequest | null (REQUIRED)
    isFutureDate: boolean (REQUIRED)
    assetsBaseUrl: string (REQUIRED)
    onUpdateAttendanceStatus: (params: { userId: string; date: string; isPresent: boolean }) => void | Promise<void>
    onToggleTaskStatus: (taskId: string, newStatus: string) => void | Promise<void>
    onAddTask: (title: string, assigneeId: string) => void | Promise<void>
    onReorderTasks: (draggedTaskId: string, targetTaskId: string) => void | Promise<void>
    onCancelBreak: (params: { requestId: string; deleteSingleDay: boolean; dateToCancel: string | Date; userId: string }) => void | Promise<void>
    onRefreshSelectedUserAttendance: () => void | Promise<void>
    onRefreshAttendanceData: () => void | Promise<void>
    ...HTMLDivElement attributes

### CorrectionList (CorrectionListProps) — standalone
    corrections: AttendanceCorrection[] (REQUIRED)
    currentUserId: string (REQUIRED)
    userImages: Record<string, string> (REQUIRED)
    assetsBaseUrl: string (REQUIRED)
    activeTimeFrame: string (REQUIRED)
    onApproveCorrection: (correctionId: string) => void | Promise<void>
    onRejectCorrection: (correctionId: string) => void | Promise<void>
    ...HTMLDivElement attributes

### RenderDate (RenderDateProps) — standalone
    day: DayInfo (REQUIRED)
    isAdmin: boolean (REQUIRED)
    selectedDate: string | Date (REQUIRED)
    dateAttendanceMap: Map<string, DateAttendanceInfo> | null (REQUIRED)
    activeTimeFrame: string (REQUIRED)
    ...HTMLDivElement attributes

### AdminDashboardSkeleton (DashboardSkeleton)
    ...HTMLDivElement attributes (className, etc.)

## Supporting Types
    TaskItem: { id: string; title: string; status: string; assigneeIds?: string; priority?: string }
    AttendanceCorrection: { id: string; date: string; reason?: string; requestedDate?: string; correctionStatus: CorrectionStatus; user?: AdminUser }
    DateAttendanceInfo: { status: AttendanceStatus | null; hasCorrectionOrApproval?: boolean; isBreakApproved?: boolean }

## Defaults
    assetsBaseUrl="", userImages={}, isLoading=false

## Example
```jsx
<AdminDashboard.Root
  currentUserId="user-1"
  currentUserRole="Admin"
  currentUser={currentUser}
  assetsBaseUrl="/assets"
  userImages={userImageMap}
  isLoading={isLoading}
  onAssociateChange={(user) => setSelected(user)}
>
  <AdminDashboard.Calendar
    dateAttendanceMap={dateMap}
    onDateChange={handleDateChange}
    onTimeFrameChange={handleTimeFrameChange}
    users={allUsers}
    selectedUserAttendance={attendance}
  />
  <AdminDashboard.Content>
    <AdminDashboard.AttendanceOverview
      groupedAttendance={grouped}
      users={allUsers}
    />
    <AdminDashboard.AssociateDetail
      attendance={selectedAttendance}
      tasks={tasks}
      breakRequest={breakReq}
      onUpdateAttendanceStatus={handleUpdateStatus}
      onToggleTaskStatus={handleToggleTask}
      onAddTask={handleAddTask}
    />
    <AdminDashboard.LeaveRequests
      requests={pendingRequests}
      corrections={corrections}
      onApproveBreak={handleApproveBreak}
      onRejectBreak={handleRejectBreak}
      onApproveCorrection={handleApproveCorrection}
      onRejectCorrection={handleRejectCorrection}
    />
  </AdminDashboard.Content>
</AdminDashboard.Root>
```

## Gotchas
- All sub-components must be inside `<AdminDashboard.Root>` or they throw a context error
- `AdminDashboard.AttendanceOverview` only renders when NO associate is selected
- `AdminDashboard.AssociateDetail` only renders when an associate IS selected
- `AdminDashboard.LeaveRequests` auto-hides when there are zero requests AND zero pending corrections
- `AdminDashboard.LeaveRequests` auto-switches tabs when new requests arrive
- The `Calendar` standalone export is a simpler calendar without the compound context — use it for non-admin pages
- `BreakRequestCard` standalone export displays a single break with cancel dialog — used inside AssociateDetail internally
- Date callbacks fire ISO-formatted strings via `format(date, "yyyy-MM-dd'T'HH:mm:ssxxx")`
- `isLoading=true` on Root renders `DashboardSkeleton` instead of children

## Changes
### v0.9.0
- **Added** Compound component API replacing 29-prop monolith (BREAKING)
- **Added** AdminDashboard.Content wrapper for rounded-corner management
- **Added** Standalone exports for Calendar, BreakRequestCard, LeaveRequests, DashboardHeader, AttendanceOverview, AssociateDetail, CorrectionList, RenderDate
