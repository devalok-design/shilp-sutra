// @server-safe
import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'

export interface CardSkeletonProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  function CardSkeleton({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        'rounded-ds-lg border border-surface-border-strong bg-surface-raised p-ds-05b',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-ds-05">
        <Skeleton className="h-[16px] w-[128px] bg-surface-raised-hover" />
        <Skeleton className="h-ico-sm w-ico-sm rounded bg-surface-raised-hover" />
      </div>
      <div className="space-y-ds-04">
        <Skeleton className="h-[12px] w-full bg-surface-raised-hover" />
        <Skeleton className="h-[12px] w-4/5 bg-surface-raised-hover" />
        <Skeleton className="h-[12px] w-3/5 bg-surface-raised-hover" />
      </div>
      <div className="flex items-center gap-ds-03 pt-ds-05">
        <Skeleton className="h-ds-xs w-ds-xs rounded-ds-full bg-surface-raised-hover" />
        <Skeleton className="h-[12px] w-[80px] bg-surface-raised-hover" />
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
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        'overflow-hidden rounded-ds-lg border border-surface-border-strong',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-ds-05 border-b border-surface-border-strong bg-surface-raised px-ds-05 py-ds-04">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`head-${i}`}
            className={cn(
              'h-[12px] bg-surface-raised-hover',
              i === 0 ? 'w-[160px]' : 'flex-1',
            )}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={cn(
            'flex items-center gap-ds-05 px-ds-05 py-ds-04',
            rowIndex < rows - 1 && 'border-b border-surface-border-strong',
          )}
          style={{ animationDelay: `${rowIndex * 50}ms` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                'h-[12px] bg-surface-raised-hover',
                colIndex === 0 ? 'w-[160px]' : 'flex-1',
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
  ...props
}, ref) {
  return (
    <div ref={ref} {...props} className={cn('flex gap-ds-05 overflow-x-auto', className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div
          key={`col-${colIndex}`}
          className="flex w-[272px] shrink-0 flex-col gap-ds-03"
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-ds-02 py-ds-03">
            <div className="flex items-center gap-ds-03">
              <Skeleton className="h-[12px] w-[12px] rounded bg-surface-raised-hover" />
              <Skeleton className="h-[12px] w-[80px] bg-surface-raised-hover" />
              <Skeleton className="h-[16px] w-[20px] rounded-ds-full bg-surface-raised-hover" />
            </div>
            <Skeleton className="h-ico-sm w-ico-sm rounded bg-surface-raised-hover" />
          </div>

          {/* Column cards */}
          {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
            <div
              key={`card-${colIndex}-${cardIndex}`}
              className="rounded-ds-lg border border-surface-border-strong bg-surface-raised p-ds-04"
              style={{ animationDelay: `${(colIndex * cardsPerColumn + cardIndex) * 50}ms` }}
            >
              <div className="space-y-ds-03">
                <Skeleton className="h-[12px] w-4/5 bg-surface-raised-hover" />
                <Skeleton className="h-[12px] w-3/5 bg-surface-raised-hover" />
              </div>
              <div className="flex items-center justify-between pt-ds-04">
                <div className="flex items-center gap-ds-02b">
                  <Skeleton className="h-ico-md w-ico-md rounded-ds-full bg-surface-raised-hover" />
                  <Skeleton className="h-ds-03 w-[64px] bg-surface-raised-hover" />
                </div>
                <Skeleton className="h-[16px] w-ds-lg rounded-ds-full bg-surface-raised-hover" />
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
  ...props
}, ref) {
  return (
    <div ref={ref} {...props} className={cn('flex flex-col', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`list-${i}`}
          className={cn(
            'flex items-center gap-ds-04 py-ds-04',
            i < rows - 1 && 'border-b border-surface-border-strong',
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {showAvatar && (
            <Skeleton className="h-ds-sm w-ds-sm shrink-0 rounded-ds-full bg-surface-raised-hover" />
          )}
          <div className="flex flex-1 flex-col gap-ds-02b">
            <Skeleton className="h-[12px] w-2/5 bg-surface-raised-hover" />
            <Skeleton className="h-ds-03 w-3/5 bg-surface-raised-hover" />
          </div>
          <Skeleton className="h-[20px] w-[56px] rounded-ds-full bg-surface-raised-hover" />
        </div>
      ))}
    </div>
  )
},
)

ListSkeleton.displayName = 'ListSkeleton'

export { CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton }
