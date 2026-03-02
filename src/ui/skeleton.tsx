import { HTMLAttributes } from 'react'
import { cn } from './lib/utils'

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-ds-md bg-skeleton-base',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
