import * as React from 'react'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../ui/lib/utils'

const shimmer = 'bg-field'

// --- Dashboard Skeleton ---

const DashboardSkeleton = React.forwardRef<HTMLDivElement>(
  function DashboardSkeleton(_props, ref) {
  return (
    <div ref={ref} className="flex flex-col gap-ds-06">
      {/* Stat cards grid */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-${i}`}
            className="flex flex-col gap-ds-04 rounded-ds-xl border border-border bg-layer-01 p-ds-05b"
          >
            <div className="flex items-center justify-between">
              <Skeleton className={cn('h-3 w-20', shimmer)} />
              <Skeleton className={cn('h-ds-sm w-ds-sm rounded-ds-lg', shimmer)} />
            </div>
            <Skeleton className={cn('h-ds-xs-plus w-16', shimmer)} />
            <Skeleton className={cn('h-2.5 w-28', shimmer)} />
          </div>
        ))}
      </div>

      {/* Attendance calendar placeholder */}
      <div className="rounded-ds-xl border border-border bg-layer-01 p-ds-06">
        <div className="mb-ds-06 flex items-center justify-between">
          <Skeleton className={cn('h-5 w-32', shimmer)} />
          <div className="flex items-center gap-ds-03">
            <Skeleton className={cn('h-ds-sm w-ds-sm rounded-ds-lg', shimmer)} />
            <Skeleton className={cn('h-4 w-28', shimmer)} />
            <Skeleton className={cn('h-ds-sm w-ds-sm rounded-ds-lg', shimmer)} />
          </div>
        </div>
        {/* Weekday headers */}
        <div className="mb-ds-03 grid grid-cols-7 gap-ds-03">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`wh-${i}`} className={cn('mx-auto h-3 w-8', shimmer)} />
          ))}
        </div>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-ds-03">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton
              key={`cal-${i}`}
              className={cn('mx-auto h-ds-md w-ds-md rounded-ds-full', shimmer)}
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

const ProjectListSkeleton = React.forwardRef<HTMLDivElement>(
  function ProjectListSkeleton(_props, ref) {
  return (
    <div ref={ref} className="flex flex-col gap-ds-06">
      {/* Header */}
      <div className="flex flex-col gap-ds-05 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-ds-03">
          <Skeleton className={cn('h-6 w-28', shimmer)} />
          <Skeleton className={cn('h-3.5 w-40', shimmer)} />
        </div>
        <Skeleton className={cn('h-ds-sm-plus w-32 rounded-ds-lg', shimmer)} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-ds-04 sm:flex-row sm:items-center">
        <Skeleton className={cn('h-ds-sm-plus flex-1 rounded-ds-lg', shimmer)} />
        <div className="flex gap-ds-02b">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`f-${i}`} className={cn('h-ds-sm w-16 rounded-ds-lg', shimmer)} />
          ))}
        </div>
      </div>

      {/* Project cards grid */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`proj-${i}`}
            className="flex flex-col gap-ds-05 rounded-ds-xl border border-border bg-layer-01 p-ds-05b"
          >
            {/* Top row: status + org */}
            <div className="flex items-center justify-between">
              <Skeleton className={cn('h-5 w-16 rounded-ds-full', shimmer)} />
              <Skeleton className={cn('h-4 w-20 rounded-ds-md', shimmer)} />
            </div>
            {/* Title + description */}
            <div className="flex flex-col gap-ds-03">
              <Skeleton className={cn('h-4 w-3/4', shimmer)} />
              <Skeleton className={cn('h-3 w-full', shimmer)} />
              <Skeleton className={cn('h-3 w-2/3', shimmer)} />
            </div>
            {/* Bottom row: members + count */}
            <div className="flex items-center justify-between pt-ds-02">
              <div className="flex -space-x-ds-03">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton
                    key={`av-${i}-${j}`}
                    className={cn('h-ds-xs-plus w-ds-xs-plus rounded-ds-full', shimmer)}
                  />
                ))}
              </div>
              <Skeleton className={cn('h-ds-04 w-ds-md', shimmer)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
},
)

ProjectListSkeleton.displayName = 'ProjectListSkeleton'

/** @deprecated Import from karm/ instead */
// eslint-disable-next-line no-restricted-imports -- intentional deprecated re-export shim
export { DevsabhaSkeleton, BandwidthSkeleton } from '../karm/page-skeletons'

// --- Task Detail Skeleton ---

const TaskDetailSkeleton = React.forwardRef<HTMLDivElement>(
  function TaskDetailSkeleton(_props, ref) {
  return (
    <div ref={ref} className="flex h-full flex-col gap-0 rounded-ds-xl border border-border bg-layer-01">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-ds-05b py-ds-05">
        <Skeleton className={cn('h-5 w-48', shimmer)} />
        <div className="flex items-center gap-ds-03">
          <Skeleton className={cn('h-ds-xs-plus w-ds-xs-plus rounded-ds-lg', shimmer)} />
          <Skeleton className={cn('h-ds-xs-plus w-ds-xs-plus rounded-ds-lg', shimmer)} />
        </div>
      </div>

      {/* Property rows */}
      <div className="flex flex-col gap-0 border-b border-border px-ds-05b py-ds-05">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`prop-${i}`}
            className="flex items-center gap-ds-05 py-ds-03"
          >
            <Skeleton className={cn('h-3 w-24 shrink-0', shimmer)} />
            <Skeleton className={cn('h-6 w-32 rounded-ds-md', shimmer)} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-ds-05b">
        <div className="flex gap-ds-05 py-ds-04">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`tab-${i}`} className={cn('h-4 w-16', shimmer)} />
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex flex-1 flex-col gap-ds-04 px-ds-05b py-ds-05">
        <Skeleton className={cn('h-3 w-full', shimmer)} />
        <Skeleton className={cn('h-3 w-4/5', shimmer)} />
        <Skeleton className={cn('h-3 w-3/5', shimmer)} />
        <Skeleton className={cn('mt-ds-03 h-3 w-full', shimmer)} />
        <Skeleton className={cn('h-3 w-2/3', shimmer)} />
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
