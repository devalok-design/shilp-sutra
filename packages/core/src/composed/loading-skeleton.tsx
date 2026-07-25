// @server-safe
import * as React from 'react'

import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'

// Non-negative integer count (guards Array.from against NaN / negatives → RangeError).
const clamp = (n: number | undefined, fallback: number) =>
  Math.max(0, Math.floor(typeof n === 'number' && !Number.isNaN(n) ? n : fallback))

// role=status + aria-busy so AT announces the loading region (child Skeletons are
// aria-hidden). sr-only label gives the announcement text.
function statusProps(label?: string) {
  return { role: 'status' as const, 'aria-busy': true, 'aria-label': label ?? 'Loading' }
}
function SrLabel({ label }: { label?: string }) {
  return <span className="sr-only">{label ?? 'Loading'}…</span>
}

export interface CardSkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string
  /** Accessible label for the loading region. @default 'Loading' */
  label?: string
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  function CardSkeleton({ className, label, ...props }, ref) {
    return (
      <div
        ref={ref}
        {...statusProps(label)}
        {...props}
        className={cn('rounded-surface border border-card bg-surface-raised p-ds-05b', className)}
      >
        <SrLabel label={label} />
        <div className="flex items-center justify-between pb-ds-05">
          <Skeleton className="h-ds-05 w-ds-13" />
          <Skeleton className="h-ico-sm w-ico-sm rounded" />
        </div>
        <div className="space-y-ds-04">
          <Skeleton className="h-ds-04 w-full" />
          <Skeleton className="h-ds-04 w-4/5" />
          <Skeleton className="h-ds-04 w-3/5" />
        </div>
        <div className="flex items-center gap-ds-03 pt-ds-05">
          <Skeleton className="h-ds-xs w-ds-xs rounded-pill" />
          <Skeleton className="h-ds-04 w-ds-11" />
        </div>
      </div>
    )
  },
)
CardSkeleton.displayName = 'CardSkeleton'

export interface TableSkeletonProps extends CardSkeletonProps {
  rows?: number
  columns?: number
}

const TableSkeleton = React.forwardRef<HTMLDivElement, TableSkeletonProps>(
  function TableSkeleton({ rows = 5, columns = 4, className, label, ...props }, ref) {
    const r = clamp(rows, 5)
    const c = Math.max(1, clamp(columns, 4))
    return (
      <div
        ref={ref}
        {...statusProps(label)}
        {...props}
        className={cn('overflow-hidden rounded-surface border border-card', className)}
      >
        <SrLabel label={label} />
        {/* Header */}
        <div className="flex items-center gap-ds-05 border-b border-surface-border-strong bg-surface-raised px-ds-05 py-ds-04">
          {Array.from({ length: c }).map((_, i) => (
            <Skeleton key={`head-${i}`} className={cn('h-ds-04', i === 0 ? 'w-ds-13' : 'flex-1')} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: r }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={cn(
              'flex items-center gap-ds-05 px-ds-05 py-ds-04',
              rowIndex < r - 1 && 'border-b border-surface-border-strong',
            )}
          >
            {Array.from({ length: c }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn('h-ds-04', colIndex === 0 ? 'w-ds-13' : 'flex-1')}
              />
            ))}
          </div>
        ))}
      </div>
    )
  },
)
TableSkeleton.displayName = 'TableSkeleton'

export interface BoardSkeletonProps extends CardSkeletonProps {
  columns?: number
  cardsPerColumn?: number
}

const BoardSkeleton = React.forwardRef<HTMLDivElement, BoardSkeletonProps>(
  function BoardSkeleton({ columns = 4, cardsPerColumn = 3, className, label, ...props }, ref) {
    const c = clamp(columns, 4)
    const cards = clamp(cardsPerColumn, 3)
    return (
      <div ref={ref} {...statusProps(label)} {...props} className={cn('flex gap-ds-05 overflow-x-auto', className)}>
        <SrLabel label={label} />
        {Array.from({ length: c }).map((_, colIndex) => (
          <div key={`col-${colIndex}`} className="flex w-[272px] shrink-0 flex-col gap-ds-03">
            {/* Column header */}
            <div className="flex items-center justify-between px-ds-02 py-ds-03">
              <div className="flex items-center gap-ds-03">
                <Skeleton className="h-ds-04 w-ds-04 rounded" />
                <Skeleton className="h-ds-04 w-ds-11" />
                <Skeleton className="h-ds-05 w-ds-05b rounded-pill" />
              </div>
              <Skeleton className="h-ico-sm w-ico-sm rounded" />
            </div>
            {/* Column cards */}
            {Array.from({ length: cards }).map((_, cardIndex) => (
              <div
                key={`card-${colIndex}-${cardIndex}`}
                className="rounded-surface border border-card bg-surface-raised p-ds-04"
              >
                <div className="space-y-ds-03">
                  <Skeleton className="h-ds-04 w-4/5" />
                  <Skeleton className="h-ds-04 w-3/5" />
                </div>
                <div className="flex items-center justify-between pt-ds-04">
                  <div className="flex items-center gap-ds-02b">
                    <Skeleton className="h-ico-md w-ico-md rounded-pill" />
                    <Skeleton className="h-ds-03 w-ds-10" />
                  </div>
                  <Skeleton className="h-ds-05 w-ds-lg rounded-pill" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  },
)
BoardSkeleton.displayName = 'BoardSkeleton'

export interface ListSkeletonProps extends CardSkeletonProps {
  rows?: number
  showAvatar?: boolean
}

const ListSkeleton = React.forwardRef<HTMLDivElement, ListSkeletonProps>(
  function ListSkeleton({ rows = 6, showAvatar = true, className, label, ...props }, ref) {
    const r = clamp(rows, 6)
    return (
      <div ref={ref} {...statusProps(label)} {...props} className={cn('flex flex-col', className)}>
        <SrLabel label={label} />
        {Array.from({ length: r }).map((_, i) => (
          <div
            key={`list-${i}`}
            className={cn(
              'flex items-center gap-ds-04 py-ds-04',
              i < r - 1 && 'border-b border-surface-border-strong',
            )}
          >
            {showAvatar && <Skeleton className="h-ds-sm w-ds-sm shrink-0 rounded-pill" />}
            <div className="flex flex-1 flex-col gap-ds-02b">
              <Skeleton className="h-ds-04 w-2/5" />
              <Skeleton className="h-ds-03 w-3/5" />
            </div>
            <Skeleton className="h-ds-05b w-ds-09 rounded-pill" />
          </div>
        ))}
      </div>
    )
  },
)
ListSkeleton.displayName = 'ListSkeleton'

export { BoardSkeleton, CardSkeleton, ListSkeleton, TableSkeleton }
