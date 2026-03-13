'use client'

import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX, IconAlertTriangle } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from './lib/utils'
import { springs, motionProps } from './lib/motion'

const bannerVariants = cva(
  'flex items-center gap-ds-04 px-ds-06 py-ds-04 text-ds-md font-medium border-b',
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

const BANNER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  info:    IconInfoCircle,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
  error:   IconAlertCircle,
  neutral: IconInfoCircle,
}

/**
 * Props for Banner — a full-width notification strip with a colored icon, message, optional
 * action slot, and an optional dismiss button. Renders with `role="alert"`.
 *
 * **Colors:** `info` (default) | `success` | `warning` | `error` | `neutral`
 *
 * **Banner vs Alert:** Banner spans the full width of its container (e.g., top of a page or section).
 * Alert is an inline block inside page content. Use Banner for system-level announcements.
 *
 * **`action` slot:** Accepts any React node — typically a `<Button variant="ghost" size="sm">` or a link.
 * **Dismissible:** Provide `onDismiss` to show an × button.
 *
 * @example
 * // Maintenance warning at top of the dashboard:
 * <Banner color="warning">
 *   Scheduled maintenance on Sunday 2am–4am UTC. Expect brief downtime.
 * </Banner>
 *
 * @example
 * // Success banner with a CTA action button:
 * <Banner color="success" action={<Button variant="ghost" size="sm">View report</Button>}>
 *   Your export is ready.
 * </Banner>
 *
 * @example
 * // Dismissible info banner for a new feature announcement:
 * <Banner color="info" onDismiss={() => markAsSeen('feature-x')}>
 *   New: You can now assign tasks directly from the calendar view.
 * </Banner>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof bannerVariants> {
  action?: React.ReactNode
  onDismiss?: () => void
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ className, color = 'info', action, onDismiss, children, ...props }, ref) => {
    const Icon = BANNER_ICONS[color ?? 'info']
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
    }, [])

    return (
      <AnimatePresence onExitComplete={onDismiss}>
        {isVisible && (
          <motion.div
            ref={ref}
            initial={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.snappy}
            className={cn(bannerVariants({ color }), 'overflow-hidden', className)}
            role="alert"
            {...motionProps(props)}
          >
            <Icon className="h-ico-md w-ico-md shrink-0" aria-hidden="true" />
            <span className="flex-1">{children}</span>
            {action && <span className="shrink-0">{action}</span>}
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
          </motion.div>
        )}
      </AnimatePresence>
    )
  },
)
Banner.displayName = 'Banner'

export { Banner, bannerVariants }
