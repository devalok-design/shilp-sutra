// @server-safe
import * as React from 'react'

import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'

// role=status + aria-busy so AT announces the loading region (child Skeletons are
// aria-hidden). The sr-only label carries the announcement text.
function statusProps(label?: string) {
  return { role: 'status' as const, 'aria-busy': true, 'aria-label': label ?? 'Loading' }
}
function SrLabel({ label }: { label?: string }) {
  return <span className="sr-only">{label ?? 'Loading'}…</span>
}

// --- Dashboard Skeleton ---

export interface DashboardSkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Accessible label for the loading region. @default 'Loading' */
  label?: string
}

const DashboardSkeleton = React.forwardRef<HTMLDivElement, DashboardSkeletonProps>(
  function DashboardSkeleton({ className, label, ...props }, ref) {
  return (
    <div ref={ref} {...statusProps(label)} {...props} className={cn("flex flex-col gap-ds-06", className)}>
      <SrLabel label={label} />
      {/* Stat cards grid */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-${i}`}
            className="flex flex-col gap-ds-04 rounded-surface border border-card bg-surface-raised p-ds-05b"
          >
            <div className="flex items-center justify-between">
              <Skeleton className={'h-ds-04 w-ds-11'} />
              <Skeleton className={'h-ds-sm w-ds-sm rounded-surface'} />
            </div>
            <Skeleton className={'h-ds-xs-plus w-ds-10'} />
            <Skeleton className={'h-ds-03 w-[112px]'} />
          </div>
        ))}
      </div>

      {/* Attendance calendar placeholder */}
      <div className="rounded-surface border border-card bg-surface-raised p-ds-06">
        <div className="mb-ds-06 flex items-center justify-between">
          <Skeleton className={'h-ds-05b w-[128px]'} />
          <div className="flex items-center gap-ds-03">
            <Skeleton className={'h-ds-sm w-ds-sm rounded-surface'} />
            <Skeleton className={'h-ds-05 w-[112px]'} />
            <Skeleton className={'h-ds-sm w-ds-sm rounded-surface'} />
          </div>
        </div>
        {/* Weekday headers */}
        <div className="mb-ds-03 grid grid-cols-7 gap-ds-03">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`wh-${i}`} className={'mx-auto h-ds-04 w-ds-07'} />
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-ds-03">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton
              key={`cal-${i}`}
              className={'mx-auto h-ds-md w-ds-md rounded-pill'}
            />
          ))}
        </div>
      </div>
    </div>
  )
},
)

DashboardSkeleton.displayName = 'DashboardSkeleton'

// --- Project List Skeleton ---

export interface ProjectListSkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Accessible label for the loading region. @default 'Loading' */
  label?: string
}

const ProjectListSkeleton = React.forwardRef<HTMLDivElement, ProjectListSkeletonProps>(
  function ProjectListSkeleton({ className, label, ...props }, ref) {
  return (
    <div ref={ref} {...statusProps(label)} {...props} className={cn("flex flex-col gap-ds-06", className)}>
      <SrLabel label={label} />
      {/* Header */}
      <div className="flex flex-col gap-ds-05 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-ds-03">
          <Skeleton className={'h-ds-06 w-[112px]'} />
          <Skeleton className={'h-ds-04 w-ds-13'} />
        </div>
        <Skeleton className={'h-ds-sm-plus w-[128px] rounded-surface'} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-ds-04 sm:flex-row sm:items-center">
        <Skeleton className={'h-ds-sm-plus flex-1 rounded-surface'} />
        <div className="flex gap-ds-02b">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`f-${i}`} className={'h-ds-sm w-ds-10 rounded-surface'} />
          ))}
        </div>
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`proj-${i}`}
            className="flex flex-col gap-ds-05 rounded-surface border border-card bg-surface-raised p-ds-05b"
          >
            {/* Top row: status + org */}
            <div className="flex items-center justify-between">
              <Skeleton className={'h-ds-05b w-ds-10 rounded-pill'} />
              <Skeleton className={'h-ds-05 w-ds-11 rounded-control'} />
            </div>
            {/* Title + description */}
            <div className="flex flex-col gap-ds-03">
              <Skeleton className={'h-ds-05 w-3/4'} />
              <Skeleton className={'h-ds-04 w-full'} />
              <Skeleton className={'h-ds-04 w-2/3'} />
            </div>
            {/* Bottom row: members + count */}
            <div className="flex items-center justify-between pt-ds-02">
              <div className="flex -space-x-ds-03">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton
                    key={`av-${i}-${j}`}
                    className={'h-ds-xs-plus w-ds-xs-plus rounded-pill'}
                  />
                ))}
              </div>
              <Skeleton className={'h-ds-04 w-ds-md'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
},
)

ProjectListSkeleton.displayName = 'ProjectListSkeleton'

// --- Task Detail Skeleton ---

export interface TaskDetailSkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Accessible label for the loading region. @default 'Loading' */
  label?: string
}

const TaskDetailSkeleton = React.forwardRef<HTMLDivElement, TaskDetailSkeletonProps>(
  function TaskDetailSkeleton({ className, label, ...props }, ref) {
  return (
    <div ref={ref} {...statusProps(label)} {...props} className={cn("flex h-full flex-col gap-0 rounded-surface border border-card bg-surface-raised", className)}>
      <SrLabel label={label} />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border-strong px-ds-05b py-ds-05">
        <Skeleton className={'h-ds-05b w-[192px]'} />
        <div className="flex items-center gap-ds-03">
          <Skeleton className={'h-ds-xs-plus w-ds-xs-plus rounded-surface'} />
          <Skeleton className={'h-ds-xs-plus w-ds-xs-plus rounded-surface'} />
        </div>
      </div>

      {/* Property rows */}
      <div className="flex flex-col gap-0 border-b border-surface-border-strong px-ds-05b py-ds-05">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`prop-${i}`}
            className="flex items-center gap-ds-05 py-ds-03"
          >
            <Skeleton className={'h-ds-04 w-ds-12 shrink-0'} />
            <Skeleton className={'h-ds-06 w-[128px] rounded-control'} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-border-strong px-ds-05b">
        <div className="flex gap-ds-05 py-ds-04">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`tab-${i}`} className={'h-ds-05 w-ds-10'} />
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col gap-ds-04 px-ds-05b py-ds-05">
        <Skeleton className={'h-ds-04 w-full'} />
        <Skeleton className={'h-ds-04 w-4/5'} />
        <Skeleton className={'h-ds-04 w-3/5'} />
        <Skeleton className={'mt-ds-03 h-ds-04 w-full'} />
        <Skeleton className={'h-ds-04 w-2/3'} />
      </div>
    </div>
  )
},
)

TaskDetailSkeleton.displayName = 'TaskDetailSkeleton'

export {
  DashboardSkeleton,
  ProjectListSkeleton,
  TaskDetailSkeleton,
}
