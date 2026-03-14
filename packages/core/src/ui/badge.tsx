'use client'

import { IconX } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from './lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-ds-02b font-sans font-medium rounded-ds-full border',
  {
    variants: {
      variant: {
        subtle: '',
        secondary: '',    // alias → subtle
        solid: '',
        outline: '',
        destructive: '',  // alias → solid + error
      },
      color: {
        default: '',
        info: '',
        success: '',
        error: '',
        warning: '',
        brand: '',
        accent: '',
        teal: '',
        amber: '',
        slate: '',
        indigo: '',
        cyan: '',
        orange: '',
        emerald: '',
      },
      size: {
        xs: 'h-[16px] px-ds-02b text-ds-xs',
        sm: 'h-[20px] px-ds-03 text-ds-xs',
        md: 'h-ds-xs px-ds-03 text-ds-sm',
        lg: 'h-ds-xs-plus px-ds-04 text-ds-md',
      },
    },
    compoundVariants: [
      // subtle (surface bg)
      { variant: 'subtle', color: 'default', className: 'bg-surface-3 text-surface-fg-muted border-surface-border-strong' },
      // "secondary" alias → same as subtle + default
      { variant: 'secondary', color: 'default', className: 'bg-surface-3 text-surface-fg-muted border-surface-border-strong' },
      // "destructive" alias → solid + error
      { variant: 'destructive', color: 'default', className: 'bg-error-9 text-accent-fg border-transparent' },
      { variant: 'destructive', color: 'error', className: 'bg-error-9 text-accent-fg border-transparent' },
      { variant: 'subtle', color: 'info', className: 'bg-info-3 text-info-11 border-info-7' },
      { variant: 'subtle', color: 'success', className: 'bg-success-3 text-success-11 border-success-7' },
      { variant: 'subtle', color: 'error', className: 'bg-error-3 text-error-11 border-error-7' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-3 text-warning-11 border-warning-7' },
      { variant: 'subtle', color: 'brand', className: 'bg-accent-2 text-accent-11 border-accent-7' },
      { variant: 'subtle', color: 'accent', className: 'bg-accent-2 text-accent-11 border-accent-7' },
      { variant: 'subtle', color: 'teal', className: 'bg-category-teal-3 text-category-teal-11 border-category-teal-7' },
      { variant: 'subtle', color: 'amber', className: 'bg-category-amber-3 text-category-amber-11 border-category-amber-7' },
      { variant: 'subtle', color: 'slate', className: 'bg-category-slate-3 text-category-slate-11 border-category-slate-7' },
      { variant: 'subtle', color: 'indigo', className: 'bg-category-indigo-3 text-category-indigo-11 border-category-indigo-7' },
      { variant: 'subtle', color: 'cyan', className: 'bg-category-cyan-3 text-category-cyan-11 border-category-cyan-7' },
      { variant: 'subtle', color: 'orange', className: 'bg-category-orange-3 text-category-orange-11 border-category-orange-7' },
      { variant: 'subtle', color: 'emerald', className: 'bg-category-emerald-3 text-category-emerald-11 border-category-emerald-7' },
      // solid (filled bg)
      { variant: 'solid', color: 'default', className: 'bg-accent-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'info', className: 'bg-info-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'success', className: 'bg-success-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'error', className: 'bg-error-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'warning', className: 'bg-warning-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'brand', className: 'bg-accent-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'accent', className: 'bg-accent-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'teal', className: 'bg-category-teal-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'amber', className: 'bg-category-amber-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'slate', className: 'bg-category-slate-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'indigo', className: 'bg-category-indigo-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'cyan', className: 'bg-category-cyan-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'orange', className: 'bg-category-orange-9 text-accent-fg border-transparent' },
      { variant: 'solid', color: 'emerald', className: 'bg-category-emerald-9 text-accent-fg border-transparent' },
      // outline (border only)
      { variant: 'outline', color: 'default', className: 'bg-transparent text-surface-fg-muted border-surface-border-strong' },
      { variant: 'outline', color: 'info', className: 'bg-transparent text-info-11 border-info-7' },
      { variant: 'outline', color: 'success', className: 'bg-transparent text-success-11 border-success-7' },
      { variant: 'outline', color: 'error', className: 'bg-transparent text-error-11 border-error-7' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent text-warning-11 border-warning-7' },
      { variant: 'outline', color: 'brand', className: 'bg-transparent text-accent-11 border-accent-7' },
      { variant: 'outline', color: 'accent', className: 'bg-transparent text-accent-11 border-accent-7' },
      { variant: 'outline', color: 'teal', className: 'bg-transparent text-category-teal-11 border-category-teal-7' },
      { variant: 'outline', color: 'amber', className: 'bg-transparent text-category-amber-11 border-category-amber-7' },
      { variant: 'outline', color: 'slate', className: 'bg-transparent text-category-slate-11 border-category-slate-7' },
      { variant: 'outline', color: 'indigo', className: 'bg-transparent text-category-indigo-11 border-category-indigo-7' },
      { variant: 'outline', color: 'cyan', className: 'bg-transparent text-category-cyan-11 border-category-cyan-7' },
      { variant: 'outline', color: 'orange', className: 'bg-transparent text-category-orange-11 border-category-orange-7' },
      { variant: 'outline', color: 'emerald', className: 'bg-transparent text-category-emerald-11 border-category-emerald-7' },
    ],
    defaultVariants: {
      variant: 'subtle',
      color: 'default',
      size: 'md',
    },
  },
)

/**
 * Props for Badge — a compact inline label with a two-axis variant system, an optional
 * leading dot indicator, and a dismissible close button.
 *
 * **Two axes:**
 * - `variant` controls **visual style**: `"subtle"` (default, surface bg) | `"solid"` (filled) | `"outline"` (border only)
 * - `color` controls **semantic intent/category**: `"default"` | `"info"` | `"success"` | `"error"` |
 *   `"warning"` | `"brand"` | `"accent"` | `"teal"` | `"amber"` | `"slate"` | `"indigo"` | `"cyan"` | `"orange"` | `"emerald"`
 *
 * **Comparison with Chip:** Badge is a pure display label (no onClick, no delete handler).
 * Chip (`<Chip>`) is interactive — use Chip when users can click or dismiss the tag.
 *
 * **Dismissible:** Provide `onDismiss` to show an × button. Badge does NOT include a `dismissible`
 * boolean prop — the presence of `onDismiss` is the signal.
 *
 * @example
 * // Status badge in a table cell:
 * <Badge color="success">Active</Badge>
 *
 * @example
 * // Notification count with dot indicator (solid fill for high contrast):
 * <Badge variant="solid" size="sm" dot>3 new</Badge>
 *
 * @example
 * // Dismissible category filter (e.g. in a filter bar):
 * <Badge color="teal" onDismiss={() => removeFilter('teal')}>Teal team</Badge>
 *
 * @example
 * // Error badge for a failed job in a pipeline view:
 * <Badge color="error" size="lg">Build failed</Badge>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  onDismiss?: () => void
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, color, size, dot, onDismiss, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, color, size }), className)} {...props}>
        {dot && (
          <span className="relative inline-flex h-ds-02b w-ds-02b shrink-0" aria-hidden="true">
            <motion.span
              className="absolute inset-0 rounded-ds-full bg-current"
              animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
            />
            <span className="relative h-ds-02b w-ds-02b rounded-ds-full bg-current" />
          </span>
        )}
        {children}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-ds-01 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full text-surface-fg-subtle hover:rotate-90 transition-[color,transform] duration-fast-02 hover:text-surface-fg-muted hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9"
            aria-label={`Remove ${typeof children === 'string' ? children : ''}`.trim() || 'Remove'}
          >
            <IconX className="h-ico-sm w-ico-sm" />
          </button>
        )}
      </span>
    )
  },
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
