'use client'

import { IconAlertCircle, IconAlertTriangle,IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from './icon'
import { motionProps,springs } from './lib/motion'
import { cn } from './lib/utils'

const bannerVariants = cva(
  'flex flex-wrap items-center gap-ds-04 px-ds-06 py-ds-04 text-ds-md font-medium border-b',
  {
    variants: {
      color: {
        info:
          'bg-info-3 border-info-7 text-info-11',
        success:
          'bg-success-3 border-success-7 text-success-11',
        warning:
          'bg-warning-3 border-warning-7 text-warning-11',
        error:
          'bg-error-3 border-error-7 text-error-11',
        neutral:
          'bg-surface-raised border-surface-border-strong text-surface-fg [&>svg]:text-surface-fg-muted',
      },
    },
    defaultVariants: { color: 'info' },
  },
)

const BANNER_ICONS: Record<string, React.ForwardRefExoticComponent<any>> = {
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
 * **`actions` slot:** Accepts any React node(s) — typically one or more `<Button variant="ghost" size="sm">`.
 * Multiple actions wrap gracefully on narrow viewports.
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
 * <Banner color="success" actions={<Button variant="ghost" size="sm">View report</Button>}>
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
  /** Action slot — accepts any React node(s), typically ghost Buttons. */
  actions?: React.ReactNode
  onDismiss?: () => void
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ className, color = 'info', actions, onDismiss, children, ...props }, ref) => {
    const BannerIcon = BANNER_ICONS[color ?? 'info']
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
            <Icon icon={BannerIcon} size="md" className="shrink-0" />
            <div className="min-w-0 flex-1">{children}</div>
            {actions && (
              <div className="flex shrink-0 items-center gap-ds-02 [&_button]:transition-colors [&_button]:duration-moderate-01 [&_button]:ease-productive-standard [&_button:hover]:bg-current/10">{actions}</div>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-sm transition-colors duration-moderate-01 ease-productive-standard hover:bg-current/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
                aria-label="Dismiss"
                title="Dismiss"
              >
                <Icon icon={IconX} size="sm" />
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
