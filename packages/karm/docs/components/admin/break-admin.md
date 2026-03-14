# BreakAdmin

- Import: @devalok/shilp-sutra-karm/admin
- Server-safe: No
- Category: admin

Compound component for break/leave management admin page. Uses React Context internally.
Supports both compound usage (with children) and default layout (without children).

Exports: BreakAdmin (compound), BreakAdminHeader, Breaks, LeaveRequest, BreakBalance, EditBreak, EditBreakBalance, DeleteBreak, BreakAdminSkeleton

## Props

### BreakAdmin.Root / BreakAdmin (BreakAdminProps)
    currentUser: Pick<AdminUser, "id" | "name" | "role"> (REQUIRED)
    breaks: BreakRequest[] (REQUIRED)
    pendingRequests: BreakRequest[] (REQUIRED)
    cashoutRequests: BreakRequest[] (default: [])
    breakBalanceData: BreakBalanceData[] (REQUIRED)
    breakBalance: { remainingDays: number; breakBalance: number } | null
    userImages: Record<string, string> (REQUIRED)
    users: AdminUser[] (REQUIRED)
    isLoading: boolean (default: false)
    isLoadingBreaks: boolean (default: false)
    isLoadingRequests: boolean (default: false)
    isLoadingBalance: boolean (default: false)
    existingBreaks?: BreakRequest[]
    filters?: BreakAdminFilters
    onFilterChange?: (filters: BreakAdminFilters) => void
    onApproveRequest?: (requestId: string, comment?: string, isCorrection?: boolean, request?: BreakRequest) => void
    onRejectRequest?: (requestId: string, comment?: string, isCorrection?: boolean, request?: BreakRequest) => void
    onApproveCashout?: (requestId: string) => void
    onRejectCashout?: (requestId: string) => void
    onRefresh?: () => void
    onSaveBreak?: (data: { requestId: string; userId: string; status: string; adminComment: string; startDate: string; endDate: string; isEditing: boolean }) => void
    onDeleteBreak?: () => void
    onSaveBalance?: (data: { userId: string; cashOutDays: number; carryForward: number; year: number }) => void
    onFetchMonthBreaks?: (month: number, year: number) => Promise<BreakRequest[]>
    realtimeCallbacks?: RealtimeCallbacks
    children?: ReactNode
    ...HTMLDivElement attributes

### BreakAdmin.Header
    ...HTMLDivElement attributes (className, etc.)
    Reads from context: filters, breakBalance, userImages, users

### BreakAdmin.TabBar
    ...HTMLDivElement attributes
    Reads from context: activeTab, pendingRequests, breakBalanceData

### BreakAdmin.BreaksPanel
    ...HTMLDivElement attributes
    Reads from context: breaks, userImages, existingBreaks, onFetchMonthBreaks, onSaveBreak, onDeleteBreak, onRefresh

### BreakAdmin.RequestsPanel
    ...HTMLDivElement attributes
    Reads from context: pendingRequests, userImages, approve/reject handlers

### BreakAdmin.BalancePanel
    ...HTMLDivElement attributes
    Reads from context: breakBalanceData, userImages, onSaveBalance

### BreakAdminHeader (BreakAdminHeaderProps) — standalone
    filters: BreakAdminFilters (REQUIRED)
    onFilterChange: (filters: BreakAdminFilters) => void (REQUIRED)
    breakBalance: { remainingDays: number; breakBalance: number } | null
    userImages: Record<string, string> (REQUIRED)
    users: AdminUser[] (REQUIRED)
    ...HTMLDivElement attributes

### Breaks (BreaksProps) — standalone
    breaks: BreakRequest[] (REQUIRED)
    userImages: Record<string, string> (REQUIRED)
    existingBreaks: BreakRequest[]
    onFetchMonthBreaks: (month: number, year: number) => Promise<BreakRequest[]>
    onSave: (data: { requestId: string; userId: string; status: string; adminComment: string; startDate: string; endDate: string; isEditing: boolean }) => void
    onDelete: () => void
    onRefresh: () => void
    ...HTMLDivElement attributes

### LeaveRequest (LeaveRequestProps) — standalone
    request: BreakRequest (REQUIRED)
    userImages: Record<string, string> (REQUIRED)
    handleRejectRequest: (event: MouseEvent | undefined, id: string, comment?: string) => void (REQUIRED)
    handleApproveRequest: (event: MouseEvent | undefined, id: string, comment?: string) => void (REQUIRED)
    commentBoxOpen: boolean (REQUIRED)
    onCommentBoxClose: () => void (REQUIRED)
    clickedAction: "approve" | "reject" | null (REQUIRED)
    userId: string (REQUIRED)
    ...HTMLDivElement attributes

### BreakBalance (BreakBalanceProps) — standalone
    breakBalanceData: BreakBalanceData[] (REQUIRED)
    userImages: Record<string, string> (REQUIRED)
    onSaveBalance: (data: { userId: string; cashOutDays: number; carryForward: number; year: number }) => void
    ...HTMLDivElement attributes

### EditBreak (EditBreakProps) — standalone
    selectedLeave: BreakRequest & { numberOfDays: number } (REQUIRED)
    existingBreaks: BreakRequest[]
    onFetchMonthBreaks: (month: number, year: number) => Promise<BreakRequest[]>
    onSave: (data: { requestId: string; userId: string; status: string; adminComment: string; startDate: string; endDate: string; isEditing: boolean }) => void
    onDelete: () => void
    ...HTMLDivElement attributes

### EditBreakBalance (EditBreakBalanceProps) — standalone
    selectedLeave: BreakBalanceData (REQUIRED)
    onSave: (data: { userId: string; cashOutDays: number; carryForward: number; year: number }) => void
    ...HTMLDivElement attributes

### DeleteBreak (DeleteBreakProps) — standalone
    id: string (REQUIRED)
    userId: string (REQUIRED)
    onDelete: () => void
    ...HTMLDivElement attributes

### BreakAdminSkeleton
    ...HTMLDivElement attributes (className, etc.)

## Supporting Types
    BreakAdminFilters: { selectedAssociate: AdminUser | null; dateFilterStart: string | Date | null; dateFilterEnd: string | Date | null; currMonth: number; currYear: number; isOpen: boolean }

## Defaults
    isLoading=false, cashoutRequests=[], isLoadingBreaks=false, isLoadingRequests=false, isLoadingBalance=false

## Example
```jsx
// Default layout (no children needed)
<BreakAdmin
  currentUser={{ id: "admin-1", name: "Admin", role: "Admin" }}
  breaks={allBreaks}
  pendingRequests={pending}
  breakBalanceData={balanceData}
  userImages={imageMap}
  users={allUsers}
  isLoading={isLoading}
  onApproveRequest={handleApprove}
  onRejectRequest={handleReject}
  onSaveBreak={handleSaveBreak}
  onSaveBalance={handleSaveBalance}
/>

// Compound layout (custom arrangement)
<BreakAdmin.Root currentUser={user} breaks={b} pendingRequests={p} breakBalanceData={bd} userImages={ui} users={u}>
  <BreakAdmin.Header />
  <BreakAdmin.TabBar />
  <BreakAdmin.BreaksPanel />
  <BreakAdmin.RequestsPanel />
  <BreakAdmin.BalancePanel />
</BreakAdmin.Root>
```

## Gotchas
- Without children, renders the default layout (Header + TabBar + all three panels)
- With children, renders only the provided sub-components — you control the layout
- Approve/reject with Cmd/Ctrl+click opens a comment box before confirming
- `BreakAdmin.BreaksPanel` only renders when `activeTab === "breaks"`
- `BreakAdmin.RequestsPanel` only renders when `activeTab === "requests"`
- `BreakAdmin.BalancePanel` only renders when `activeTab === "balance"`
- `isLoading=true` renders `BreakAdminSkeleton` instead of children
- `onApproveRequest` receives `isCorrection` boolean and the full `request` object as 3rd/4th args
- Toast notifications fire automatically on approve/reject success or error

## Changes
### v0.9.0
- **Added** Compound component API replacing monolith
- **Added** Standalone exports for BreakAdminHeader, Breaks, LeaveRequest, BreakBalance, EditBreak, EditBreakBalance, DeleteBreak
