'use client'

// ============================================================
// AdminDashboard — Main attendance dashboard orchestrator
// Ported from karm-v1. All data comes via props; no fetch calls.
// Sub-components extracted into sibling files.
// ============================================================

import { useEffect, useState } from 'react'
import { cn } from '../../../ui/lib/utils'
import {
  isSameDay,
  getWeekDays,
  getMonthDays,
  getStartOfDay,
} from '../utils/date-utils'
import { DashboardSkeleton } from './dashboard-skeleton'
import { DashboardHeader } from './dashboard-header'
import { RenderDate, type DateAttendanceInfo } from './render-date'
import { AttendanceOverview } from './attendance-overview'
import { AssociateDetail, type TaskItem } from './associate-detail'
import { CorrectionList, type AttendanceCorrection } from './correction-list'
import { LeaveRequests } from './leave-requests'
import type {
  AdminUser,
  AttendanceRecord,
  BreakRequest,
  CorrectionStatus,
  DayInfo,
  GroupedAttendance,
  RealtimeCallbacks,
  UserRole,
} from '../types'
import { format } from 'date-fns'

// ============================================================
// Re-export extracted types for backwards compatibility
// ============================================================

export type { TaskItem } from './associate-detail'
export type { AttendanceCorrection } from './correction-list'

// ============================================================
// AdminDashboard Props
// ============================================================

export interface AdminDashboardProps {
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

  // ============================================================
  // Data props
  // ============================================================

  /** Full list of users (for the associate dropdown) */
  users?: AdminUser[]
  /** Grouped attendance data for the selected date */
  groupedAttendance?: GroupedAttendance | null
  /** Pending break/leave requests */
  leaveRequests?: BreakRequest[]
  /** Pending attendance corrections */
  attendanceCorrections?: AttendanceCorrection[]
  /** Whether data is still loading */
  isLoading?: boolean

  // ============================================================
  // Selected associate data
  // ============================================================

  /** Attendance record for the selected associate + date */
  selectedUserAttendance?: AttendanceRecord | null
  /** Tasks for the selected associate */
  userTasks?: TaskItem[]
  /** Break request for the selected associate's selected date */
  selectedBreakRequest?: BreakRequest | null

  // ============================================================
  // Date attendance map for calendar rendering
  // ============================================================

  /** Map of date string (YYYY-MM-DD) -> attendance info */
  dateAttendanceMap?: Map<string, DateAttendanceInfo> | null

  // ============================================================
  // Callback props
  // ============================================================

  /** Called when the selected date changes */
  onDateChange?: (date: string) => void
  /** Called when the selected associate changes */
  onAssociateChange?: (user: AdminUser | null) => void
  /** Called when time frame changes */
  onTimeFrameChange?: (timeFrame: string) => void
  /** Called to fetch grouped attendance for a date */
  onFetchGroupedAttendance?: (date: string) => void | Promise<void>
  /** Called to fetch leave requests */
  onFetchLeaveRequests?: () => void | Promise<void>
  /** Called to update attendance status (mark present/absent) */
  onUpdateAttendanceStatus?: (params: {
    userId: string
    date: string
    isPresent: boolean
  }) => void | Promise<void>
  /** Called to approve an attendance correction */
  onApproveCorrection?: (correctionId: string) => void | Promise<void>
  /** Called to reject an attendance correction */
  onRejectCorrection?: (correctionId: string) => void | Promise<void>
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
  /** Called to cancel a break */
  onCancelBreak?: (params: {
    requestId: string
    deleteSingleDay: boolean
    dateToCancel: string | Date
    userId: string
  }) => void | Promise<void>
  /** Called when attendance data refresh is needed (after batch ops) */
  onRefreshAttendanceData?: () => void | Promise<void>
  /** Called when selected user attendance needs refresh */
  onRefreshSelectedUserAttendance?: () => void | Promise<void>

  // ============================================================
  // Realtime callbacks
  // ============================================================

  realtimeCallbacks?: RealtimeCallbacks
}

// ============================================================
// Component
// ============================================================

export function AdminDashboard({
  currentUserId,
  currentUserRole,
  currentUser,
  assetsBaseUrl = '',
  userImages = {},
  users = [],
  groupedAttendance = null,
  leaveRequests = [],
  attendanceCorrections = [],
  isLoading: isLoadingProp = false,
  selectedUserAttendance = null,
  userTasks = [],
  selectedBreakRequest = null,
  dateAttendanceMap = null,
  onDateChange,
  onAssociateChange,
  onTimeFrameChange,
  onFetchGroupedAttendance,
  onFetchLeaveRequests,
  onUpdateAttendanceStatus,
  onApproveCorrection,
  onRejectCorrection,
  onToggleTaskStatus,
  onAddTask,
  onReorderTasks,
  onApproveBreak,
  onRejectBreak,
  onCancelBreak,
  onRefreshAttendanceData,
  onRefreshSelectedUserAttendance,
}: AdminDashboardProps) {
  // ============================================================
  // Internal state (calendar navigation, UI state)
  // ============================================================

  const today = new Date()

  const [currentDate, setCurrentDate] = useState(
    format(today, "yyyy-MM-dd'T'HH:mm:ssxxx"),
  )
  const [selectedDate, setSelectedDate] = useState(
    format(today, "yyyy-MM-dd'T'HH:mm:ssxxx"),
  )
  const [isFutureDate, setIsFutureDate] = useState(false)
  const [activeTimeFrame, setActiveTimeFrame] = useState('weekly')
  const [days, setDays] = useState<DayInfo[]>([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [dateOffset, setDateOffset] = useState(0)
  const [activeTab, setActiveTab] = useState('leaveRequest')
  const [selectedAssociate, setSelectedAssociate] = useState<AdminUser | null>(
    null,
  )

  const isFirstDate =
    days.length > 0 &&
    days[0].fullDate &&
    isSameDay(days[0].fullDate, new Date(selectedDate))
  const isLastDate =
    days.length > 0 &&
    days[days.length - 1].fullDate &&
    isSameDay(days[days.length - 1].fullDate, new Date(selectedDate))

  // ============================================================
  // Calendar day generation
  // ============================================================

  const updateCalendarDays = () => {
    if (activeTimeFrame === 'weekly') {
      setDays(getWeekDays(currentDate, selectedDate))
    } else {
      setDays(getMonthDays(currentDate, selectedDate))
    }
  }

  // ============================================================
  // Navigation handlers
  // ============================================================

  const handleTodayClick = () => {
    const todayStr = format(today, "yyyy-MM-dd'T'HH:mm:ssxxx")
    setSelectedDate(todayStr)
    setCurrentDate(todayStr)
    setSelectedMonth(`${format(today, 'MMMM')} ${format(today, 'yyyy')}`)
    setActiveTab('leaveRequest')

    const weekDiff = Math.floor(
      (today.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000),
    )
    setDateOffset(weekDiff)

    setTimeout(() => {
      const newDays =
        activeTimeFrame === 'weekly'
          ? getWeekDays(today, today)
          : getMonthDays(currentDate, selectedDate)

      setDays(newDays)

      const todayIndex = newDays.findIndex((day) =>
        isSameDay(day.fullDate, today),
      )
      if (todayIndex !== -1) {
        setActiveIndex(todayIndex)
      }
    }, 0)

    onDateChange?.(todayStr)
  }

  const isTodaySelected = () => {
    return isSameDay(new Date(selectedDate), today)
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    if (activeTimeFrame === 'weekly') {
      const daysToAdd = direction === 'prev' ? -7 : 7
      newDate.setDate(newDate.getDate() + daysToAdd)
    } else {
      const monthsToAdd = direction === 'prev' ? -1 : 1
      newDate.setMonth(newDate.getMonth() + monthsToAdd)
      newDate.setDate(1)
    }

    const newDateStr = format(newDate, "yyyy-MM-dd'T'HH:mm:ssxxx")
    setCurrentDate(newDateStr)
    setSelectedDate(newDateStr)
    setDateOffset(dateOffset + (direction === 'prev' ? -1 : 1))
    setActiveTab('leaveRequest')

    const newMonth = `${format(newDate, 'MMMM')} ${format(newDate, 'yyyy')}`
    setSelectedMonth(newMonth)

    updateCalendarDays()
    onDateChange?.(newDateStr)
  }

  const handleMonthSelection = (monthYear: string) => {
    const [month, year] = monthYear.split(' ')
    const newDate = new Date(selectedDate)
    newDate.setMonth(new Date(`${month} 1, 2024`).getMonth())
    newDate.setFullYear(parseInt(year))

    const newDateStr = format(newDate, "yyyy-MM-dd'T'HH:mm:ssxxx")
    setCurrentDate(newDateStr)
    setSelectedDate(newDateStr)
    setSelectedMonth(monthYear)
    setActiveTab('leaveRequest')

    const weekDiff = Math.floor(
      (newDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000),
    )
    setDateOffset(weekDiff)

    onDateChange?.(newDateStr)
  }

  const getYearsList = () => {
    const years: string[] = []
    const currentYear = new Date().getFullYear()
    const currentMonth = format(new Date(selectedDate), 'MMMM')

    for (let i = -2; i < 1; i++) {
      const date = new Date(currentYear + i, 0)
      years.push(`${currentMonth} ${date.getFullYear()}`)
    }
    return years
  }

  const handleTabClick = (index: number) => {
    const newSelectedDate = days[index].fullDate

    setActiveIndex(index)
    const newDateStr = format(newSelectedDate, "yyyy-MM-dd'T'HH:mm:ssxxx")
    setSelectedDate(newDateStr)
    setIsFutureDate(getStartOfDay(newSelectedDate) > getStartOfDay(today))
    onDateChange?.(newDateStr)
  }

  const handleDayClick = (index: number, date: Date) => {
    if (activeTimeFrame === 'weekly') {
      handleTabClick(index)
      setActiveTab('leaveRequest')
    } else {
      const newDateStr = format(date, "yyyy-MM-dd'T'HH:mm:ssxxx")
      setSelectedDate(newDateStr)
      setIsFutureDate(getStartOfDay(date) > getStartOfDay(today))
      setActiveTab('leaveRequest')
      onDateChange?.(newDateStr)
    }
    const newMonth = `${format(date, 'MMMM')} ${format(date, 'yyyy')}`
    setSelectedMonth(newMonth)
  }

  const handleRequestTabSwitch = (tab: string) => {
    setActiveTab(tab)
  }

  // ============================================================
  // Associate selection
  // ============================================================

  const handleSelectAssociate = (user: AdminUser | null) => {
    setSelectedAssociate(user)
    onAssociateChange?.(user)
  }

  // ============================================================
  // Effects
  // ============================================================

  useEffect(() => {
    setDays([])
    updateCalendarDays()
    onTimeFrameChange?.(activeTimeFrame)
  }, [activeTimeFrame])

  useEffect(() => {
    updateCalendarDays()
  }, [activeTimeFrame, currentDate, dateOffset, selectedDate])

  useEffect(() => {
    const month = format(new Date(currentDate), 'MMMM')
    const year = format(new Date(currentDate), 'yyyy')
    setSelectedMonth(`${month} ${year}`)
    const initialDays =
      activeTimeFrame === 'weekly'
        ? getWeekDays(currentDate, selectedDate)
        : getMonthDays(currentDate, selectedDate)
    setDays(initialDays)

    const todayIndex = initialDays.findIndex((day) =>
      isSameDay(day.fullDate, today),
    )
    if (todayIndex !== -1) {
      setActiveIndex(todayIndex)
    }
  }, [])

  useEffect(() => {
    if (leaveRequests.length > 0) {
      setActiveTab('leaveRequest')
    } else if (filteredAttendanceCorrections.length > 0) {
      setActiveTab('attendanceRequest')
    }
  }, [leaveRequests.length, attendanceCorrections.length])

  // ============================================================
  // Filtered corrections
  // ============================================================

  const filteredAttendanceCorrections = attendanceCorrections.filter(
    (correction) => correction.correctionStatus === 'PENDING',
  )

  // ============================================================
  // Loading state
  // ============================================================

  if (isLoadingProp) {
    return <DashboardSkeleton />
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="flex w-full max-w-[var(--max-width)] flex-col items-center justify-center max-md:h-[100%] max-md:justify-start">
      <div className="z-[1] flex w-full flex-col items-start justify-start rounded-[8px] border border-[var(--color-border-default,#F7E9E9)] bg-[var(--color-layer-02)] p-[16px] shadow-[0px_25px_40px_0px_var(--shadow-01,#E6E4E5)] max-md:h-[calc(100vh-201px)] max-md:max-h-[calc(100vh-201px)] max-md:overflow-y-auto max-md:border-0 max-md:px-4 max-md:pb-[0px] max-md:pt-[24px]">
        {/* ============================================================ */}
        {/* Header: Month selector + Associate filter + Toggle + Arrows  */}
        {/* ============================================================ */}
        <DashboardHeader
          selectedMonth={selectedMonth}
          yearsList={getYearsList()}
          isTodaySelected={isTodaySelected()}
          selectedAssociate={selectedAssociate}
          users={users}
          userImages={userImages}
          activeTimeFrame={activeTimeFrame}
          onMonthSelection={handleMonthSelection}
          onTodayClick={handleTodayClick}
          onSelectAssociate={handleSelectAssociate}
          onTimeFrameChange={(id) => setActiveTimeFrame(id)}
          onDateChange={handleDateChange}
        />

        {/* ============================================================ */}
        {/* Calendar Grid                                                */}
        {/* ============================================================ */}
        <div
          className={`calender ${
            activeTimeFrame === 'weekly' ? 'flex' : 'grid grid-cols-7 gap-0'
          } w-full items-center`}
        >
          {activeTimeFrame === 'monthly' &&
            ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((weekDay) => (
              <div key={weekDay} className="pb-2 pt-4 text-center">
                <span className="L3 uppercase text-[var(--color-text-tertiary)]">
                  {weekDay}
                </span>
              </div>
            ))}

          {days.map((day, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className={`${
                activeTimeFrame === 'weekly'
                  ? 'w-full rounded-t-lg pb-3.5 pt-4 max-md:rounded-lg'
                  : 'pb-0 pt-0'
              } flex cursor-pointer flex-col items-center text-center ${
                activeTimeFrame === 'weekly' && activeIndex === index
                  ? selectedUserAttendance?.status === 'BREAK'
                    ? 'bg-[var(--color-layer-accent-subtle)]'
                    : 'bg-[var(--color-layer-02)]'
                  : ''
              } ${day.isPadding ? 'opacity-50' : ''} `}
              onClick={() => handleDayClick(index, day.fullDate)}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleDayClick(index, day.fullDate)
              }
            >
              {activeTimeFrame === 'weekly' && (
                <span className="L3 mb-2 uppercase text-[var(--color-text-tertiary)]">
                  {day.day}
                </span>
              )}
              <RenderDate
                day={day}
                isAdmin={true}
                selectedDate={selectedDate}
                dateAttendanceMap={selectedAssociate ? dateAttendanceMap : null}
                activeTimeFrame={activeTimeFrame}
              />
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* Content area below calendar                                  */}
        {/* ============================================================ */}
        <div
          className={cn(
            'flex w-full flex-col rounded-[8px] bg-[var(--color-layer-02)] md:p-0 md:p-6 max-md:bg-transparent',
            {
              'rounded-lg': !isFirstDate && !isLastDate,
              'rounded-lg rounded-tl-none': isFirstDate && !isLastDate,
              'rounded-b-lg rounded-tr-none': !isFirstDate && isLastDate,
              'rounded-none': isFirstDate && isLastDate,
            },
          )}
        >
          {/* ============================================================ */}
          {/* Grouped attendance (no associate selected)                   */}
          {/* ============================================================ */}
          {!selectedAssociate && (
            <AttendanceOverview
              isFutureDate={isFutureDate}
              users={users}
              groupedAttendance={groupedAttendance}
              userImages={userImages}
              selectedDate={selectedDate}
            />
          )}

          {/* ============================================================ */}
          {/* Selected associate detail area                               */}
          {/* ============================================================ */}
          {selectedAssociate && (
            <AssociateDetail
              selectedAssociate={selectedAssociate}
              selectedDate={selectedDate}
              selectedUserAttendance={selectedUserAttendance}
              userTasks={userTasks}
              selectedBreakRequest={selectedBreakRequest}
              isFutureDate={isFutureDate}
              assetsBaseUrl={assetsBaseUrl}
              onUpdateAttendanceStatus={onUpdateAttendanceStatus}
              onToggleTaskStatus={onToggleTaskStatus}
              onAddTask={onAddTask}
              onReorderTasks={onReorderTasks}
              onCancelBreak={onCancelBreak}
              onRefreshSelectedUserAttendance={onRefreshSelectedUserAttendance}
              onRefreshAttendanceData={onRefreshAttendanceData}
            />
          )}

          {/* ============================================================ */}
          {/* Requests / Corrections tabs                                  */}
          {/* ============================================================ */}
          {filteredAttendanceCorrections.length > 0 ||
          leaveRequests.length > 0 ? (
            <div className="w-full p-0 md:p-6">
              <div className="max-md:pt[16px] flex flex-col items-start overflow-hidden rounded-[8px] border-0 border-[var(--color-border-subtle)] bg-[var(--color-layer-01)] pt-2 md:border max-md:pb-0">
                <div className="flex w-full items-start border-b-[1px] border-b-[var(--color-border-default)] px-6 md:border-b max-md:border-0 max-md:px-[0px]">
                  {leaveRequests.length > 0 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleRequestTabSwitch('leaveRequest')}
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        handleRequestTabSwitch('leaveRequest')
                      }
                      className={`L3 cursor-pointer px-2 py-3 uppercase ${
                        activeTab === 'leaveRequest'
                          ? 'border-b-[1px] border-b-[var(--color-interactive-hover)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      <span className="hidden sm:inline">break </span>Requests
                      <span className="text-[var(--color-interactive-hover)]">
                        ({leaveRequests.length})
                      </span>
                    </div>
                  )}
                  {filteredAttendanceCorrections.length > 0 && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleRequestTabSwitch('attendanceRequest')
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        handleRequestTabSwitch('attendanceRequest')
                      }
                      className={`L3 cursor-pointer px-2 py-3 uppercase ${
                        activeTab === 'attendanceRequest'
                          ? 'border-b-[1px] border-b-[var(--color-interactive-hover)] text-[var(--color-text-primary)]'
                          : 'text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      Attendance Correction{' '}
                      <span className="text-[var(--color-interactive-hover)]">
                        ({filteredAttendanceCorrections.length})
                      </span>
                    </div>
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
                      activeTimeFrame={activeTimeFrame}
                      onApproveCorrection={onApproveCorrection}
                      onRejectCorrection={onRejectCorrection}
                    />
                  )}

                {/* Leave Requests Tab Content */}
                {activeTab === 'leaveRequest' && leaveRequests.length > 0 && (
                  <LeaveRequests
                    requests={leaveRequests}
                    currentUserId={currentUserId}
                    userImages={userImages}
                    activeTimeFrame={activeTimeFrame}
                    onApproveBreak={onApproveBreak}
                    onRejectBreak={onRejectBreak}
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

AdminDashboard.displayName = 'AdminDashboard'
