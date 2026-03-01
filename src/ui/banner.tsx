import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
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
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
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
            className="shrink-0 rounded-[var(--radius-sm)] opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
Banner.displayName = 'Banner'

export { Banner, bannerVariants }
