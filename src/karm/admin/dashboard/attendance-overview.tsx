'use client'

// ============================================================
// AttendanceOverview — Grouped attendance display (no associate selected)
// Extracted from admin-dashboard.tsx
// ============================================================

import * as React from 'react'
import { useRef, useState } from 'react'
import { AvatarStack } from '../../../ui/avatar-stack'
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

export function AttendanceOverview({
  isFutureDate,
  users,
  groupedAttendance,
  userImages,
  selectedDate,
}: AttendanceOverviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
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
                    className="flex w-full flex-col gap-[12px] rounded-[var(--radius-md)] bg-[var(--color-layer-02)] p-[24px] md:rounded-[var(--radius-lg)]"
                  >
                    {usersList?.length > 0 && (
                      <h2 className="L3 capitalize text-[var(--color-text-tertiary)]">
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
            ([status, groupUsers]) => (
              <div
                key={status}
                className={`flex w-full flex-col gap-3 rounded-[var(--radius-md)] bg-[var(--color-layer-02)] p-6 md:rounded-[var(--radius-lg)] md:p-4 ${
                  status !== 'yetToMark'
                    ? 'border-r border-[var(--color-border-default)]'
                    : ''
                } max-md:border-0 max-md:p-[16px]`}
                style={{ minWidth: '200px' }}
              >
                <h2 className="L3 capitalize text-[var(--color-text-tertiary)]">
                  {status === 'yetToMark'
                    ? 'Yet to Mark'
                    : status
                        .replace(/([A-Z])/g, ' $1')
                        .toLowerCase()}{' '}
                  ({(groupUsers as any[]).length})
                </h2>
                <div className="flex cursor-pointer flex-wrap items-center">
                  <AvatarStack
                    avatars={(groupUsers as any[]).map(
                      ({ user }: any) => ({
                        src: userImages[user.id],
                        alt: `${user.name}'s avatar`,
                        fallback: user.name.charAt(0),
                        name: user.name,
                      }),
                    )}
                    maxAvatars={4}
                  />
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  )
}

AttendanceOverview.displayName = 'AttendanceOverview'
