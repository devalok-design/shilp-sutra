import { IconX } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-sans text-xs font-medium rounded-[var(--radius-full)] border',
  {
    variants: {
      variant: {
        neutral:
          'bg-[var(--color-tag-neutral-bg)] text-[var(--color-tag-neutral-text)] border-[var(--color-tag-neutral-border)]',
        blue:
          'bg-[var(--color-tag-blue-bg)] text-[var(--color-tag-blue-text)] border-[var(--color-tag-blue-border)]',
        green:
          'bg-[var(--color-tag-green-bg)] text-[var(--color-tag-green-text)] border-[var(--color-tag-green-border)]',
        red:
          'bg-[var(--color-tag-red-bg)] text-[var(--color-tag-red-text)] border-[var(--color-tag-red-border)]',
        yellow:
          'bg-[var(--color-tag-yellow-bg)] text-[var(--color-tag-yellow-text)] border-[var(--color-tag-yellow-border)]',
        magenta:
          'bg-[var(--color-tag-magenta-bg)] text-[var(--color-tag-magenta-text)] border-[var(--color-tag-magenta-border)]',
        purple:
          'bg-[var(--color-tag-purple-bg)] text-[var(--color-tag-purple-text)] border-[var(--color-tag-purple-border)]',
      },
      size: {
        sm: 'h-5 px-2',
        md: 'h-6 px-2.5',
        lg: 'h-7 px-3',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  onDismiss?: () => void
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, onDismiss, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {dot && (
          <span
            className="h-1.5 w-1.5 rounded-[var(--radius-full)] bg-current opacity-70 shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-0.5 rounded-[var(--radius-full)] text-[var(--color-icon-secondary)] transition-colors hover:text-[var(--color-icon-primary)] hover:bg-[var(--color-field)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            aria-label="Remove"
          >
            <IconX className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  },
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
