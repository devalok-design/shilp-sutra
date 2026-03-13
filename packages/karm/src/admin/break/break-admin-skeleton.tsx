'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import { Skeleton } from '@/ui/skeleton'

// ============================================================
// BreakAdminSkeleton — Loading placeholder for Break Admin page
// ============================================================

export const BreakAdminSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function BreakAdminSkeleton({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cn("z-base h-fit w-full max-w-layout-body overflow-hidden border-[1px] border-surface-border bg-surface-3 sm:rounded-ds-lg", className)} {...props}>
      {/* Header Section */}
      <div className="flex items-center justify-end bg-surface-3 px-ds-06 py-ds-05b">
        <header className="flex items-center">
          <div className="flex items-center gap-ds-04">
            <Skeleton className="h-ds-sm-plus w-32 rounded-ds-md" />
            <Skeleton className="h-ds-sm-plus w-32 rounded-ds-md" />
          </div>
        </header>
      </div>

      {/* Content Section */}
      <div className="flex h-fit flex-col border-t-[1px] border-surface-border bg-surface-2 shadow-transparent">
        {/* Tabs */}
        <div className="flex w-full gap-ds-03 border-b-[1px] border-surface-border-strong px-ds-06 pt-ds-03">
          <Skeleton className="h-ds-md w-20" />
          <Skeleton className="h-ds-md w-24" />
          <Skeleton className="h-ds-md w-24" />
        </div>

        {/* Table Content — h-[400px] mirrors BreakAdmin panel height */}
        <div className="h-[400px] border-0 px-ds-06 py-ds-05">
          {/* Table Header */}
          <div className="mb-ds-05 ml-ds-06 grid grid-cols-6 items-center gap-ds-05 py-ds-03">
            <Skeleton className="h-5 w-full bg-surface-3" />
            <Skeleton className="h-5 w-full bg-surface-3" />
            <Skeleton className="h-5 w-full bg-surface-3" />
            <Skeleton className="h-5 w-full bg-surface-3" />
            <Skeleton className="h-5 w-full bg-surface-3" />
            <Skeleton className="h-5 w-full bg-surface-3" />
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-ds-05">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="ml-ds-06 grid grid-cols-6 items-center gap-ds-05 rounded-ds-lg py-ds-03"
              >
                <div className="flex items-center gap-ds-03">
                  <Skeleton className="h-ds-sm w-ds-sm rounded-ds-full bg-surface-3" />
                  <Skeleton className="h-5 w-24 bg-surface-3" />
                </div>
                <Skeleton className="h-5 w-full bg-surface-3" />
                <Skeleton className="h-5 w-16 bg-surface-3" />
                <Skeleton className="h-5 w-full bg-surface-3" />
                <div className="flex items-center gap-ds-03">
                  <Skeleton className="h-ds-xs w-ds-xs rounded-ds-full bg-surface-3" />
                  <Skeleton className="h-5 w-16 bg-surface-3" />
                </div>
                <div className="flex items-center justify-end gap-ds-03">
                  <Skeleton className="h-ds-sm w-ds-sm rounded-ds-full bg-surface-3" />
                  <Skeleton className="h-ds-sm w-ds-sm rounded-ds-full bg-surface-3" />
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

BreakAdminSkeleton.displayName = 'BreakAdminSkeleton'
