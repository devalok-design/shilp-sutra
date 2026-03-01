'use client'

// ============================================================
// AdminDashboard — Main attendance dashboard component
// Ported from karm-v1. All data comes via props; no fetch calls.
// ============================================================

import * as React from 'react'
import { Fragment, useEffect, useState, useRef, type CSSProperties } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../../ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../ui/tooltip'
import { cn } from '../../../ui/lib/utils'
import { AvatarStack } from '../../../ui/avatar-stack'
import { CustomButton } from '../../custom-buttons/CustomButton'
import { IconButton } from '../../custom-buttons/icon-button'
import { Toggle } from '../../custom-buttons/Toggle'
import {
  FilledArrowIcon,
  ArrowLeftIcon,
  ArrowForwardIcon,
  ArrowDropdownIcon,
  CrossIcon,
  TickIcon,
  PersonIcon,
  EditIcon,
  SendIcon,
  AddIcon,
  DragIcon,
  DragActiveIcon,
  CheckboxIcon,
  CheckboxActiveIcon,
} from '../icons'
import {
  formatDateWithWeekday,
  isSameDay,
  getWeekDays,
  getMonthDays,
  getStartOfDay,
  getEndOfDay,
} from '../utils/date-utils'
import { DashboardSkeleton } from './dashboard-skeleton'
import { BreakRequestCard } from './break-request'
import { LeaveRequests } from './leave-requests'
import type {
  AdminUser,
  AttendanceRecord,
  AttendanceStatus,
  BreakRequest,
  CorrectionStatus,
  DayInfo,
  GroupedAttendance,
  RealtimeCallbacks,
  UserRole,
} from '../types'
import { format, isBefore, startOfDay as fnsStartOfDay } from 'date-fns'

// ============================================================
// RenderDate — Inline date cell with attendance-aware styling
// Ported from ~/components/modals/render-date
// ============================================================

interface DateAttendanceInfo {
  status: AttendanceStatus | null
  hasCorrectionOrApproval?: boolean
  isBreakApproved?: boolean
}

interface RenderDateProps {
  day: DayInfo
  isAdmin: boolean
  selectedDate: string | Date
  dateAttendanceMap: Map<string, DateAttendanceInfo> | null
  activeTimeFrame: string
}

function RenderDate({
  day,
  isAdmin,
  dateAttendanceMap,
  selectedDate,
  activeTimeFrame,
}: RenderDateProps) {
  const [state, setState] = useState({
    today: day.isToday,
    isPresent: null as boolean | null,
    isDefault: null as boolean | null,
    isBreak: null as boolean | null,
    isAbsent: null as boolean | null,
    breakStart: null as boolean | null,
    breakMid: null as boolean | null,
    breakEnd: null as boolean | null,
    disabled: null as boolean | null,
    disabledState: false,
    hover: false,
    focus: false,
    pressed: false,
    selected: day.isActive,
  })

  const isPastDate = (date: Date) => {
    const today = new Date()
    return getStartOfDay(date) < getStartOfDay(today)
  }

  const isBreakDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const attendanceInfo = dateAttendanceMap?.get(formattedDate)
    return attendanceInfo?.status === 'BREAK'
  }

  const isAbsentDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const attendanceInfo = dateAttendanceMap?.get(formattedDate)
    return (
      isPastDate(date) &&
      attendanceInfo &&
      !attendanceInfo.hasCorrectionOrApproval &&
      attendanceInfo?.status === 'ABSENT'
    )
  }

  const isPresentDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const attendanceInfo = dateAttendanceMap?.get(formattedDate)
    return attendanceInfo?.status === 'PRESENT'
  }

  useEffect(() => {
    const present = isPresentDay(day.fullDate) ?? false
    const breakDay = isBreakDay(day.fullDate) ?? false
    const absent = isAbsentDay(day.fullDate) ?? false
    const disabled = (day as any).isDisabled || false
    const isDefault = !day.isToday && !breakDay && !absent && !disabled

    let breakStart = false
    let breakMid = false
    let breakEnd = false

    if (breakDay) {
      const prevDate = new Date(day.fullDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateFormatted = format(prevDate, 'yyyy-MM-dd')

      const nextDate = new Date(day.fullDate)
      nextDate.setDate(nextDate.getDate() + 1)
      const nextDateFormatted = format(nextDate, 'yyyy-MM-dd')

      const isPrevBreak =
        dateAttendanceMap?.get(prevDateFormatted)?.status === 'BREAK' &&
        dateAttendanceMap?.get(prevDateFormatted)?.isBreakApproved
      const isNextBreak =
        dateAttendanceMap?.get(nextDateFormatted)?.status === 'BREAK' &&
        dateAttendanceMap?.get(nextDateFormatted)?.isBreakApproved

      breakStart = breakDay && !isPrevBreak && !!isNextBreak
      breakMid = breakDay && !!isPrevBreak && !!isNextBreak
      breakEnd = breakDay && !!isPrevBreak && !isNextBreak

      if (breakDay && !isPrevBreak && !isNextBreak) {
        breakStart = true
        breakEnd = true
        breakMid = false
      }
    }

    const selected = isSameDay(new Date(selectedDate), day.fullDate)

    setState((prev) => ({
      ...prev,
      isPresent: present,
      isBreak: breakDay,
      isAbsent: absent,
      disabled,
      isDefault,
      breakStart,
      breakMid,
      breakEnd,
      selected,
    }))
  }, [day, dateAttendanceMap, selectedDate, isAdmin])

  const getBGStyles = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4px',
      marginLeft: '0px',
      marginRight: '0px',
    }

    let backgroundColor = 'transparent'
    let borderTopLeftRadius = '0px'
    let borderBottomLeftRadius = '0px'
    let borderTopRightRadius = '0px'
    let borderBottomRightRadius = '0px'

    if (state.isBreak && activeTimeFrame !== 'weekly') {
      if (state.breakStart && !state.breakEnd) {
        borderTopLeftRadius = '20px'
        borderBottomLeftRadius = '20px'
        baseStyle.justifyContent = 'center'
      }

      if (state.breakEnd && !state.breakStart) {
        borderTopRightRadius = '20px'
        borderBottomRightRadius = '20px'
        baseStyle.justifyContent = 'center'
      }

      if (state.breakMid) {
        backgroundColor = '#F8F6FC'
      }
    }

    return {
      ...baseStyle,
      backgroundColor,
      borderTopLeftRadius,
      borderBottomLeftRadius,
      borderTopRightRadius,
      borderBottomRightRadius,
    }
  }

  const getStyles = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      fontSize: '16px',
      fontWeight: '400',
      cursor: state.disabled ? 'default' : 'pointer',
      position: 'relative',
      transition: 'background-color 0.2s, color 0.2s, border 0.2s',
      outlineColor: '#DD9EB8',
      outlineStyle: 'solid',
      outlineWidth: '0px',
      overflow: 'hidden',
    }

    let backgroundColor = 'transparent'
    let color = '#000000'
    let border = 'none'
    let boxShadow = 'none'
    let fontWeight = '400'

    if (state.disabled) {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: '#B7AFB2',
        cursor: 'default',
      }
    }

    if (state.today && !state.isBreak) {
      backgroundColor = '#D33163'
      color = '#FFFFFF'
      boxShadow =
        '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 8px 0px var(--Mapped-Surface-Button-secondary, #B6204A) inset'
    } else if (state.isBreak) {
      backgroundColor = '#E6E1F3'
      color = '#403A3C'
      boxShadow =
        '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 4px 0px var(--primitives-purple-400-b, #AB9DED) inset'

      if (state.breakStart && !state.breakEnd && activeTimeFrame !== 'weekly') {
        baseStyle.borderTopLeftRadius = '20px'
        baseStyle.borderBottomLeftRadius = '20px'
      }

      if (state.breakEnd && !state.breakStart && activeTimeFrame !== 'weekly') {
        baseStyle.borderTopRightRadius = '20px'
        baseStyle.borderBottomRightRadius = '20px'
      }

      if (state.breakMid && activeTimeFrame !== 'weekly') {
        baseStyle.borderRadius = '0px'
        backgroundColor = '#F8F6FC'
        color = '#403A3C'
        boxShadow = 'unset'
      }
    } else if (state.isAbsent) {
      backgroundColor = 'transparent'
      color = '#D2222D'
    } else if (state.isPresent) {
      backgroundColor = 'transparent'
      color = '#3F181E'
    } else if (state.isDefault) {
      backgroundColor = 'transparent'
      color = '#6B6164'
    }

    if (state.hover) {
      if (state.today && !state.isBreak) {
        backgroundColor = '#B02651'
        color = '#FFFFFF'
        boxShadow =
          '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 8px 0px var(--Mapped-Surface-Button-secondary, #B6204A) inset'
      } else if (state.isPresent) {
        backgroundColor = '#E6E4E5'
        color = '#3F181E'
      } else if (state.isDefault) {
        backgroundColor = '#E6E4E5'
        color = '#6B6164'
      } else if (state.isBreak) {
        backgroundColor = '#E6E1F3'
        color = '#403A3C'
        boxShadow =
          '0px 4px 4px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 4px 0px var(--primitives-purple-400-b, #AB9DED) inset'

        if (state.breakStart && !state.breakEnd && activeTimeFrame !== 'weekly') {
          baseStyle.borderTopLeftRadius = '20px'
          baseStyle.borderBottomLeftRadius = '20px'
        }

        if (state.breakEnd && !state.breakStart && activeTimeFrame !== 'weekly') {
          baseStyle.borderTopRightRadius = '20px'
          baseStyle.borderBottomRightRadius = '20px'
        }

        if (state.breakMid && activeTimeFrame !== 'weekly') {
          baseStyle.borderRadius = '0px'
          backgroundColor = '#F8F6FC'
          color = '#403A3C'
          boxShadow = 'unset'
        }
      } else if (state.isAbsent) {
        backgroundColor = '#E6E4E5'
        color = '#D2222D'
      } else if (state.disabled) {
        backgroundColor = '#E6E4E5'
        color = '#B7AFB2'
      }
    }

    if (state.focus && !state.pressed) {
      baseStyle.outlineWidth = '2px'
    }

    if (state.pressed) {
      baseStyle.position = 'relative'
      if (
        state.isPresent ||
        state.isAbsent ||
        state.isDefault ||
        state.disabled
      ) {
        backgroundColor = '#FCF7F7'
      }
    }

    if (state.selected) {
      fontWeight = '600'
      if (activeTimeFrame === 'monthly') {
        color = 'var(--Text-Primary)'
      }
    }

    if (state.disabledState) {
      color = '#B7AFB2'
      if (state.today) {
        color = '#FFF'
        backgroundColor = '#B7AFB2'
      }
    }

    return {
      ...baseStyle,
      backgroundColor,
      color,
      border,
      fontWeight,
      boxShadow,
    }
  }

  return (
    <div
      className={cn('background', {
        'calendar start-date':
          state.isBreak && state.breakStart && !state.breakEnd,
        'calendar end-date':
          state.isBreak && !state.breakStart && state.breakEnd,
        weekly: activeTimeFrame === 'weekly',
      })}
      style={getBGStyles()}
    >
      <div
        className={cn('date', {
          pressed: state.pressed,
          'text-bold': state.selected,
        })}
        tabIndex={0}
        onMouseEnter={() => setState((prev) => ({ ...prev, hover: true }))}
        onMouseLeave={() => setState((prev) => ({ ...prev, hover: false }))}
        onFocus={() => setState((prev) => ({ ...prev, focus: true }))}
        onBlur={() => setState((prev) => ({ ...prev, focus: false }))}
        onMouseDown={() => setState((prev) => ({ ...prev, pressed: true }))}
        onMouseUp={() => setState((prev) => ({ ...prev, pressed: false }))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setState((prev) => ({ ...prev, pressed: true }))
          }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setState((prev) => ({ ...prev, pressed: false }))
          }
        }}
        style={getStyles()}
      >
        {day.date}
        {state.isAbsent && (
          <span
            style={{
              position: 'absolute',
              bottom: '0px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#D2222D',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </div>
    </div>
  )
}

RenderDate.displayName = 'RenderDate'

// ============================================================
// Task type (simplified for this component)
// ============================================================

export interface TaskItem {
  id: string
  title: string
  status: string
  assigneeIds?: string
  priority?: string
}

// ============================================================
// Correction type (simplified)
// ============================================================

export interface AttendanceCorrection {
  id: string
  date: string
  reason?: string
  requestedDate?: string
  correctionStatus: CorrectionStatus
  user?: AdminUser
}

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
  onToggleTaskStatus?: (taskId: string, newStatus: string) => void | Promise<void>
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
  const [selectedAssociate, setSelectedAssociate] = useState<AdminUser | null>(null)
  const [newTaskName, setNewTaskName] = useState('')
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null)
  const [hoveredTaskIndex, setHoveredTaskIndex] = useState<number | null>(null)
  const [correctionDates, setCorrectionDates] = useState<Record<string, boolean>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
  // Task handlers
  // ============================================================

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim() || !selectedAssociate) return

    await onAddTask?.(newTaskName, selectedAssociate.id)
    setNewTaskName('')
  }

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedTaskIndex(idx)
    ;(e.target as HTMLElement).classList.add('dragging')
  }

  const handleDrop = async (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (draggedTaskIndex !== null && draggedTaskIndex !== idx) {
      const draggedTask = userTasks[draggedTaskIndex]
      const targetTask = userTasks[idx]

      await onReorderTasks?.(draggedTask.id, targetTask.id)
    }
    setDraggedTaskIndex(null)
    setHoveredTaskIndex(null)
  }

  // ============================================================
  // Correction handling
  // ============================================================

  const handleCorrectionAction = async (
    correction: AttendanceCorrection,
    status: CorrectionStatus,
  ) => {
    if (status === 'APPROVED') {
      await onApproveCorrection?.(correction.id)
    } else {
      await onRejectCorrection?.(correction.id)
    }
  }

  // ============================================================
  // On-break group helper (for future dates)
  // ============================================================

  const onBreakGroup = (
    allUsers: AdminUser[],
    attendances: AttendanceRecord[],
    date: string | Date,
  ) => {
    const onBreakUsers: AdminUser[] = []
    if (!allUsers?.length) return { onBreak: onBreakUsers }

    const dateObj = new Date(date)
    const startOfDayTime = new Date(dateObj)
    startOfDayTime.setHours(0, 0, 0, 0)
    const endOfDayTime = new Date(dateObj)
    endOfDayTime.setHours(23, 59, 59, 999)

    const attendanceMap = new Map<string, AttendanceStatus>()
    attendances.forEach((attendance) => {
      const attendanceDate = new Date(attendance.date)
      if (attendanceDate >= startOfDayTime && attendanceDate <= endOfDayTime) {
        attendanceMap.set(attendance.userId, attendance.status)
      }
    })

    allUsers.forEach((user) => {
      if (attendanceMap.get(user.id) === 'BREAK') {
        onBreakUsers.push(user)
      }
    })

    return { onBreak: onBreakUsers }
  }

  // ============================================================
  // Attendance status render
  // ============================================================

  const renderAttendanceStatus = () => {
    const status = selectedUserAttendance?.status || 'ABSENT'
    const displayStatus =
      status === 'Not_Marked' ? 'ABSENT' : status
    const formattedStatus =
      displayStatus.charAt(0).toUpperCase() +
      displayStatus.slice(1).toLowerCase()

    const timeIn = selectedUserAttendance?.timeIn
      ? new Date(selectedUserAttendance.timeIn).toLocaleTimeString()
      : null

    return (
      <div className="flex w-full flex-col items-center justify-center px-[16px] py-[32px] sm:px-4 sm:py-6 md:px-6 md:py-4 md:pr-0">
        <p className="L3 mb-6 uppercase text-[var(--Mapped-Text-Tertiary)]">
          Attendance status
        </p>
        <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-3xl border border-[var(--border-secondary)] px-4 py-3.5 text-center">
          <span className="font-semibold text-[var(--Mapped-Text-Highlight)]">
            {formattedStatus}
          </span>
          {formattedStatus === 'Absent' && (
            <div
              style={{
                width: '1px',
                height: '20px',
                opacity: 0.5,
                background: 'var(--Border-Tertiary, #DD9EB8)',
              }}
            ></div>
          )}
          {!timeIn && status !== 'HOLIDAY' && status !== 'WEEKEND' && (
            <span className="B2-Reg text-[var(--Mapped-Text-Tertiary)]">
              Not marked
            </span>
          )}
          {!!timeIn && status === 'ABSENT' && (
            <span className="B2-Reg text-[var(--Mapped-Text-Tertiary)]">
              Removed
            </span>
          )}
        </div>

        {timeIn && (
          <p className="B2-Reg m-0 text-center text-[var(--Mapped-Text-Disabled)]">
            Marked at {timeIn}
          </p>
        )}
      </div>
    )
  }

  // ============================================================
  // Attendance edit dialog
  // ============================================================

  const renderAttendanceDialog = () => {
    if (!selectedAssociate) return null

    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="B2-Reg text-[var(--Mapped-Text-Tertiary)]">
            Edit attendance of{' '}
            <span className="B2-Bold semibold text-[var(--Mapped-Text-Highlight)]">
              {selectedAssociate.name}
            </span>
          </div>
        </DialogHeader>
        <div className="flex flex-col items-center justify-start">
          <div className="T7-Reg mb-4 text-[var(--Mapped-Text-Highlight)]">
            {format(new Date(selectedDate), "dd MMMM ''yy")}
          </div>
          <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-3xl border border-[var(--border-secondary)] px-4 py-3.5 text-center font-semibold text-[var(--Mapped-Text-Highlight)]">
            {selectedUserAttendance?.status === 'PRESENT'
              ? 'PRESENT '
              : 'ABSENT'}
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <CustomButton
              className="w-full"
              type="filled"
              text={`Mark as ${selectedUserAttendance?.status === 'PRESENT' ? 'absent' : 'present'}`}
              onClick={() => {
                const isPresent = selectedUserAttendance?.status !== 'PRESENT'
                onUpdateAttendanceStatus?.({
                  userId: selectedAssociate.id,
                  date: selectedDate,
                  isPresent,
                })
              }}
            />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    )
  }

  // ============================================================
  // Correction date helpers
  // ============================================================

  const hasCorrectionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return correctionDates[dateStr]
  }

  // ============================================================
  // Horizontal scroll drag helpers
  // ============================================================

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0))
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (scrollContainerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 2
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
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

  // Build correction dates from corrections prop
  useEffect(() => {
    const newCorrectionDates: Record<string, boolean> = {}
    attendanceCorrections.forEach((correction) => {
      if (correction.requestedDate) {
        const dateStr = format(new Date(correction.requestedDate), 'yyyy-MM-dd')
        newCorrectionDates[dateStr] = true
      }
    })
    setCorrectionDates(newCorrectionDates)
  }, [attendanceCorrections])

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
      <div className="z-[1] flex w-full flex-col items-start justify-start rounded-[8px] border border-[var(--border-primary,#F7E9E9)] bg-[var(--Mapped-Surface-Tertiary)] p-[16px] shadow-[0px_25px_40px_0px_var(--Elevation-1,#E6E4E5)] max-md:h-[calc(100vh-201px)] max-md:max-h-[calc(100vh-201px)] max-md:overflow-y-auto max-md:border-0 max-md:px-4 max-md:pb-[0px] max-md:pt-[24px]">
        {/* ============================================================ */}
        {/* Header: Month selector + Associate filter + Toggle + Arrows  */}
        {/* ============================================================ */}
        <div className="mb-6 flex w-full flex-col items-start justify-between md:flex-row md:items-center">
          <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger className="T6-Reg flex items-center gap-2 text-[var(--Mapped-Text-Secondary)]">
                {selectedMonth}
                <FilledArrowIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="custom-scrollbar absolute ml-10 max-h-[300px] overflow-y-auto rounded-[7px] border border-0 border-[var(--border-primary)] p-0 shadow-md shadow-[rgba(77,10,28,0.2)]">
                {getYearsList().map((year, index) => (
                  <DropdownMenuItem
                    key={year}
                    onSelect={() => {
                      handleMonthSelection(year)
                    }}
                    className={`p-0 ${index !== getYearsList().length - 1 ? 'border-b border-b-[var(--border-primary)]' : ''}`}
                  >
                    <span
                      className={`w-full py-3 pl-4 pr-6 ${selectedMonth === year ? 'B2-Semibold bg-[var(--Mapped-Surface-Button-Primary)] font-semibold text-[var(--neutrals-lightest)]' : 'B2-Reg text-[var(--Mapped-Text-Secondary)] hover:bg-[var(--Elevation-Card-hover-primary)]'} ${index === 0 ? 'rounded-t-[7px]' : index === getYearsList().length - 1 ? 'rounded-b-[7px]' : ''} `}
                    >
                      {year.split(' ')[1]}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {!isTodaySelected() && (
              <CustomButton
                type="outline"
                text="Today"
                onClick={handleTodayClick}
              />
            )}
          </div>
          <div className="flex w-full items-center justify-between gap-4 md:mt-0 md:w-auto md:justify-start max-md:mt-[17px] max-lg:gap-[0.5rem]">
            <div className="hidden md:flex">
              {selectedAssociate ? (
                <div className="B2-Reg flex-direction-row flex items-center justify-start rounded-[6px] bg-[var(--Alias-Semantics-Highlight-darkest,#1E1429)] px-[8px] py-[6px] text-[var(--Text-Button-Text)]">
                  <div className="flex items-center justify-start gap-0">
                    {userImages[selectedAssociate.id] ? (
                      <img
                        src={userImages[selectedAssociate.id]}
                        alt={`${selectedAssociate.name}'s avatar`}
                        className="h-5 w-5 rounded-full"
                      />
                    ) : (
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-[var(--Mapped-Text-Highlight)]">
                          {selectedAssociate.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <span className="B2-Reg ml-[2px] mr-[4px] text-[var(--Text-Button-Text)]">
                      {selectedAssociate.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectAssociate(null)}
                    className="border-0 bg-transparent p-0"
                  >
                    <CrossIcon className="h-4 w-4 text-[var(--Text-Button-Text)]" />
                  </button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="B2-Reg flex-direction-row hidden items-center justify-between rounded-[6px] border border-[var(--border-secondary)] bg-[var(--Mapped-Surface-Primary)] px-2 py-1.5 md:flex">
                    <div className="flex items-center">
                      <PersonIcon className="h-5 w-5" />
                      <span className="B2-Reg ml-[2px] mr-[4px] text-[var(--Mapped-Text-Secondary)] max-lg:mx-0 max-lg:text-[12px]">
                        Associate
                      </span>
                    </div>
                    <ArrowDropdownIcon className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="custom-scrollbar max-h-[400px] w-64 overflow-y-auto p-2">
                    {users?.length === 0 ? (
                      <DropdownMenuItem disabled>
                        No users available
                      </DropdownMenuItem>
                    ) : (
                      users?.map((user) => (
                        <DropdownMenuItem
                          key={user.id}
                          onSelect={() => {
                            const selectedUser: AdminUser = {
                              ...user,
                              createdAt: new Date(user.createdAt),
                            }
                            handleSelectAssociate(selectedUser)
                          }}
                          className="flex items-center gap-2 p-2"
                        >
                          {userImages[user.id] ? (
                            <img
                              src={userImages[user.id]}
                              alt={`${user.name}'s avatar`}
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-sm text-[var(--Mapped-Text-Highlight)]">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="B2-Reg text-[var(--Mapped-Text-Secondary)]">
                            {user.name}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Toggle
              size="medium"
              color="tonal"
              options={[
                { id: 'weekly', text: 'Weekly' },
                { id: 'monthly', text: 'Monthly' },
              ]}
              selectedId={activeTimeFrame}
              onSelect={(id) => setActiveTimeFrame(id)}
            />
            <div className="flex gap-0">
              <IconButton
                icon={<ArrowLeftIcon />}
                size="small"
                onClick={() => handleDateChange('prev')}
              />
              <IconButton
                icon={<ArrowForwardIcon />}
                size="small"
                onClick={() => handleDateChange('next')}
              />
            </div>
          </div>
        </div>

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
                <span className="L3 uppercase text-[var(--Mapped-Text-Tertiary)]">
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
                    ? 'bg-[var(--Surface-Purple-button-tertiary)]'
                    : 'bg-[var(--Mapped-Surface-Secondary)]'
                  : ''
              } ${day.isPadding ? 'opacity-50' : ''} `}
              onClick={() => handleDayClick(index, day.fullDate)}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleDayClick(index, day.fullDate)
              }
            >
              {activeTimeFrame === 'weekly' && (
                <span className="L3 mb-2 uppercase text-[var(--Mapped-Text-Tertiary)]">
                  {day.day}
                </span>
              )}
              <RenderDate
                day={day}
                isAdmin={true}
                selectedDate={selectedDate}
                dateAttendanceMap={
                  selectedAssociate ? dateAttendanceMap : null
                }
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
            'flex w-full flex-col rounded-[8px] bg-[var(--Mapped-Surface-Secondary)] md:p-0 md:p-6 max-md:bg-transparent',
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
            <div
              ref={scrollContainerRef}
              className="hide-scrollbar w-full cursor-grab overflow-x-auto active:cursor-grabbing max-md:pb-[16px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <div
                className="items-flex-start flex flex-row justify-start gap-3 px-0 pt-2 md:gap-0 md:px-6"
                style={{ minWidth: 'max-content' }}
              >
                {isFutureDate ? (
                  <div className="min-h-28">
                    {users &&
                      Object.entries(
                        onBreakGroup(users, [] as AttendanceRecord[], selectedDate),
                      )?.map(([status, breakUsers]) => {
                        const usersList = breakUsers as AdminUser[]
                        return (
                          <div
                            key={status}
                            className="flex w-full flex-col gap-[12px] rounded-md bg-[var(--Mapped-Surface-Secondary)] p-[24px] md:rounded-lg"
                          >
                            {usersList?.length > 0 && (
                              <h2 className="L3 capitalize text-[var(--Mapped-Text-Tertiary)]">
                                {`On Break (${usersList?.length || 0})`}
                              </h2>
                            )}
                            <div className="flex w-full flex-wrap items-center">
                              {usersList?.length > 0 && (
                                <AvatarStack
                                  avatars={usersList?.map((user) => ({
                                    src: userImages[user.id],
                                    alt: `${user.name}'s avatar`,
                                    fallback: user.name?.charAt(0) || 'U',
                                    name: user.name || 'User',
                                  }))}
                                  maxAvatars={4}
                                />
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  Object.entries(groupedAttendance || {}).map(
                    ([status, groupUsers], groupIndex) => (
                      <div
                        key={status}
                        className={`flex w-full flex-col gap-3 rounded-md bg-[var(--Mapped-Surface-Secondary)] p-6 md:rounded-lg md:p-4 ${
                          status !== 'yetToMark'
                            ? 'border-r border-[var(--border-primary)]'
                            : ''
                        } max-md:border-0 max-md:p-[16px]`}
                        style={{ minWidth: '200px' }}
                      >
                        <h2 className="L3 capitalize text-[var(--Mapped-Text-Tertiary)]">
                          {status === 'yetToMark'
                            ? 'Yet to Mark'
                            : status
                                .replace(/([A-Z])/g, ' $1')
                                .toLowerCase()}{' '}
                          ({(groupUsers as any[]).length})
                        </h2>
                        <div className="flex cursor-pointer flex-wrap items-center">
                          <AvatarStack
                            avatars={(groupUsers as any[]).map(({ user }: any) => ({
                              src: userImages[user.id],
                              alt: `${user.name}'s avatar`,
                              fallback: user.name.charAt(0),
                              name: user.name,
                            }))}
                            maxAvatars={4}
                          />
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* Selected associate detail area                               */}
          {/* ============================================================ */}
          {selectedAssociate && (
            <div className="relative flex items-center justify-between md:items-stretch">
              {!isFutureDate && selectedUserAttendance?.status !== 'BREAK' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <IconButton
                      icon={<EditIcon />}
                      size="small"
                      className="absolute right-2 top-2"
                    />
                  </DialogTrigger>
                  {renderAttendanceDialog()}
                </Dialog>
              )}
              {isFutureDate ? (
                <>
                  {selectedUserAttendance?.status === 'BREAK' ? (
                    <BreakRequestCard
                      selectedDate={selectedDate}
                      userId={selectedAssociate.id}
                      breakRequest={selectedBreakRequest}
                      assetsBaseUrl={assetsBaseUrl}
                      onCancelBreak={onCancelBreak}
                      onRefreshAttendance={onRefreshSelectedUserAttendance}
                      onRefreshGroupedAttendance={onRefreshAttendanceData}
                    />
                  ) : (
                    <div className="min-h-28"></div>
                  )}
                </>
              ) : selectedUserAttendance?.status === 'BREAK' ? (
                <BreakRequestCard
                  selectedDate={selectedDate}
                  userId={selectedAssociate.id}
                  breakRequest={selectedBreakRequest}
                  assetsBaseUrl={assetsBaseUrl}
                  onCancelBreak={onCancelBreak}
                  onRefreshAttendance={onRefreshSelectedUserAttendance}
                  onRefreshGroupedAttendance={onRefreshAttendanceData}
                />
              ) : selectedUserAttendance?.status === 'ABSENT' ||
                (selectedUserAttendance?.status === 'Not_Marked' &&
                  isBefore(new Date(selectedDate), fnsStartOfDay(new Date()))) ? (
                <div className="flex w-full flex-col items-center justify-center p-6">
                  <p className="L3 mb-4 uppercase text-[var(--Mapped-Text-Tertiary)]">
                    COMMENT
                  </p>
                  <div className="flex w-full items-center justify-between rounded-[var(--Number-4x,8px)] border border-[var(--Border-Primary,#F7E9E9)] bg-[var(--Mapped-Surface-Primary)] px-4 max-md:h-[48px]">
                    <input
                      className="B2-Reg flex-1 border-none py-2 text-[var(--Mapped-Text-Primary)] outline-none"
                      defaultValue="Don't miss next time :)"
                    />
                    <IconButton
                      icon={<SendIcon />}
                      size="small"
                      onClick={() => {
                        const isPresent =
                          selectedUserAttendance?.status !== 'PRESENT'
                        onUpdateAttendanceStatus?.({
                          userId: selectedAssociate.id,
                          date: selectedDate,
                          isPresent,
                        })
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-auto flex w-full flex-col md:pr-[24px]">
                  <p className="L3 mb-[24px] uppercase text-[var(--Mapped-Text-Highlight)]">
                    Tasks for the day
                  </p>

                  {userTasks && (
                    <>
                      <div className="no-scrollbar mb-[8px] flex max-h-[250px] flex-col gap-2 overflow-y-auto">
                        {userTasks.map((task, idx) => (
                          <div
                            key={task.id}
                            className={`task-item mb-[8px] flex items-center gap-[5px] ${
                              draggedTaskIndex === idx ? 'dragging' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnter={() => setHoveredTaskIndex(idx)}
                            onDragLeave={() => setHoveredTaskIndex(null)}
                            onDragEnd={(e) => {
                              if (e.target instanceof HTMLElement) {
                                e.target.classList.remove('dragging')
                              }
                            }}
                          >
                            {hoveredTaskIndex === idx && (
                              <div className="drop-indicator"></div>
                            )}
                            {task.status === 'COMPLETED' ? (
                              <DragActiveIcon className="" />
                            ) : (
                              <DragIcon />
                            )}
                            <div
                              onClick={() => {
                                onToggleTaskStatus?.(
                                  task.id,
                                  task.status === 'COMPLETED'
                                    ? 'TODO'
                                    : 'COMPLETED',
                                )
                              }}
                              className="cursor-pointer"
                            >
                              {task.status === 'COMPLETED' ? (
                                <CheckboxActiveIcon className="text-[var(--Mapped-Surface-Button-Secondary)]" />
                              ) : (
                                <CheckboxIcon />
                              )}
                            </div>
                            <p
                              className={`P7 flex-1 overflow-hidden hyphens-auto break-all pr-4 ${
                                task.status === 'COMPLETED'
                                  ? 'text-[var(--Mapped-Text-Disabled)] line-through'
                                  : 'text-[var(--Mapped-Text-Secondary)]'
                              }`}
                              style={{ wordBreak: 'break-word', minWidth: 0 }}
                            >
                              {task.title}
                            </p>
                          </div>
                        ))}
                      </div>
                      {isSameDay(new Date(selectedDate), new Date()) && (
                        <form
                          className="flex items-center gap-[5px] pb-4"
                          onSubmit={handleAddTask}
                        >
                          <div className="w-[24px]"></div>
                          <button type="submit" className="appearance-none">
                            <AddIcon />
                          </button>
                          <textarea
                            className="B2-Reg flex w-full resize-none items-center border-none bg-transparent !leading-6 text-[var(--Mapped-Text-Secondary)] outline-none placeholder:leading-6"
                            placeholder="Add a task"
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleAddTask(e)
                              }
                            }}
                            rows={1}
                            style={{
                              minHeight: '24px',
                              height: 'auto',
                              overflow: 'hidden',
                            }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement
                              target.style.height = 'auto'
                              target.style.height = target.scrollHeight + 'px'
                            }}
                          />
                        </form>
                      )}
                    </>
                  )}
                </div>
              )}
              {!isFutureDate && selectedUserAttendance?.status !== 'BREAK' && (
                <>
                  <div className="block h-[auto] w-[2px] bg-[var(--border-secondary)]"></div>
                  {renderAttendanceStatus()}
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* Requests / Corrections tabs                                  */}
          {/* ============================================================ */}
          {filteredAttendanceCorrections.length > 0 || leaveRequests.length > 0 ? (
            <div className="w-full p-0 md:p-6">
              <div className="max-md:pt[16px] flex flex-col items-start overflow-hidden rounded-[var(--Number-4x,8px)] border-0 border-[var(--border-secondary)] bg-[var(--Mapped-Surface-Primary)] pt-2 md:border max-md:pb-0">
                <div className="flex w-full items-start border-b-[1px] border-b-[var(--border-primary)] px-6 md:border-b max-md:border-0 max-md:px-[0px]">
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
                          ? 'border-b-[1px] border-b-[var(--Mapped-Surface-Button-Secondary)] text-[var(--Mapped-Text-Primary)]'
                          : 'text-[var(--Mapped-Text-Tertiary)]'
                      }`}
                    >
                      <span className="hidden sm:inline">break </span>Requests
                      <span className="text-[var(--Mapped-Text-Highlight2)]">
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
                          ? 'border-b-[1px] border-b-[var(--Mapped-Surface-Button-Secondary)] text-[var(--Mapped-Text-Primary)]'
                          : 'text-[var(--Mapped-Text-Tertiary)]'
                      }`}
                    >
                      Attendance Correction{' '}
                      <span className="text-[var(--Mapped-Text-Highlight2)]">
                        ({filteredAttendanceCorrections.length})
                      </span>
                    </div>
                  )}
                </div>

                {/* Attendance Corrections Tab Content */}
                {activeTab === 'attendanceRequest' &&
                  filteredAttendanceCorrections.length > 0 && (
                    <div
                      className={`flex max-h-[200px] w-full flex-col overflow-y-auto bg-[var(--Mapped-Surface-Primary)] px-6 max-md:h-[calc(100vh-586px)] max-md:max-h-[calc(100vh-586px)] max-md:min-h-[372px] max-md:p-0 ${activeTimeFrame === 'weekly1' ? 'max-md:h-[calc(100vh-824px)] max-md:max-h-[calc(100vh-824px)]' : ''}`}
                    >
                      {filteredAttendanceCorrections.length === 0 ? (
                        <div className="p-4 text-center">
                          No pending corrections
                        </div>
                      ) : (
                        filteredAttendanceCorrections.map((correction) => (
                          <Fragment key={correction.id}>
                            <div
                              className="max-md:border-1 flex items-center justify-between px-2 py-3.5 max-md:rounded-[8px] max-md:border-[var(--border-primary)]"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  className="h-10 w-10 rounded-full border-2 max-md:mb-[auto]"
                                  src={
                                    userImages[correction?.user?.id || ''] ||
                                    (assetsBaseUrl ? assetsBaseUrl + '/Goutham.png' : '')
                                  }
                                  width={40}
                                  height={40}
                                  alt={`${correction?.user?.name}'s Icon`}
                                />
                                <div className="flex flex-col gap-1">
                                  <p className="B3-Reg text-[var(--Mapped-Text-Secondary)]">
                                    {correction?.user?.name}
                                  </p>
                                  <div className="flex w-full flex-wrap items-center gap-2">
                                    <p className="B1 semibold text-[var(--Mapped-Text-Primary)]">
                                      {correction?.reason}
                                    </p>
                                    {correction?.reason ? (
                                      <p className="B1 font-semibold text-[var(--Mapped-Text-Tertiary)]">
                                        &bull;
                                      </p>
                                    ) : null}
                                    <p className="B1-Reg text-[var(--Mapped-Text-Tertiary)]">
                                      {formatDateWithWeekday(
                                        new Date(correction?.date),
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-auto flex items-center gap-3 max-md:flex-col max-md:justify-center max-md:gap-0">
                                <div className="p-1">
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <button
                                        className={`rounded-full p-2 text-[var(--Mapped-Text-Tertiary)] hover:text-[var(--Mapped-Text-Secondary)] ${
                                          correction?.user?.id === currentUserId
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                        }`}
                                        onClick={() =>
                                          correction?.user?.id !== currentUserId &&
                                          handleCorrectionAction(
                                            correction,
                                            'REJECTED',
                                          )
                                        }
                                        disabled={
                                          correction?.user?.id === currentUserId
                                        }
                                      >
                                        <CrossIcon className="h-6 w-6" />
                                      </button>
                                    </TooltipTrigger>
                                    {correction?.user?.id === currentUserId && (
                                      <TooltipContent>
                                        <p>
                                          You cannot approve/reject your own
                                          correction request
                                        </p>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </div>
                                <div className="p-1">
                                  <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                      <button
                                        className={`rounded-full p-2 ${
                                          correction?.user?.id === currentUserId
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                        }`}
                                        onClick={() =>
                                          correction?.user?.id !== currentUserId &&
                                          handleCorrectionAction(
                                            correction,
                                            'APPROVED',
                                          )
                                        }
                                        disabled={
                                          correction?.user?.id === currentUserId
                                        }
                                      >
                                        <TickIcon className="h-6 w-6 text-[var(--Mapped-Text-Success-On-Light)]" />
                                      </button>
                                    </TooltipTrigger>
                                    {correction?.user?.id === currentUserId && (
                                      <TooltipContent>
                                        <p>
                                          You cannot approve/reject your own
                                          correction request
                                        </p>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </Fragment>
                        ))
                      )}
                    </div>
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
