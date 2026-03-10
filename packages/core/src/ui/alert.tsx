'use client'

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const alertVariants = cva(
  'relative flex gap-ds-04 rounded-ds-lg border p-ds-05',
  {
    variants: {
      variant: {
        subtle: '',
        filled: '',
        outline: '',
      },
      color: {
        info: '',
        success: '',
        warning: '',
        error: '',
        neutral: '',
      },
    },
    compoundVariants: [
      // subtle (surface bg) — default, matches previous behavior
      { variant: 'subtle', color: 'info', className: 'bg-info-surface border-info-border text-info-text' },
      { variant: 'subtle', color: 'success', className: 'bg-success-surface border-success-border text-success-text' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-surface border-warning-border text-warning-text' },
      { variant: 'subtle', color: 'error', className: 'bg-error-surface border-error-border text-error-text' },
      { variant: 'subtle', color: 'neutral', className: 'bg-layer-02 border-border text-text-primary [&>svg]:text-text-secondary' },
      // filled (solid bg, white text)
      { variant: 'filled', color: 'info', className: 'bg-info text-text-on-color border-transparent [&>svg]:text-text-on-color' },
      { variant: 'filled', color: 'success', className: 'bg-success text-text-on-color border-transparent [&>svg]:text-text-on-color' },
      { variant: 'filled', color: 'warning', className: 'bg-warning text-text-on-color border-transparent [&>svg]:text-text-on-color' },
      { variant: 'filled', color: 'error', className: 'bg-error text-text-on-color border-transparent [&>svg]:text-text-on-color' },
      { variant: 'filled', color: 'neutral', className: 'bg-layer-03 text-text-primary border-transparent [&>svg]:text-text-secondary' },
      // outline (transparent bg, colored border)
      { variant: 'outline', color: 'info', className: 'bg-transparent border-info-border text-info-text' },
      { variant: 'outline', color: 'success', className: 'bg-transparent border-success-border text-success-text' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent border-warning-border text-warning-text' },
      { variant: 'outline', color: 'error', className: 'bg-transparent border-error-border text-error-text' },
      { variant: 'outline', color: 'neutral', className: 'bg-transparent border-border text-text-primary [&>svg]:text-text-secondary' },
    ],
    defaultVariants: { variant: 'subtle', color: 'info' },
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
 * **Variants:** `subtle` (default, tinted surface) | `filled` (solid colored bg) | `outline` (transparent bg, colored border)
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
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof alertVariants> {
  title?: string
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'subtle', color = 'info', title, onDismiss, children, ...props }, ref) => {
    const Icon = ALERT_ICONS[color ?? 'info']
    const [isDismissing, setIsDismissing] = React.useState(false)

    const handleDismiss = React.useCallback(() => {
      setIsDismissing(true)
      setTimeout(() => onDismiss?.(), 150) // matches duration-moderate-01
    }, [onDismiss])

    return (
      <div ref={ref} className={cn(alertVariants({ variant, color }), isDismissing && 'animate-slide-out-up', className)} role="alert" {...props}>
        <Icon className="mt-ds-01 h-ico-md w-ico-md shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title && <p className="text-ds-md font-semibold mb-ds-01">{title}</p>}
          <div className="text-ds-md opacity-[0.9]">{children}</div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-sm text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
