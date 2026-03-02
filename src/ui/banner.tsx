import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const bannerVariants = cva(
  'flex items-center gap-ds-04 px-ds-06 py-ds-04 text-ds-md font-medium border-b',
  {
    variants: {
      variant: {
        info:
          'bg-info-surface border-info-border text-info-text',
        success:
          'bg-success-surface border-success-border text-success-text',
        warning:
          'bg-warning-surface border-warning-border text-warning-text',
        error:
          'bg-error-surface border-error-border text-error-text',
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
        <Icon className="h-ico-md w-ico-md shrink-0" aria-hidden="true" />
        <span className="flex-1">{children}</span>
        {action && <span className="shrink-0">{action}</span>}
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-ds-sm text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Dismiss"
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        )}
      </div>
    )
  },
)
Banner.displayName = 'Banner'

export { Banner, bannerVariants }
