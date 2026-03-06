'use client'

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const alertVariants = cva(
  'relative flex gap-ds-04 rounded-ds-lg border p-ds-05',
  {
    variants: {
      color: {
        info:
          'bg-info-surface border-info-border text-info-text',
        success:
          'bg-success-surface border-success-border text-success-text',
        warning:
          'bg-warning-surface border-warning-border text-warning-text',
        error:
          'bg-error-surface border-error-border text-error-text',
        neutral:
          'bg-layer-02 border-border text-text-primary [&>svg]:text-text-secondary',
      },
    },
    defaultVariants: { color: 'info' },
  },
)

const ALERT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  info:    IconInfoCircle,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  error:   IconAlertCircle,
  neutral: IconInfoCircle,
}

/**
 * Props for Alert — an inline message block with a colored icon, optional title, optional body,
 * and an optional dismiss button. Renders with `role="alert"` for screen reader announcements.
 *
 * **Colors:** `info` (default, blue tones) | `success` | `warning` | `error` | `neutral`
 * The matching icon (info circle, checkmark, triangle, alert circle) is auto-selected by color.
 *
 * **Alert vs Banner:** Alert is inline (inside page content). Banner is a full-width notification
 * strip rendered at the top of a page/section (see `<Banner>`).
 *
 * **Dismissible:** Provide `onDismiss` to show an × button. Absence of the prop = non-dismissible.
 *
 * @example
 * // Informational tip inside a settings form:
 * <Alert title="Tip" color="info">
 *   Changes take effect after you save and reload the page.
 * </Alert>
 *
 * @example
 * // Error feedback after a failed API call (dismissible):
 * <Alert color="error" title="Save failed" onDismiss={() => setError(null)}>
 *   Your changes could not be saved. Please try again.
 * </Alert>
 *
 * @example
 * // Success confirmation after publishing:
 * <Alert color="success" title="Published!">
 *   Your post is now live and visible to all subscribers.
 * </Alert>
 *
 * @example
 * // Neutral inline note (no colored intent):
 * <Alert color="neutral">This field is auto-populated from your profile.</Alert>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, color = 'info', title, onDismiss, children, ...props }, ref) => {
    const Icon = ALERT_ICONS[color ?? 'info']

    return (
      <div ref={ref} className={cn(alertVariants({ color }), className)} role="alert" {...props}>
        <Icon className="mt-ds-01 h-ico-md w-ico-md shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-ds-md font-semibold mb-ds-01">{title}</p>}
          <div className="text-ds-md opacity-[0.9]">{children}</div>
        </div>
        {onDismiss && (
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
