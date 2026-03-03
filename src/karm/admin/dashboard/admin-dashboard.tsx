'use client'

// ============================================================
// AdminDashboard — Compound component (Radix/shadcn pattern)
//
// BREAKING CHANGE: Replaces the 29-prop monolith with a
// composable Root + sub-component API.
//
// Usage:
//   <AdminDashboard.Root currentUserId="u1" ...>
//     <AdminDashboard.Calendar dateAttendanceMap={map} />
//     <AdminDashboard.AttendanceOverview groupedAttendance={ga} users={u} />
//     <AdminDashboard.AssociateDetail attendance={a} tasks={t} ... />
//     <AdminDashboard.LeaveRequests requests={lr} corrections={c} ... />
//   </AdminDashboard.Root>
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../ui/lib/utils'
import { DashboardSkeleton } from './dashboard-skeleton'
import { DashboardHeader } from './dashboard-header'
import { RenderDate, type DateAttendanceInfo } from './render-date'
import { AttendanceOverview } from './attendance-overview'
import { AssociateDetail, type TaskItem } from './associate-detail'
import { CorrectionList, type AttendanceCorrection } from './correction-list'
import { LeaveRequests } from './leave-requests'
import { useCalendarNavigation } from './use-calendar-navigation'
import type {
  AdminUser,
  AttendanceRecord,
  BreakRequest,
  GroupedAttendance,
  UserRole,
} from '../types'
import { format } from 'date-fns'

// ============================================================
// Re-export extracted types for backwards compatibility
// ============================================================

export type { TaskItem } from './associate-detail'
export type { AttendanceCorrection } from './correction-list'

// ============================================================
// Context
// ============================================================

type CalendarNav = ReturnType<typeof useCalendarNavigation>

interface AdminDashboardContextValue {
  /** Current authenticated user's ID */
  currentUserId: string
  /** Current user's role */
  currentUserRole: UserRole
  /** Current authenticated user object */
  currentUser?: AdminUser
  /** Base URL for static assets */
  assetsBaseUrl: string
  /** Map of userId -> image URL */
  userImages: Record<string, string>
  /** Calendar navigation state + actions */
  cal: CalendarNav
  /** Active requests/corrections tab */
  activeTab: string
  /** Set the active requests/corrections tab */
  setActiveTab: (tab: string) => void
  /** Currently selected associate (null = overview mode) */
  selectedAssociate: AdminUser | null
  /** Set the selected associate */
  setSelectedAssociate: (user: AdminUser | null) => void
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(
  null,
)

/**
 * Hook to consume AdminDashboard compound context.
 * Throws if used outside AdminDashboard.Root.
 */
function useAdminDashboardContext(): AdminDashboardContextValue {
  const ctx = useContext(AdminDashboardContext)
  if (!ctx) {
    throw new Error(
      'AdminDashboard compound components must be used within <AdminDashboard.Root>',
    )
  }
  return ctx
}

// ============================================================
// Root Props
// ============================================================

export interface AdminDashboardRootProps {
  /** Current authenticated user's ID */
  currentUserId: string
  /** Current user's role */
  currentUserRole: UserRole
  /** Current authenticated user object */
  currentUser?: AdminUser
  /** Base URL for static assets (e.g. break-background.svg) */
  assetsBaseUrl?: string
  /** Map of userId -> image URL */
  userImages?: Record<string, string>
  /** Whether data is still loading */
  isLoading?: boolean
  /** Called when the selected associate changes */
  onAssociateChange?: (user: AdminUser | null) => void
  /** Children (compound sub-components) */
  children: ReactNode
}

// ============================================================
// Root Component
// ============================================================

const AdminDashboardRoot = React.forwardRef<
  HTMLDivElement,
  AdminDashboardRootProps
>(function AdminDashboardRoot(
  {
    currentUserId,
    currentUserRole,
    currentUser,
    assetsBaseUrl = '',
    userImages = {},
    isLoading = false,
    onAssociateChange,
    children,
  },
  ref,
) {
  const cal = useCalendarNavigation()
  const [activeTab, setActiveTab] = useState('leaveRequest')
  const [selectedAssociate, setSelectedAssociateRaw] = useState<AdminUser | null>(
    null,
  )

  // Wrap setter to notify parent (stable ref)
  const setSelectedAssociate = useCallback(
    (user: AdminUser | null) => {
      setSelectedAssociateRaw(user)
      onAssociateChange?.(user)
    },
    [onAssociateChange],
  )

  // Memoize context to avoid re-rendering all consumers on every Root render
  const contextValue = useMemo<AdminDashboardContextValue>(
    () => ({
      currentUserId,
      currentUserRole,
      currentUser,
      assetsBaseUrl,
      userImages,
      cal,
      activeTab,
      setActiveTab,
      selectedAssociate,
      setSelectedAssociate,
    }),
    [
      currentUserId,
      currentUserRole,
      currentUser,
      assetsBaseUrl,
      userImages,
      cal,
      activeTab,
      selectedAssociate,
      setSelectedAssociate,
    ],
  )

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <AdminDashboardContext.Provider value={contextValue}>
      <div
        ref={ref}
        className="flex w-full max-w-layout flex-col items-center justify-center max-md:h-[100%] max-md:justify-start"
      >
        <div className="z-raised flex w-full flex-col items-start justify-start rounded-ds-lg border border-border bg-layer-02 p-ds-05 shadow-05 max-md:h-[calc(100vh-201px)] max-md:max-h-[calc(100vh-201px)] max-md:overflow-y-auto max-md:border-0 max-md:px-ds-05 max-md:pb-0 max-md:pt-ds-06">
          {children}
        </div>
      </div>
    </AdminDashboardContext.Provider>
  )
})

AdminDashboardRoot.displayName = 'AdminDashboard.Root'

// ============================================================
// Calendar Props
// ============================================================

export interface AdminDashboardCalendarProps {
  /** Map of date string (YYYY-MM-DD) -> attendance info */
  dateAttendanceMap?: Map<string, DateAttendanceInfo> | null
  /** Called when the selected date changes */
  onDateChange?: (date: string) => void
  /** Called when time frame changes */
  onTimeFrameChange?: (timeFrame: string) => void
  /** Full list of users (for the associate dropdown in header) */
  users?: AdminUser[]
  /** Attendance record for selected user (used for break-bg styling) */
  selectedUserAttendance?: AttendanceRecord | null
}

// ============================================================
// Calendar Component
// ============================================================

const AdminDashboardCalendar = React.forwardRef<
  HTMLDivElement,
  AdminDashboardCalendarProps
>(function AdminDashboardCalendar(
  {
    dateAttendanceMap = null,
    onDateChange,
    onTimeFrameChange,
    users = [],
    selectedUserAttendance = null,
  },
  ref,
) {
  const { cal, selectedAssociate, setSelectedAssociate, userImages, setActiveTab } =
    useAdminDashboardContext()

  // ============================================================
  // Navigation handlers
  // ============================================================

  const handleTodayClick = () => {
    cal.goToday()
    setActiveTab('leaveRequest')
    // onDateChange fires via the selectedDate effect below
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    cal.navigateDate(direction)
    setActiveTab('leaveRequest')
  }

  const handleMonthSelection = (monthYear: string) => {
    cal.selectMonth(monthYear)
    setActiveTab('leaveRequest')
  }

  const handleTabClick = (index: number) => {
    const newSelectedDate = cal.days[index].fullDate
    cal.selectDate(index, newSelectedDate)
    onDateChange?.(format(newSelectedDate, "yyyy-MM-dd'T'HH:mm:ssxxx"))
  }

  const handleDayClick = (index: number, date: Date) => {
    if (cal.activeTimeFrame === 'weekly') {
      handleTabClick(index)
      setActiveTab('leaveRequest')
    } else {
      cal.selectDayMonthly(date)
      setActiveTab('leaveRequest')
      onDateChange?.(format(date, "yyyy-MM-dd'T'HH:mm:ssxxx"))
    }
  }

  // ============================================================
  // Effects — notify parent of date/timeframe changes
  // ============================================================

  // Intentionally omit callback from deps — fire only when value changes,
  // not when callback identity changes (consumers may not stabilize these).
  useEffect(() => {
    onTimeFrameChange?.(cal.activeTimeFrame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal.activeTimeFrame])

  useEffect(() => {
    onDateChange?.(cal.selectedDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal.selectedDate])

  // ============================================================
  // Render
  // ============================================================

  return (
    <div ref={ref}>
      {/* Header: Month selector + Associate filter + Toggle + Arrows */}
      <DashboardHeader
        selectedMonth={cal.selectedMonth}
        yearsList={cal.getYearsList()}
        isTodaySelected={cal.isTodaySelected()}
        selectedAssociate={selectedAssociate}
        users={users}
        userImages={userImages}
        activeTimeFrame={cal.activeTimeFrame}
        onMonthSelection={handleMonthSelection}
        onTodayClick={handleTodayClick}
        onSelectAssociate={setSelectedAssociate}
        onTimeFrameChange={(id) => cal.setActiveTimeFrame(id)}
        onDateChange={handleDateChange}
      />

      {/* Calendar Grid */}
      <div
        className={`calender ${
          cal.activeTimeFrame === 'weekly' ? 'flex' : 'grid grid-cols-7 gap-0'
        } w-full items-center`}
      >
        {cal.activeTimeFrame === 'monthly' &&
          ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((weekDay) => (
            <div key={weekDay} className="pb-ds-03 pt-ds-05 text-center">
              <span className="text-ds-sm font-semibold uppercase tracking-wider  text-text-tertiary">
                {weekDay}
              </span>
            </div>
          ))}

        {cal.days.map((day, index) => (
          <button
            type="button"
            key={index}
            tabIndex={day.isPadding ? -1 : 0}
            aria-label={day.isPadding ? undefined : format(day.fullDate, 'MMMM d, yyyy')}
            className={`${
              cal.activeTimeFrame === 'weekly'
                ? 'w-full rounded-t-ds-lg pb-3.5 pt-ds-05 max-md:rounded-ds-lg'
                : 'pb-0 pt-0'
            } flex cursor-pointer flex-col items-center text-center ${
              cal.activeTimeFrame === 'weekly' && cal.activeIndex === index
                ? selectedUserAttendance?.status === 'BREAK'
                  ? 'bg-layer-accent-subtle'
                  : 'bg-layer-02'
                : ''
            } ${day.isPadding ? 'opacity-50' : ''} `}
            onClick={() => handleDayClick(index, day.fullDate)}
          >
            {cal.activeTimeFrame === 'weekly' && (
              <span className="text-ds-sm font-semibold uppercase tracking-wider mb-ds-03  text-text-tertiary">
                {day.day}
              </span>
            )}
            <RenderDate
              day={day}
              isAdmin={true}
              selectedDate={cal.selectedDate}
              dateAttendanceMap={selectedAssociate ? dateAttendanceMap : null}
              activeTimeFrame={cal.activeTimeFrame}
            />
          </button>
        ))}
      </div>
    </div>
  )
})

AdminDashboardCalendar.displayName = 'AdminDashboard.Calendar'

// ============================================================
// AttendanceOverview Props
// ============================================================

export interface AdminDashboardAttendanceOverviewProps {
  /** Grouped attendance data for the selected date */
  groupedAttendance?: GroupedAttendance | null
  /** Full list of users */
  users?: AdminUser[]
}

// ============================================================
// AttendanceOverview Component
// ============================================================

const AdminDashboardAttendanceOverview = React.forwardRef<
  HTMLDivElement,
  AdminDashboardAttendanceOverviewProps
>(function AdminDashboardAttendanceOverview(
  { groupedAttendance = null, users = [] },
  ref,
) {
  const { cal, selectedAssociate, userImages } = useAdminDashboardContext()

  // Only render when no associate is selected
  if (selectedAssociate) return null

  return (
    <div ref={ref}>
      <AttendanceOverview
        isFutureDate={cal.isFutureDate}
        users={users}
        groupedAttendance={groupedAttendance}
        userImages={userImages}
        selectedDate={cal.selectedDate}
      />
    </div>
  )
})

AdminDashboardAttendanceOverview.displayName = 'AdminDashboard.AttendanceOverview'

// ============================================================
// AssociateDetail Props
// ============================================================

export interface AdminDashboardAssociateDetailProps {
  /** Attendance record for the selected associate + date */
  attendance?: AttendanceRecord | null
  /** Tasks for the selected associate */
  tasks?: TaskItem[]
  /** Break request for the selected associate's selected date */
  breakRequest?: BreakRequest | null
  /** Called to update attendance status (mark present/absent) */
  onUpdateAttendanceStatus?: (params: {
    userId: string
    date: string
    isPresent: boolean
  }) => void | Promise<void>
  /** Called to toggle a task's status */
  onToggleTaskStatus?: (
    taskId: string,
    newStatus: string,
  ) => void | Promise<void>
  /** Called to create a new task */
  onAddTask?: (title: string, assigneeId: string) => void | Promise<void>
  /** Called to reorder tasks via drag-and-drop */
  onReorderTasks?: (
    draggedTaskId: string,
    targetTaskId: string,
  ) => void | Promise<void>
  /** Called to cancel a break */
  onCancelBreak?: (params: {
    requestId: string
    deleteSingleDay: boolean
    dateToCancel: string | Date
    userId: string
  }) => void | Promise<void>
  /** Called when selected user attendance needs refresh */
  onRefreshSelectedUserAttendance?: () => void | Promise<void>
  /** Called when attendance data refresh is needed (after batch ops) */
  onRefreshAttendanceData?: () => void | Promise<void>
}

// ============================================================
// AssociateDetail Component
// ============================================================

const AdminDashboardAssociateDetail = React.forwardRef<
  HTMLDivElement,
  AdminDashboardAssociateDetailProps
>(function AdminDashboardAssociateDetail(
  {
    attendance = null,
    tasks = [],
    breakRequest = null,
    onUpdateAttendanceStatus,
    onToggleTaskStatus,
    onAddTask,
    onReorderTasks,
    onCancelBreak,
    onRefreshSelectedUserAttendance,
    onRefreshAttendanceData,
  },
  ref,
) {
  const { cal, selectedAssociate, assetsBaseUrl } = useAdminDashboardContext()

  // Only render when an associate IS selected
  if (!selectedAssociate) return null

  return (
    <div ref={ref}>
      <AssociateDetail
        selectedAssociate={selectedAssociate}
        selectedDate={cal.selectedDate}
        selectedUserAttendance={attendance}
        userTasks={tasks}
        selectedBreakRequest={breakRequest}
        isFutureDate={cal.isFutureDate}
        assetsBaseUrl={assetsBaseUrl}
        onUpdateAttendanceStatus={onUpdateAttendanceStatus}
        onToggleTaskStatus={onToggleTaskStatus}
        onAddTask={onAddTask}
        onReorderTasks={onReorderTasks}
        onCancelBreak={onCancelBreak}
        onRefreshSelectedUserAttendance={onRefreshSelectedUserAttendance}
        onRefreshAttendanceData={onRefreshAttendanceData}
      />
    </div>
  )
})

AdminDashboardAssociateDetail.displayName = 'AdminDashboard.AssociateDetail'

// ============================================================
// LeaveRequests Props
// ============================================================

export interface AdminDashboardLeaveRequestsProps {
  /** Pending break/leave requests */
  requests?: BreakRequest[]
  /** Pending attendance corrections */
  corrections?: AttendanceCorrection[]
  /** Called to approve a break request */
  onApproveBreak?: (params: {
    requestId: string
    adminComment: string
    userId: string
  }) => void | Promise<void>
  /** Called to reject a break request */
  onRejectBreak?: (params: {
    requestId: string
    adminComment: string
    userId: string
  }) => void | Promise<void>
  /** Called to approve an attendance correction */
  onApproveCorrection?: (correctionId: string) => void | Promise<void>
  /** Called to reject an attendance correction */
  onRejectCorrection?: (correctionId: string) => void | Promise<void>
}

// ============================================================
// LeaveRequests Component
// ============================================================

// ── Tab button variants for request sections ──
const requestTabVariants = cva(
  'text-ds-sm font-semibold uppercase tracking-wider cursor-pointer px-ds-03 py-ds-04',
  {
    variants: {
      active: {
        true: 'border-b-[1px] border-b-interactive-hover text-text-primary',
        false: 'text-text-tertiary',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
)

const AdminDashboardLeaveRequests = React.forwardRef<
  HTMLDivElement,
  AdminDashboardLeaveRequestsProps
>(function AdminDashboardLeaveRequests(
  {
    requests = [],
    corrections = [],
    onApproveBreak,
    onRejectBreak,
    onApproveCorrection,
    onRejectCorrection,
  },
  ref,
) {
  const { currentUserId, userImages, cal, activeTab, setActiveTab, assetsBaseUrl } =
    useAdminDashboardContext()

  // Filter corrections to PENDING status
  const filteredAttendanceCorrections = corrections.filter(
    (correction) => correction.correctionStatus === 'PENDING',
  )

  // Auto-switch tabs when requests arrive
  useEffect(() => {
    if (requests.length > 0) {
      setActiveTab('leaveRequest')
    } else if (filteredAttendanceCorrections.length > 0) {
      setActiveTab('attendanceRequest')
    }
  }, [requests.length, filteredAttendanceCorrections.length, setActiveTab])

  const handleRequestTabSwitch = (tab: string) => {
    setActiveTab(tab)
  }

  // Don't render if no requests or corrections
  if (
    filteredAttendanceCorrections.length === 0 &&
    requests.length === 0
  ) {
    return null
  }

  return (
    <div ref={ref} className="w-full p-0 md:p-ds-06">
      <div className="max-md:pt[16px] flex flex-col items-start overflow-hidden rounded-ds-lg border-0 border-border-subtle bg-layer-01 shadow-01 pt-ds-03 md:border max-md:pb-0">
        <div className="flex w-full items-start border-b-[1px] border-b-border px-ds-06 md:border-b max-md:border-0 max-md:px-0">
          {requests.length > 0 && (
            <button
              type="button"
              onClick={() => handleRequestTabSwitch('leaveRequest')}
              aria-current={activeTab === 'leaveRequest' ? 'true' : undefined}
              className={requestTabVariants({ active: activeTab === 'leaveRequest' })}
            >
              <span className="hidden sm:inline">break </span>Requests
              <span className="text-interactive-hover">
                ({requests.length})
              </span>
            </button>
          )}
          {filteredAttendanceCorrections.length > 0 && (
            <button
              type="button"
              onClick={() =>
                handleRequestTabSwitch('attendanceRequest')
              }
              aria-current={activeTab === 'attendanceRequest' ? 'true' : undefined}
              className={requestTabVariants({ active: activeTab === 'attendanceRequest' })}
            >
              Attendance Correction{' '}
              <span className="text-interactive-hover">
                ({filteredAttendanceCorrections.length})
              </span>
            </button>
          )}
        </div>

        {/* Attendance Corrections Tab Content */}
        {activeTab === 'attendanceRequest' &&
          filteredAttendanceCorrections.length > 0 && (
            <CorrectionList
              corrections={filteredAttendanceCorrections}
              currentUserId={currentUserId}
              userImages={userImages}
              assetsBaseUrl={assetsBaseUrl}
              activeTimeFrame={cal.activeTimeFrame}
              onApproveCorrection={onApproveCorrection}
              onRejectCorrection={onRejectCorrection}
            />
          )}

        {/* Leave Requests Tab Content */}
        {activeTab === 'leaveRequest' && requests.length > 0 && (
          <LeaveRequests
            requests={requests}
            currentUserId={currentUserId}
            userImages={userImages}
            activeTimeFrame={cal.activeTimeFrame}
            onApproveBreak={onApproveBreak}
            onRejectBreak={onRejectBreak}
          />
        )}
      </div>
    </div>
  )
})

AdminDashboardLeaveRequests.displayName = 'AdminDashboard.LeaveRequests'

// ============================================================
// Content Wrapper (handles rounded corners based on selected date)
// ============================================================

export interface AdminDashboardContentProps {
  /** Children (AttendanceOverview, AssociateDetail, LeaveRequests) */
  children: ReactNode
}

const AdminDashboardContent = React.forwardRef<
  HTMLDivElement,
  AdminDashboardContentProps
>(function AdminDashboardContent({ children }, ref) {
  const { cal } = useAdminDashboardContext()

  const _isFirstDate = cal.isFirstDate()
  const _isLastDate = cal.isLastDate()

  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full flex-col rounded-ds-lg bg-layer-02 md:p-ds-06 max-md:bg-transparent',
        {
          'rounded-ds-lg': !_isFirstDate && !_isLastDate,
          'rounded-ds-lg rounded-tl-none': _isFirstDate && !_isLastDate,
          'rounded-b-ds-lg rounded-tr-none': !_isFirstDate && _isLastDate,
          'rounded-ds-none': _isFirstDate && _isLastDate,
        },
      )}
    >
      {children}
    </div>
  )
})

AdminDashboardContent.displayName = 'AdminDashboard.Content'

// ============================================================
// Compound Component Assembly
// ============================================================

export const AdminDashboard = Object.assign(AdminDashboardRoot, {
  Root: AdminDashboardRoot,
  Calendar: AdminDashboardCalendar,
  AttendanceOverview: AdminDashboardAttendanceOverview,
  AssociateDetail: AdminDashboardAssociateDetail,
  LeaveRequests: AdminDashboardLeaveRequests,
  Content: AdminDashboardContent,
})
