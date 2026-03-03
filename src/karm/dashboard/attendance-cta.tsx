'use client'

import * as React from 'react'
import { IconCheck, IconClock, IconCoffee } from '@tabler/icons-react'

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

export interface AttendanceCTAProps {
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
      <div ref={ref} className="relative overflow-hidden rounded-ds-2xl border border-border bg-layer-01 shadow-01">
        <div className="flex items-center justify-between px-ds-06 py-ds-05b sm:px-ds-07">
          <div className="flex flex-col gap-ds-02">
            <h2 className="text-ds-2xl text-text-primary">
              {greeting},{' '}
              <span className="font-semibold italic text-interactive">
                {firstName}
              </span>
            </h2>
            <p className="text-ds-md text-text-tertiary">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-ds-03 rounded-ds-xl bg-success-surface px-ds-05 py-2.5">
            <div className="flex h-ico-md w-ico-md items-center justify-center rounded-ds-full bg-text-success">
              <IconCheck className="h-3 w-3 text-text-on-color" />
            </div>
            <span className="text-ds-md font-semibold text-text-success">
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
      <div ref={ref} className="relative overflow-hidden rounded-ds-2xl border border-border bg-layer-01 shadow-01">
        <div className="flex items-center justify-between px-ds-06 py-ds-05b sm:px-ds-07">
          <div className="flex flex-col gap-ds-02">
            <h2 className="text-ds-2xl text-text-primary">
              {greeting},{' '}
              <span className="font-semibold italic text-interactive">
                {firstName}
              </span>
            </h2>
            <p className="text-ds-md text-text-tertiary">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-ds-03 rounded-ds-xl bg-warning-surface px-ds-05 py-2.5">
            <IconCoffee className="h-ico-sm w-ico-sm text-text-warning" />
            <span className="text-ds-md font-semibold text-text-warning">
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
      <div ref={ref} className="relative overflow-hidden rounded-ds-2xl border border-border bg-layer-01 shadow-01">
        <div className="flex items-center justify-between px-ds-06 py-ds-06 sm:px-ds-07 sm:py-ds-07">
          <div className="flex flex-col gap-ds-02b">
            <h2 className="text-ds-3xl text-text-primary">
              {greeting},{' '}
              <span className="font-semibold italic text-interactive">
                {firstName}
              </span>
            </h2>
            <p className="text-ds-base text-text-tertiary">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-ds-03 rounded-ds-xl bg-layer-02 px-ds-05 py-2.5">
            <IconClock className="h-ico-sm w-ico-sm text-text-placeholder" />
            <span className="text-ds-md text-text-placeholder">
              Attendance window closed
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Unmarked + can mark: large greeting with mark button
  return (
    <div ref={ref} className="relative overflow-hidden rounded-ds-2xl border border-border bg-gradient-to-br from-interactive-subtle via-background to-success-surface">
      <div className="flex items-center justify-between px-ds-06 py-ds-07 sm:px-ds-07 sm:py-10">
        <div className="flex flex-col gap-ds-02b">
          <h2 className="text-ds-3xl text-text-primary">
            {greeting},{' '}
            <span className="font-semibold italic text-interactive">
              {firstName}
            </span>
          </h2>
          <div className="flex items-center gap-ds-03">
            <p className="text-ds-base text-text-tertiary">
              {currentDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onMarkAttendance}
          disabled={isSubmitting}
          className="flex items-center gap-2.5 rounded-ds-xl bg-interactive px-7 py-3.5 font-semibold text-text-on-color shadow-02 transition-all hover:-translate-y-0.5 hover:shadow-03 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? 'Marking...' : 'Mark Attendance'}
          {!isSubmitting && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
},
)

AttendanceCTA.displayName = 'AttendanceCTA'

export default AttendanceCTA
