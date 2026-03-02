'use client'

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

interface AttendanceCTAProps {
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

export default function AttendanceCTA({
  userName,
  attendance,
  canMarkAttendance,
  onMarkAttendance,
  isSubmitting = false,
  formatTime = defaultFormatTime,
}: AttendanceCTAProps) {
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
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)]">
        <div className="flex items-center justify-between px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-1">
            <h2 className="T5-Reg text-[var(--color-text-primary)]">
              {greeting},{' '}
              <span className="font-semibold italic text-[var(--color-interactive)]">
                {firstName}
              </span>
            </h2>
            <p className="B2-Reg text-[var(--color-text-tertiary)]">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-success-surface)] px-4 py-2.5">
            <div className="flex h-[var(--icon-md)] w-[var(--icon-md)] items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-text-success)]">
              <IconCheck className="h-3 w-3 text-[var(--color-text-on-color)]" />
            </div>
            <span className="B2-Reg font-semibold text-[var(--color-text-success)]">
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
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)]">
        <div className="flex items-center justify-between px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-1">
            <h2 className="T5-Reg text-[var(--color-text-primary)]">
              {greeting},{' '}
              <span className="font-semibold italic text-[var(--color-interactive)]">
                {firstName}
              </span>
            </h2>
            <p className="B2-Reg text-[var(--color-text-tertiary)]">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-warning-surface)] px-4 py-2.5">
            <IconCoffee className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-warning)]" />
            <span className="B2-Reg font-semibold text-[var(--color-text-warning)]">
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
      <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)]">
        <div className="flex items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="T4-Reg text-[var(--color-text-primary)]">
              {greeting},{' '}
              <span className="font-semibold italic text-[var(--color-interactive)]">
                {firstName}
              </span>
            </h2>
            <p className="B1-Reg text-[var(--color-text-tertiary)]">
              {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-xl)] bg-[var(--color-layer-02)] px-4 py-2.5">
            <IconClock className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]" />
            <span className="B2-Reg text-[var(--color-text-placeholder)]">
              Attendance window closed
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Unmarked + can mark: large greeting with mark button
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-gradient-to-br from-[var(--color-interactive-subtle)] via-[var(--color-background)] to-[var(--color-success-surface)]">
      <div className="flex items-center justify-between px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-1.5">
          <h2 className="T4-Reg text-[var(--color-text-primary)]">
            {greeting},{' '}
            <span className="font-semibold italic text-[var(--color-interactive)]">
              {firstName}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <p className="B1-Reg text-[var(--color-text-tertiary)]">
              {currentDate}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onMarkAttendance}
          disabled={isSubmitting}
          className="flex items-center gap-2.5 rounded-[var(--radius-xl)] bg-[var(--color-interactive)] px-7 py-3.5 font-semibold text-[var(--color-text-on-color)] shadow-02 transition-all hover:-translate-y-0.5 hover:shadow-03 active:translate-y-0 active:scale-[0.98] disabled:opacity-50"
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
}
