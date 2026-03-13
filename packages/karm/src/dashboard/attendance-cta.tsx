'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { IconArrowRight, IconCheck, IconClock, IconCoffee } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

interface AttendanceData {
  attendance: {
    id: string
    status: string
    timeIn: string | null
    timeOut: string | null
  }
  breakReason: string | null
}

export interface AttendanceCTAProps extends React.HTMLAttributes<HTMLDivElement> {
  userName: string
  attendance: AttendanceData | null
  canMarkAttendance: boolean
  onMarkAttendance?: () => void
  isSubmitting?: boolean
  /** Optional custom time formatter. Defaults to toLocaleTimeString with IST. */
  formatTime?: (timeStr: string) => string
}

// ============================================================
// Helpers
// ============================================================

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

function defaultFormatTime(timeStr: string): string {
  return new Date(timeStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })
}

// ============================================================
// Component
// ============================================================

const AttendanceCTA = React.forwardRef<HTMLDivElement, AttendanceCTAProps>(
  function AttendanceCTA({
  userName,
  attendance,
  canMarkAttendance,
  onMarkAttendance,
  isSubmitting = false,
  formatTime = defaultFormatTime,
  className,
  ...props
}, ref) {
  const status = attendance?.attendance?.status ?? 'Not_Marked'
  const isMarked = status === 'PRESENT' || isSubmitting
  const isOnBreak = status === 'BREAK'
  const timeIn = attendance?.attendance?.timeIn

  const greeting = getGreeting()
  const firstName = userName?.split(' ')[0] || 'there'
  const currentDate = formatCurrentDate()

  // Marked state: compact strip
  if (isMarked && !isOnBreak) {
    return (
      <div ref={ref} className={cn("relative overflow-hidden rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01", className)} {...props}>
        <div className="flex items-center justify-between px-ds-06 py-ds-05b sm:px-ds-07">
          <div className="flex flex-col gap-ds-02">
            <h2 className="text-ds-2xl text-surface-fg">
              {greeting},{' '}
              <span className="font-semibold italic text-accent-11">
                {firstName}
              </span>
            </h2>
            <p className="text-ds-md text-surface-fg-subtle">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-ds-03 rounded-ds-xl bg-success-3 px-ds-05 py-ds-03">
            <div className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-success-9">
              <IconCheck className="h-ico-sm w-ico-sm text-accent-fg" />
            </div>
            <span className="text-ds-md font-semibold text-success-11">
              Marked at{' '}
              {timeIn ? formatTime(timeIn) : '--:--'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // On Break state
  if (isOnBreak) {
    return (
      <div ref={ref} className={cn("relative overflow-hidden rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01", className)} {...props}>
        <div className="flex items-center justify-between px-ds-06 py-ds-05b sm:px-ds-07">
          <div className="flex flex-col gap-ds-02">
            <h2 className="text-ds-2xl text-surface-fg">
              {greeting},{' '}
              <span className="font-semibold italic text-accent-11">
                {firstName}
              </span>
            </h2>
            <p className="text-ds-md text-surface-fg-subtle">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-ds-03 rounded-ds-xl bg-warning-3 px-ds-05 py-ds-03">
            <IconCoffee className="h-ico-sm w-ico-sm text-warning-11" />
            <span className="text-ds-md font-semibold text-warning-11">
              On break
              {attendance?.breakReason ? ` \u2014 ${attendance.breakReason}` : ''}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Unmarked + cannot mark: attendance window closed
  if (!canMarkAttendance) {
    return (
      <div ref={ref} className={cn("relative overflow-hidden rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01", className)} {...props}>
        <div className="flex items-center justify-between px-ds-06 py-ds-06 sm:px-ds-07 sm:py-ds-07">
          <div className="flex flex-col gap-ds-02b">
            <h2 className="text-ds-3xl text-surface-fg">
              {greeting},{' '}
              <span className="font-semibold italic text-accent-11">
                {firstName}
              </span>
            </h2>
            <p className="text-ds-base text-surface-fg-subtle">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-ds-03 rounded-ds-xl bg-surface-2 px-ds-05 py-ds-03">
            <IconClock className="h-ico-sm w-ico-sm text-surface-fg-subtle" />
            <span className="text-ds-md text-surface-fg-subtle">
              Attendance window closed
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Unmarked + can mark: large greeting with mark button
  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-ds-2xl border border-surface-border-strong bg-gradient-to-br from-accent-2 via-surface-1 to-success-3", className)} {...props}>
      <div className="flex items-center justify-between px-ds-06 py-ds-07 sm:px-ds-07 sm:py-ds-08">
        <div className="flex flex-col gap-ds-02b">
          <h2 className="text-ds-3xl text-surface-fg">
            {greeting},{' '}
            <span className="font-semibold italic text-accent-11">
              {firstName}
            </span>
          </h2>
          <div className="flex items-center gap-ds-03">
            <p className="text-ds-base text-surface-fg-subtle">
              {currentDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onMarkAttendance}
          disabled={isSubmitting}
          className="flex items-center gap-ds-03 rounded-ds-xl bg-accent-9 px-ds-06 py-ds-04 font-semibold text-accent-fg shadow-02 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-03 active:translate-y-0 active:scale-[0.98] disabled:opacity-action-disabled"
        >
          {isSubmitting ? 'Marking...' : 'Mark Attendance'}
          {!isSubmitting && (
            <IconArrowRight className="h-ico-sm w-ico-sm" />
          )}
        </button>
      </div>
    </div>
  )
},
)

AttendanceCTA.displayName = 'AttendanceCTA'

export { AttendanceCTA }
