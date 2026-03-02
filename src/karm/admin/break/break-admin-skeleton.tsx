'use client'

import { Skeleton } from '../../../ui/skeleton'

// ============================================================
// BreakAdminSkeleton — Loading placeholder for Break Admin page
// ============================================================

export function BreakAdminSkeleton() {
  return (
    <div className="z-[1] h-fit w-full max-w-[var(--max-width-body)] overflow-hidden border-[1px] border-[var(--color-border-subtle)] bg-[var(--color-field)] sm:rounded-[8px]">
      {/* Header Section */}
      <div className="flex items-center justify-end bg-[var(--color-field)] px-ds-06 py-ds-05b">
        <header className="flex items-center">
          <div className="flex items-center gap-ds-04">
            <Skeleton className="h-9 w-32 rounded-[6px]" />
            <Skeleton className="h-9 w-32 rounded-[6px]" />
          </div>
        </header>
      </div>

      {/* Content Section */}
      <div className="flex h-fit flex-col border-t-[1px] border-[var(--color-border-subtle)] bg-[var(--color-layer-02)] shadow-transparent">
        {/* Tabs */}
        <div className="flex w-full gap-ds-03 border-b-[1px] border-[var(--color-border-default)] px-ds-06 pt-ds-03">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table Content */}
        <div className="h-[400px] border-0 px-ds-06 py-ds-05">
          {/* Table Header */}
          <div className="mb-ds-05 ml-ds-06 grid grid-cols-6 items-center gap-ds-05 py-[10px]">
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-ds-05">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="ml-ds-06 grid grid-cols-6 items-center gap-ds-05 rounded-[var(--radius-lg)] py-ds-03"
              >
                <div className="flex items-center gap-ds-03">
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                  <Skeleton className="h-5 w-24 bg-[var(--color-field)]" />
                </div>
                <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
                <Skeleton className="h-5 w-16 bg-[var(--color-field)]" />
                <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
                <div className="flex items-center gap-ds-03">
                  <Skeleton className="h-6 w-6 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                  <Skeleton className="h-5 w-16 bg-[var(--color-field)]" />
                </div>
                <div className="flex items-center justify-end gap-ds-03">
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                  <Skeleton className="h-8 w-8 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

BreakAdminSkeleton.displayName = 'BreakAdminSkeleton'
