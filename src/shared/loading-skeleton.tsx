import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'

interface SkeletonProps {
  className?: string
}

function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-4">
        <Skeleton className="h-4 w-32 bg-[var(--color-field)]" />
        <Skeleton className="h-[var(--icon-sm)] w-[var(--icon-sm)] rounded bg-[var(--color-field)]" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full bg-[var(--color-field)]" />
        <Skeleton className="h-3 w-4/5 bg-[var(--color-field)]" />
        <Skeleton className="h-3 w-3/5 bg-[var(--color-field)]" />
      </div>
      <div className="flex items-center gap-2 pt-4">
        <Skeleton className="h-6 w-6 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
        <Skeleton className="h-3 w-20 bg-[var(--color-field)]" />
      </div>
    </div>
  )
}

CardSkeleton.displayName = 'CardSkeleton'

interface TableSkeletonProps extends SkeletonProps {
  rows?: number
  columns?: number
}

function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-default)]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--color-border-default)] bg-[var(--color-layer-02)] px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`head-${i}`}
            className={cn(
              'h-3 bg-[var(--color-field)]',
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
            'flex items-center gap-4 px-4 py-3.5',
            rowIndex < rows - 1 && 'border-b border-[var(--color-border-default)]',
          )}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                'h-3 bg-[var(--color-field)]',
                colIndex === 0 ? 'w-40' : 'flex-1',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

TableSkeleton.displayName = 'TableSkeleton'

interface BoardSkeletonProps extends SkeletonProps {
  columns?: number
  cardsPerColumn?: number
}

function BoardSkeleton({
  columns = 4,
  cardsPerColumn = 3,
  className,
}: BoardSkeletonProps) {
  return (
    <div className={cn('flex gap-4 overflow-x-auto', className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div
          key={`col-${colIndex}`}
          className="flex w-[272px] shrink-0 flex-col gap-2.5"
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-1 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded bg-[var(--color-field)]" />
              <Skeleton className="h-3 w-20 bg-[var(--color-field)]" />
              <Skeleton className="h-4 w-5 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
            </div>
            <Skeleton className="h-[var(--icon-sm)] w-[var(--icon-sm)] rounded bg-[var(--color-field)]" />
          </div>

          {/* Column cards */}
          {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
            <div
              key={`card-${colIndex}-${cardIndex}`}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-3.5"
            >
              <div className="space-y-2.5">
                <Skeleton className="h-3 w-4/5 bg-[var(--color-field)]" />
                <Skeleton className="h-3 w-3/5 bg-[var(--color-field)]" />
              </div>
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-[var(--icon-md)] w-[var(--icon-md)] rounded-[var(--radius-full)] bg-[var(--color-field)]" />
                  <Skeleton className="h-2.5 w-16 bg-[var(--color-field)]" />
                </div>
                <Skeleton className="h-4 w-12 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

BoardSkeleton.displayName = 'BoardSkeleton'

interface ListSkeletonProps extends SkeletonProps {
  rows?: number
  showAvatar?: boolean
}

function ListSkeleton({
  rows = 6,
  showAvatar = true,
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={`list-${i}`}
          className={cn(
            'flex items-center gap-3 py-3',
            i < rows - 1 && 'border-b border-[var(--color-border-default)]',
          )}
        >
          {showAvatar && (
            <Skeleton className="h-8 w-8 shrink-0 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
          )}
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-2/5 bg-[var(--color-field)]" />
            <Skeleton className="h-2.5 w-3/5 bg-[var(--color-field)]" />
          </div>
          <Skeleton className="h-5 w-14 rounded-[var(--radius-full)] bg-[var(--color-field)]" />
        </div>
      ))}
    </div>
  )
}

ListSkeleton.displayName = 'ListSkeleton'

export { CardSkeleton, TableSkeleton, BoardSkeleton, ListSkeleton }
