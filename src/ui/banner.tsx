import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const bannerVariants = cva(
  'flex items-center gap-3 px-6 py-3 text-sm font-medium border-b',
  {
    variants: {
      variant: {
        info:
          'bg-[var(--color-info-surface)] border-[var(--color-info-border)] text-[var(--color-info-text)]',
        success:
          'bg-[var(--color-success-surface)] border-[var(--color-success-border)] text-[var(--color-success-text)]',
        warning:
          'bg-[var(--color-warning-surface)] border-[var(--color-warning-border)] text-[var(--color-warning-text)]',
        error:
          'bg-[var(--color-error-surface)] border-[var(--color-error-border)] text-[var(--color-error-text)]',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const BANNER_ICONS = {
  info:    IconInfoCircle,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  error:   IconAlertCircle,
}

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  action?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ className, variant = 'info', action, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = BANNER_ICONS[variant ?? 'info']

    return (
      <div ref={ref} className={cn(bannerVariants({ variant }), className)} role="alert" {...props}>
        <Icon className="h-[var(--icon-md)] w-[var(--icon-md)] shrink-0" aria-hidden="true" />
        <span className="flex-1">{children}</span>
        {action && <span className="shrink-0">{action}</span>}
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-[var(--radius-sm)] text-[var(--color-icon-secondary)] transition-colors hover:text-[var(--color-icon-primary)] hover:bg-[var(--color-field)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            aria-label="Dismiss"
          >
            <IconX className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
Banner.displayName = 'Banner'

export { Banner, bannerVariants }
