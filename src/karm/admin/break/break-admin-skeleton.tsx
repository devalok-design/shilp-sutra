'use client'

import { Skeleton } from '../../../ui/skeleton'

// ============================================================
// BreakAdminSkeleton — Loading placeholder for Break Admin page
// ============================================================

export function BreakAdminSkeleton() {
  return (
    <div className="z-[1] h-fit w-full max-w-[var(--max-width-body)] overflow-hidden border-[1px] border-[var(--color-border-subtle)] bg-[var(--color-field)] sm:rounded-[8px]">
      {/* Header Section */}
      <div className="flex items-center justify-end bg-[var(--color-field)] px-6 py-5">
        <header className="flex items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded-[6px]" />
            <Skeleton className="h-9 w-32 rounded-[6px]" />
          </div>
        </header>
      </div>

      {/* Content Section */}
      <div className="flex h-fit flex-col border-t-[1px] border-[var(--color-border-subtle)] bg-[var(--color-layer-02)] shadow-transparent">
        {/* Tabs */}
        <div className="flex w-full gap-2 border-b-[1px] border-[var(--color-border-default)] px-6 pt-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Table Content */}
        <div className="h-[400px] border-0 px-6 py-4">
          {/* Table Header */}
          <div className="mb-4 ml-6 grid grid-cols-6 items-center gap-4 py-[10px]">
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
            <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="ml-6 grid grid-cols-6 items-center gap-4 rounded-lg py-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full bg-[var(--color-field)]" />
                  <Skeleton className="h-5 w-24 bg-[var(--color-field)]" />
                </div>
                <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
                <Skeleton className="h-5 w-16 bg-[var(--color-field)]" />
                <Skeleton className="h-5 w-full bg-[var(--color-field)]" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-[var(--color-field)]" />
                  <Skeleton className="h-5 w-16 bg-[var(--color-field)]" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-full bg-[var(--color-field)]" />
                  <Skeleton className="h-8 w-8 rounded-full bg-[var(--color-field)]" />
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
