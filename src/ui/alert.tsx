import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const alertVariants = cva(
  'relative flex gap-ds-04 rounded-ds-lg border p-ds-05',
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

const ALERT_ICONS = {
  info:    IconInfoCircle,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  error:   IconAlertCircle,
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
        <Icon className="mt-0.5 h-ico-md w-ico-md shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-ds-md font-semibold mb-0.5">{title}</p>}
          <div className="text-ds-md opacity-90">{children}</div>
        </div>
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
Alert.displayName = 'Alert'

export { Alert, alertVariants }
