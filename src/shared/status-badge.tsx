import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../ui/lib/utils'

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-[Ranade]',
  {
    variants: {
      status: {
        active: 'bg-[var(--Surface-Success)] text-[var(--Text-Success)]',
        pending: 'bg-[var(--Surface-Pending)] text-[var(--Text-Pending)]',
        approved: 'bg-[var(--approved-bg)] text-[var(--Text-Success)]',
        rejected: 'bg-[var(--denied-bg)] text-[var(--Text-Error)]',
        completed: 'bg-[var(--Surface-Success)] text-[var(--Text-Success)]',
        blocked: 'bg-[var(--Mapped-Error-Suraface)] text-[var(--Text-Error)]',
        cancelled: 'bg-[var(--Elevation-Card-hover-primary)] text-[var(--Mapped-Text-Quaternary)]',
        draft: 'bg-[var(--Elevation-Card-hover-primary)] text-[var(--Mapped-Text-Tertiary)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] font-semibold tracking-wide',
        default: 'px-2.5 py-1 text-[12px] font-medium tracking-wide',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
    },
  },
)

const dotColorMap: Record<string, string> = {
  active: 'bg-[var(--green-500)]',
  pending: 'bg-[var(--yellow-500)]',
  approved: 'bg-[var(--green-500)]',
  rejected: 'bg-[var(--red-500)]',
  completed: 'bg-[var(--green-600)]',
  blocked: 'bg-[var(--red-600)]',
  cancelled: 'bg-[var(--neutals-400)]',
  draft: 'bg-[var(--neutals-500)]',
}

interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  label?: string
  hideDot?: boolean
}

function StatusBadge({
  status,
  size,
  label,
  hideDot = false,
  className,
  ...props
}: StatusBadgeProps) {
  const statusKey = status ?? 'pending'
  const displayLabel =
    label ?? statusKey.charAt(0).toUpperCase() + statusKey.slice(1)

  return (
    <span
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {!hideDot && (
        <span
          className={cn(
            'shrink-0 rounded-full',
            size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            dotColorMap[statusKey],
          )}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  )
}

StatusBadge.displayName = 'StatusBadge'

export { StatusBadge, statusBadgeVariants }
export type { StatusBadgeProps }
