'use client'

// ============================================================
// AttendanceOverview — Grouped attendance display (no associate selected)
// Extracted from admin-dashboard.tsx
// ============================================================

import * as React from 'react'
import { useRef, useState, useCallback } from 'react'
import { cn } from '@/ui/lib/utils'
import { AvatarGroup } from '@/composed/avatar-group'
import type {
  AdminUser,
  AttendanceRecord,
  AttendanceStatus,
  GroupedAttendance,
} from '../types'

// ============================================================
// Types
// ============================================================

export interface AttendanceOverviewProps {
  isFutureDate: boolean
  users: AdminUser[]
  groupedAttendance: GroupedAttendance | null
  userImages: Record<string, string>
  selectedDate: string
}

// ============================================================
// Helpers
// ============================================================

function onBreakGroup(
  allUsers: AdminUser[],
  attendances: AttendanceRecord[],
  date: string | Date,
) {
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
// Component
// ============================================================

export const AttendanceOverview = React.forwardRef<HTMLDivElement, AttendanceOverviewProps>(
  function AttendanceOverview({
  isFutureDate,
  users,
  groupedAttendance,
  userImages,
  selectedDate,
}, forwardedRef) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    scrollContainerRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
  }, [forwardedRef])
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

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

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-to-scroll UX enhancement on scrollable container
    <div
      ref={mergedRef}
      className="hide-scrollbar w-full cursor-grab overflow-x-auto active:cursor-grabbing max-md:pb-ds-05"
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
        className="flex items-start justify-start gap-ds-04 px-0 pt-ds-03 md:gap-0 md:px-ds-06 min-w-max"
      >
        {isFutureDate ? (
          <div className="min-h-28">
            {users &&
              Object.entries(
                onBreakGroup(
                  users,
                  [] as AttendanceRecord[],
                  selectedDate,
                ),
              )?.map(([status, breakUsers]) => {
                const usersList = breakUsers as AdminUser[]
                return (
                  <div
                    key={status}
                    className="flex w-full flex-col gap-ds-04 rounded-ds-md bg-layer-02 p-ds-06 md:rounded-ds-lg"
                  >
                    {usersList?.length > 0 && (
                      <h2 className="text-ds-sm font-semibold uppercase tracking-wider capitalize text-text-tertiary">
                        {`On Break (${usersList?.length || 0})`}
                      </h2>
                    )}
                    <div className="flex w-full flex-wrap items-center">
                      {usersList?.length > 0 && (
                        <AvatarGroup
                          users={usersList?.map((user) => ({
                            image: userImages[user.id],
                            name: user.name || 'User',
                          }))}
                          max={4}
                          showTooltip={false}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          Object.entries(groupedAttendance || {}).map(
            ([status, groupUsers]) => (
              <div
                key={status}
                className={cn('flex w-full flex-col gap-ds-04 rounded-ds-md bg-layer-02 p-ds-06 md:rounded-ds-lg md:p-ds-05', status !== 'yetToMark' ? 'border-r border-border' : '', 'max-md:border-0 max-md:p-ds-05', 'min-w-[200px]')}
              >
                <h2 className="text-ds-sm font-semibold uppercase tracking-wider capitalize text-text-tertiary">
                  {status === 'yetToMark'
                    ? 'Yet to Mark'
                    : status
                        .replace(/([A-Z])/g, ' $1')
                        .toLowerCase()}{' '}
                  ({(groupUsers as Array<{ user: AdminUser }>).length})
                </h2>
                <div className="flex cursor-pointer flex-wrap items-center">
                  <AvatarGroup
                    users={(groupUsers as Array<{ user: AdminUser }>).map(
                      ({ user }) => ({
                        image: userImages[user.id],
                        name: user.name,
                      }),
                    )}
                    max={4}
                    showTooltip={false}
                  />
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  )
},
)

AttendanceOverview.displayName = 'AttendanceOverview'
