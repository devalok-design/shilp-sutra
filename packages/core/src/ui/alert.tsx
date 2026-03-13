'use client'

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from './lib/utils'
import { springs, motionProps } from './lib/motion'

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
      { variant: 'subtle', color: 'info', className: 'bg-info-3 border-info-7 text-info-11' },
      { variant: 'subtle', color: 'success', className: 'bg-success-3 border-success-7 text-success-11' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-3 border-warning-7 text-warning-11' },
      { variant: 'subtle', color: 'error', className: 'bg-error-3 border-error-7 text-error-11' },
      { variant: 'subtle', color: 'neutral', className: 'bg-surface-2 border-surface-border-strong text-surface-fg [&>svg]:text-surface-fg-muted' },
      // filled (solid bg, white text)
      { variant: 'filled', color: 'info', className: 'bg-info-9 text-accent-fg border-transparent [&>svg]:text-accent-fg' },
      { variant: 'filled', color: 'success', className: 'bg-success-9 text-accent-fg border-transparent [&>svg]:text-accent-fg' },
      { variant: 'filled', color: 'warning', className: 'bg-warning-9 text-accent-fg border-transparent [&>svg]:text-accent-fg' },
      { variant: 'filled', color: 'error', className: 'bg-error-9 text-accent-fg border-transparent [&>svg]:text-accent-fg' },
      { variant: 'filled', color: 'neutral', className: 'bg-surface-3 text-surface-fg border-transparent [&>svg]:text-surface-fg-muted' },
      // outline (transparent bg, colored border)
      { variant: 'outline', color: 'info', className: 'bg-transparent border-info-7 text-info-11' },
      { variant: 'outline', color: 'success', className: 'bg-transparent border-success-7 text-success-11' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent border-warning-7 text-warning-11' },
      { variant: 'outline', color: 'error', className: 'bg-transparent border-error-7 text-error-11' },
      { variant: 'outline', color: 'neutral', className: 'bg-transparent border-surface-border-strong text-surface-fg [&>svg]:text-surface-fg-muted' },
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
  /**
   * Called after the exit animation completes, not immediately on click.
   * The dismiss button sets internal visibility to false, triggering the exit
   * animation; `onDismiss` fires via `AnimatePresence.onExitComplete`.
   */
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'subtle', color = 'info', title, onDismiss, children, ...props }, ref) => {
    const Icon = ALERT_ICONS[color ?? 'info']
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
    }, [])

    return (
      <AnimatePresence onExitComplete={onDismiss}>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springs.snappy}
            className={cn(alertVariants({ variant, color }), className)}
            role="alert"
            {...motionProps(props)}
          >
            <Icon className="mt-ds-01 h-ico-md w-ico-md shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              {title && <p className="text-ds-md font-semibold mb-ds-01">{title}</p>}
              <div className="text-ds-md opacity-[0.9]">{children}</div>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-sm text-surface-fg-subtle transition-colors hover:text-surface-fg-muted hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
                aria-label="Dismiss"
              >
                <IconX className="h-ico-sm w-ico-sm" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
Alert.displayName = 'Alert'

export { Alert, alertVariants }
