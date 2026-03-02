import { Skeleton } from '../ui/skeleton'
import { cn } from '../ui/lib/utils'

const shimmer = 'bg-field'

// --- Dashboard Skeleton ---

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-ds-06">
      {/* Stat cards grid */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-${i}`}
            className="flex flex-col gap-ds-04 rounded-ds-xl border border-border bg-layer-01 p-ds-05b"
          >
            <div className="flex items-center justify-between">
              <Skeleton className={cn('h-3 w-20', shimmer)} />
              <Skeleton className={cn('h-8 w-8 rounded-ds-lg', shimmer)} />
            </div>
            <Skeleton className={cn('h-7 w-16', shimmer)} />
            <Skeleton className={cn('h-2.5 w-28', shimmer)} />
          </div>
        ))}
      </div>

      {/* Attendance calendar placeholder */}
      <div className="rounded-ds-xl border border-border bg-layer-01 p-ds-06">
        <div className="mb-ds-06 flex items-center justify-between">
          <Skeleton className={cn('h-5 w-32', shimmer)} />
          <div className="flex items-center gap-ds-03">
            <Skeleton className={cn('h-8 w-8 rounded-ds-lg', shimmer)} />
            <Skeleton className={cn('h-4 w-28', shimmer)} />
            <Skeleton className={cn('h-8 w-8 rounded-ds-lg', shimmer)} />
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
              className={cn('mx-auto h-10 w-10 rounded-ds-full', shimmer)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

DashboardSkeleton.displayName = 'DashboardSkeleton'

// --- Project List Skeleton ---

function ProjectListSkeleton() {
  return (
    <div className="flex flex-col gap-ds-06">
      {/* Header */}
      <div className="flex flex-col gap-ds-05 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-ds-03">
          <Skeleton className={cn('h-6 w-28', shimmer)} />
          <Skeleton className={cn('h-3.5 w-40', shimmer)} />
        </div>
        <Skeleton className={cn('h-9 w-32 rounded-ds-lg', shimmer)} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-ds-04 sm:flex-row sm:items-center">
        <Skeleton className={cn('h-9 flex-1 rounded-ds-lg', shimmer)} />
        <div className="flex gap-ds-02b">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`f-${i}`} className={cn('h-8 w-16 rounded-ds-lg', shimmer)} />
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
                    className={cn('h-7 w-7 rounded-ds-full', shimmer)}
                  />
                ))}
              </div>
              <Skeleton className={cn('h-3.5 w-10', shimmer)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

ProjectListSkeleton.displayName = 'ProjectListSkeleton'

// --- Devsabha Skeleton ---

function DevsabhaSkeleton() {
  return (
    <div className="flex flex-col gap-ds-06">
      {/* Page header */}
      <div className="flex flex-col gap-ds-03">
        <Skeleton className={cn('h-6 w-32', shimmer)} />
        <Skeleton className={cn('h-3.5 w-56', shimmer)} />
      </div>

      {/* 5-section grid */}
      <div className="grid grid-cols-1 gap-ds-05 lg:grid-cols-3">
        {/* Section 1: Main large card */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-ds-05 rounded-ds-xl border border-border bg-layer-01 p-ds-06">
            <Skeleton className={cn('h-5 w-40', shimmer)} />
            <div className="flex flex-col gap-ds-04">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`ds-main-${i}`} className="flex items-center gap-ds-04">
                  <Skeleton className={cn('h-ico-sm w-ico-sm rounded', shimmer)} />
                  <Skeleton className={cn('h-3.5 flex-1', shimmer)} />
                  <Skeleton className={cn('h-5 w-16 rounded-ds-full', shimmer)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Side card */}
        <div className="flex flex-col gap-ds-05 rounded-ds-xl border border-border bg-layer-01 p-ds-06">
          <Skeleton className={cn('h-5 w-28', shimmer)} />
          <div className="flex flex-col gap-ds-04">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`ds-side-${i}`} className="flex items-center gap-ds-04">
                <Skeleton className={cn('h-8 w-8 rounded-ds-full', shimmer)} />
                <div className="flex flex-1 flex-col gap-ds-02">
                  <Skeleton className={cn('h-3 w-24', shimmer)} />
                  <Skeleton className={cn('h-2.5 w-16', shimmer)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Full-width card */}
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-ds-05 rounded-ds-xl border border-border bg-layer-01 p-ds-06">
            <div className="flex items-center justify-between">
              <Skeleton className={cn('h-5 w-36', shimmer)} />
              <Skeleton className={cn('h-8 w-24 rounded-ds-lg', shimmer)} />
            </div>
            <div className="grid grid-cols-1 gap-ds-04 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`ds-card-${i}`}
                  className="flex flex-col gap-ds-03 rounded-ds-lg border border-border p-ds-05"
                >
                  <Skeleton className={cn('h-3.5 w-3/4', shimmer)} />
                  <Skeleton className={cn('h-3 w-full', shimmer)} />
                  <Skeleton className={cn('h-3 w-1/2', shimmer)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Stats row */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-ds-05 rounded-ds-xl border border-border bg-layer-01 p-ds-06">
            <Skeleton className={cn('h-5 w-24', shimmer)} />
            <div className="grid grid-cols-2 gap-ds-05 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`ds-stat-${i}`} className="flex flex-col gap-ds-03">
                  <Skeleton className={cn('h-3 w-16', shimmer)} />
                  <Skeleton className={cn('h-6 w-12', shimmer)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Timeline */}
        <div className="flex flex-col gap-ds-05 rounded-ds-xl border border-border bg-layer-01 p-ds-06">
          <Skeleton className={cn('h-5 w-20', shimmer)} />
          <div className="flex flex-col gap-ds-05">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`ds-time-${i}`} className="flex gap-ds-04">
                <Skeleton className={cn('h-3 w-3 shrink-0 rounded-ds-full', shimmer)} />
                <div className="flex flex-1 flex-col gap-ds-02">
                  <Skeleton className={cn('h-3 w-full', shimmer)} />
                  <Skeleton className={cn('h-2.5 w-20', shimmer)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

DevsabhaSkeleton.displayName = 'DevsabhaSkeleton'

// --- Bandwidth Skeleton ---

function BandwidthSkeleton() {
  return (
    <div className="flex flex-col gap-ds-06">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`bw-card-${i}`}
            className="flex flex-col gap-ds-04 rounded-ds-xl border border-border bg-layer-01 p-ds-05b"
          >
            <Skeleton className={cn('h-3 w-24', shimmer)} />
            <Skeleton className={cn('h-7 w-16', shimmer)} />
            <Skeleton className={cn('h-2 w-full rounded-ds-full', shimmer)} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-ds-xl border border-border">
        {/* Table header */}
        <div className="flex items-center gap-ds-05 border-b border-border bg-layer-02 px-ds-05b py-ds-04">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={`bw-th-${i}`}
              className={cn(
                'h-3',
                shimmer,
                i === 0 ? 'w-40' : 'flex-1',
              )}
            />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div
            key={`bw-row-${rowIndex}`}
            className={cn(
              'flex items-center gap-ds-05 px-ds-05b py-3.5',
              rowIndex < 5 && 'border-b border-border',
            )}
          >
            <div className="flex w-40 items-center gap-2.5">
              <Skeleton className={cn('h-7 w-7 shrink-0 rounded-ds-full', shimmer)} />
              <Skeleton className={cn('h-3 w-24', shimmer)} />
            </div>
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <Skeleton
                key={`bw-cell-${rowIndex}-${colIndex}`}
                className={cn('h-3 flex-1', shimmer)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

BandwidthSkeleton.displayName = 'BandwidthSkeleton'

// --- Task Detail Skeleton ---

function TaskDetailSkeleton() {
  return (
    <div className="flex h-full flex-col gap-0 rounded-ds-xl border border-border bg-layer-01">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-ds-05b py-ds-05">
        <Skeleton className={cn('h-5 w-48', shimmer)} />
        <div className="flex items-center gap-ds-03">
          <Skeleton className={cn('h-7 w-7 rounded-ds-lg', shimmer)} />
          <Skeleton className={cn('h-7 w-7 rounded-ds-lg', shimmer)} />
        </div>
      </div>

      {/* Property rows */}
      <div className="flex flex-col gap-0 border-b border-border px-ds-05b py-ds-05">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`prop-${i}`}
            className="flex items-center gap-ds-05 py-2.5"
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
}

TaskDetailSkeleton.displayName = 'TaskDetailSkeleton'

export {
  DashboardSkeleton,
  ProjectListSkeleton,
  DevsabhaSkeleton,
  BandwidthSkeleton,
  TaskDetailSkeleton,
}
