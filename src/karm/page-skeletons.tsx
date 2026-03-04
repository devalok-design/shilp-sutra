import * as React from 'react'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../ui/lib/utils'

const shimmer = 'bg-field'

// --- Devsabha Skeleton ---

const DevsabhaSkeleton = React.forwardRef<HTMLDivElement>(
  function DevsabhaSkeleton(_props, ref) {
  return (
    <div ref={ref} className="flex flex-col gap-ds-06">
      {/* Page header */}
      <div className="flex flex-col gap-ds-03">
        <Skeleton className={cn('h-6 w-32', shimmer)} />
        <Skeleton className={cn('h-ds-04 w-56', shimmer)} />
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
                  <Skeleton className={cn('h-ds-04 flex-1', shimmer)} />
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
                <Skeleton className={cn('h-ds-sm w-ds-sm rounded-ds-full', shimmer)} />
                <div className="flex flex-1 flex-col gap-ds-02">
                  <Skeleton className={cn('h-3 w-24', shimmer)} />
                  <Skeleton className={cn('h-ds-03 w-16', shimmer)} />
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
              <Skeleton className={cn('h-ds-sm w-24 rounded-ds-lg', shimmer)} />
            </div>
            <div className="grid grid-cols-1 gap-ds-04 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`ds-card-${i}`}
                  className="flex flex-col gap-ds-03 rounded-ds-lg border border-border p-ds-05"
                >
                  <Skeleton className={cn('h-ds-04 w-3/4', shimmer)} />
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
                  <Skeleton className={cn('h-6 w-ds-lg', shimmer)} />
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
                  <Skeleton className={cn('h-ds-03 w-20', shimmer)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
},
)

DevsabhaSkeleton.displayName = 'DevsabhaSkeleton'

// --- Bandwidth Skeleton ---

const BandwidthSkeleton = React.forwardRef<HTMLDivElement>(
  function BandwidthSkeleton(_props, ref) {
  return (
    <div ref={ref} className="flex flex-col gap-ds-06">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-ds-05 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`bw-card-${i}`}
            className="flex flex-col gap-ds-04 rounded-ds-xl border border-border bg-layer-01 p-ds-05b"
          >
            <Skeleton className={cn('h-3 w-24', shimmer)} />
            <Skeleton className={cn('h-ds-xs-plus w-16', shimmer)} />
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
              'flex items-center gap-ds-05 px-ds-05b py-ds-04',
              rowIndex < 5 && 'border-b border-border',
            )}
          >
            <div className="flex w-40 items-center gap-ds-03">
              <Skeleton className={cn('h-ds-xs-plus w-ds-xs-plus shrink-0 rounded-ds-full', shimmer)} />
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
},
)

BandwidthSkeleton.displayName = 'BandwidthSkeleton'

export { DevsabhaSkeleton, BandwidthSkeleton }
