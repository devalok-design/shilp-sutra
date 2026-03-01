import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const alertVariants = cva(
  'relative flex gap-3 rounded-[var(--radius-lg)] border p-4',
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

const ALERT_ICONS = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = ALERT_ICONS[variant ?? 'info']

    return (
      <div ref={ref} className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
        <Icon className="mt-0.5 h-[var(--icon-md)] w-[var(--icon-md)] shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-[var(--radius-sm)] text-[var(--color-icon-secondary)] transition-colors hover:text-[var(--color-icon-primary)] hover:bg-[var(--color-field)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  },
)
Alert.displayName = 'Alert'

export { Alert, alertVariants }
