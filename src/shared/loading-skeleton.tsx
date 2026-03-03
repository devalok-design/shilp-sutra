import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'

export interface CardSkeletonProps {
  className?: string
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  function CardSkeleton({ className }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-ds-lg border border-border bg-layer-01 p-ds-05b',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-ds-05">
        <Skeleton className="h-4 w-32 bg-field" />
        <Skeleton className="h-ico-sm w-ico-sm rounded bg-field" />
      </div>
      <div className="space-y-ds-04">
        <Skeleton className="h-3 w-full bg-field" />
        <Skeleton className="h-3 w-4/5 bg-field" />
        <Skeleton className="h-3 w-3/5 bg-field" />
      </div>
      <div className="flex items-center gap-ds-03 pt-ds-05">
        <Skeleton className="h-6 w-6 rounded-ds-full bg-field" />
        <Skeleton className="h-3 w-20 bg-field" />
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
  function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-ds-lg border border-border',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-ds-05 border-b border-border bg-layer-02 px-ds-05 py-ds-04">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`head-${i}`}
            className={cn(
              'h-3 bg-field',
              i === 0 ? 'w-40' : 'flex-1',
            )}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={cn(
            'flex items-center gap-ds-05 px-ds-05 py-3.5',
            rowIndex < rows - 1 && 'border-b border-border',
          )}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                'h-3 bg-field',
                colIndex === 0 ? 'w-40' : 'flex-1',
              )}
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
  function BoardSkeleton({
  columns = 4,
  cardsPerColumn = 3,
  className,
}, ref) {
  return (
    <div ref={ref} className={cn('flex gap-ds-05 overflow-x-auto', className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div
          key={`col-${colIndex}`}
          className="flex w-[272px] shrink-0 flex-col gap-2.5"
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-ds-02 py-ds-03">
            <div className="flex items-center gap-ds-03">
              <Skeleton className="h-3 w-3 rounded bg-field" />
              <Skeleton className="h-3 w-20 bg-field" />
              <Skeleton className="h-4 w-5 rounded-ds-full bg-field" />
            </div>
            <Skeleton className="h-ico-sm w-ico-sm rounded bg-field" />
          </div>

          {/* Column cards */}
          {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
            <div
              key={`card-${colIndex}-${cardIndex}`}
              className="rounded-ds-lg border border-border bg-layer-01 p-3.5"
            >
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-4/5 bg-field" />
                <Skeleton className="h-3 w-3/5 bg-field" />
              </div>
              <div className="flex items-center justify-between pt-ds-04">
                <div className="flex items-center gap-ds-02b">
                  <Skeleton className="h-ico-md w-ico-md rounded-ds-full bg-field" />
                  <Skeleton className="h-2.5 w-16 bg-field" />
                </div>
                <Skeleton className="h-4 w-12 rounded-ds-full bg-field" />
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
  function ListSkeleton({
  rows = 6,
  showAvatar = true,
  className,
}, ref) {
  return (
    <div ref={ref} className={cn('flex flex-col', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`list-${i}`}
          className={cn(
            'flex items-center gap-ds-04 py-ds-04',
            i < rows - 1 && 'border-b border-border',
          )}
        >
          {showAvatar && (
            <Skeleton className="h-8 w-8 shrink-0 rounded-ds-full bg-field" />
          )}
          <div className="flex flex-1 flex-col gap-ds-02b">
            <Skeleton className="h-3 w-2/5 bg-field" />
            <Skeleton className="h-2.5 w-3/5 bg-field" />
          </div>
          <Skeleton className="h-5 w-14 rounded-ds-full bg-field" />
        </div>
      ))}
    </div>
  )
},
)

ListSkeleton.displayName = 'ListSkeleton'

export { CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton }
