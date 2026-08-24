'use client'

import { IconAlertCircle, IconAlertTriangle,IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from './icon'
import { motionProps,springs } from './lib/motion'
import { cn } from './lib/utils'

const alertVariants = cva(
  'relative flex rounded-surface border',
  {
    variants: {
      variant: {
        subtle: '',
        solid: '',
        outline: '',
      },
      color: {
        info: '',
        success: '',
        warning: '',
        error: '',
        neutral: '',
      },
      size: {
        sm: 'gap-ds-03 p-ds-03',
        md: 'gap-ds-04 p-ds-05',
        lg: 'gap-ds-05 p-ds-07',
      },
    },
    compoundVariants: [
      // subtle (surface bg) — default, matches previous behavior
      { variant: 'subtle', color: 'info', className: 'bg-info-2 border-info-4 text-info-11' },
      { variant: 'subtle', color: 'success', className: 'bg-success-2 border-success-4 text-success-11' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-2 border-warning-4 text-warning-11' },
      { variant: 'subtle', color: 'error', className: 'bg-error-2 border-error-4 text-error-11' },
      { variant: 'subtle', color: 'neutral', className: 'bg-surface-raised border-surface-border-strong text-surface-fg [&>svg]:text-surface-fg-muted' },
      // solid (solid bg, contrasting text) — canonical name
      { variant: 'solid', color: 'info', className: 'bg-info-9 text-info-fg border-transparent [&>svg]:text-info-fg' },
      { variant: 'solid', color: 'success', className: 'bg-success-9 text-success-fg border-transparent [&>svg]:text-success-fg' },
      { variant: 'solid', color: 'warning', className: 'bg-warning-9 text-warning-fg border-transparent [&>svg]:text-warning-fg' },
      { variant: 'solid', color: 'error', className: 'bg-error-9 text-error-fg border-transparent [&>svg]:text-error-fg' },
      { variant: 'solid', color: 'neutral', className: 'bg-surface-raised-hover text-surface-fg border-transparent [&>svg]:text-surface-fg-muted' },
      // outline (transparent bg, colored border)
      { variant: 'outline', color: 'info', className: 'bg-transparent border-info-7 text-info-11' },
      { variant: 'outline', color: 'success', className: 'bg-transparent border-success-7 text-success-11' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent border-warning-7 text-warning-11' },
      { variant: 'outline', color: 'error', className: 'bg-transparent border-error-7 text-error-11' },
      { variant: 'outline', color: 'neutral', className: 'bg-transparent border-surface-border-strong text-surface-fg [&>svg]:text-surface-fg-muted' },
    ],
    defaultVariants: { variant: 'subtle', color: 'info', size: 'md' },
  },
)

const ALERT_ICONS: Record<string, React.ForwardRefExoticComponent<any>> = {
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
 * **Variants:** `subtle` (default, tinted surface) | `solid` (solid colored bg) | `outline` (transparent bg, colored border)
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
  ({ className, variant = 'subtle', color = 'info', size = 'md', title, onDismiss, children, ...props }, ref) => {
    const AlertIcon = ALERT_ICONS[color ?? 'info']
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
    }, [])

    const iconSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'
    const dismissIconSize = size === 'sm' ? 'xs' : 'sm'
    const textClass = size === 'sm' ? 'text-body-xs' : size === 'lg' ? 'text-body-md' : 'text-body-md'
    const titleClass = size === 'sm' ? 'text-body-sm' : size === 'lg' ? 'text-heading-xs' : 'text-body-md'

    return (
      <AnimatePresence onExitComplete={onDismiss}>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={springs.snappy}
            className={cn(alertVariants({ variant, color, size }), className)}
            role="alert"
            {...motionProps(props)}
          >
            <Icon icon={AlertIcon} size={iconSize} className="mt-ds-01 shrink-0" />
            <div className="flex-1 min-w-0">
              {title && <p className={cn(titleClass, 'font-semibold mb-ds-01')}>{title}</p>}
              {/* Body: on solid variants the CVA sets text-accent-fg (white) on
                  saturated step-9 backgrounds. Muting the body to surface-fg (grey)
                  there drops contrast below WCAG AA. Only mute on subtle/outline
                  variants where the root color is a readable step-11. */}
              <div
                className={cn(
                  textClass,
                  variant !== 'solid' && 'text-surface-fg-muted',
                )}
              >
                {children}
              </div>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={handleDismiss}
                className={cn(
                  'shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-control-inner transition-colors duration-fast-01 ease-productive-standard active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                  // On solid the fill is a saturated step 9, where a mid grey
                  // measures as low as 1.01:1. Inherit the alert's own foreground,
                  // exactly as the title and body already do.
                  variant === 'solid'
                    ? 'text-current opacity-80 hover:opacity-100'
                    : 'text-surface-fg-subtle hover:text-surface-fg-muted hover:bg-surface-raised-hover',
                )}
                aria-label="Dismiss"
              >
                <Icon icon={IconX} size={dismissIconSize} />
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
