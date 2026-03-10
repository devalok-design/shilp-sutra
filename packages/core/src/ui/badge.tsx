'use client'

import { IconX } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
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
      { variant: 'subtle', color: 'default', className: 'bg-field text-text-secondary border-border' },
      // "secondary" alias → same as subtle + default
      { variant: 'secondary', color: 'default', className: 'bg-field text-text-secondary border-border' },
      // "destructive" alias → solid + error
      { variant: 'destructive', color: 'default', className: 'bg-error text-text-on-color border-transparent' },
      { variant: 'destructive', color: 'error', className: 'bg-error text-text-on-color border-transparent' },
      { variant: 'subtle', color: 'info', className: 'bg-info-surface text-info-text border-info-border' },
      { variant: 'subtle', color: 'success', className: 'bg-success-surface text-success-text border-success-border' },
      { variant: 'subtle', color: 'error', className: 'bg-error-surface text-error-text border-error-border' },
      { variant: 'subtle', color: 'warning', className: 'bg-warning-surface text-warning-text border-warning-border' },
      { variant: 'subtle', color: 'brand', className: 'bg-interactive-subtle text-text-brand border-interactive' },
      { variant: 'subtle', color: 'accent', className: 'bg-accent-subtle text-accent border-accent' },
      { variant: 'subtle', color: 'teal', className: 'bg-category-teal-surface text-category-teal-text border-category-teal-border' },
      { variant: 'subtle', color: 'amber', className: 'bg-category-amber-surface text-category-amber-text border-category-amber-border' },
      { variant: 'subtle', color: 'slate', className: 'bg-category-slate-surface text-category-slate-text border-category-slate-border' },
      { variant: 'subtle', color: 'indigo', className: 'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border' },
      { variant: 'subtle', color: 'cyan', className: 'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border' },
      { variant: 'subtle', color: 'orange', className: 'bg-category-orange-surface text-category-orange-text border-category-orange-border' },
      { variant: 'subtle', color: 'emerald', className: 'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border' },
      // solid (filled bg)
      { variant: 'solid', color: 'default', className: 'bg-interactive text-text-on-color border-transparent' },
      { variant: 'solid', color: 'info', className: 'bg-info text-text-on-color border-transparent' },
      { variant: 'solid', color: 'success', className: 'bg-success text-text-on-color border-transparent' },
      { variant: 'solid', color: 'error', className: 'bg-error text-text-on-color border-transparent' },
      { variant: 'solid', color: 'warning', className: 'bg-warning text-text-on-color border-transparent' },
      { variant: 'solid', color: 'brand', className: 'bg-interactive text-text-on-color border-transparent' },
      { variant: 'solid', color: 'accent', className: 'bg-accent text-text-on-color border-transparent' },
      { variant: 'solid', color: 'teal', className: 'bg-category-teal text-text-on-color border-transparent' },
      { variant: 'solid', color: 'amber', className: 'bg-category-amber text-text-on-color border-transparent' },
      { variant: 'solid', color: 'slate', className: 'bg-category-slate text-text-on-color border-transparent' },
      { variant: 'solid', color: 'indigo', className: 'bg-category-indigo text-text-on-color border-transparent' },
      { variant: 'solid', color: 'cyan', className: 'bg-category-cyan text-text-on-color border-transparent' },
      { variant: 'solid', color: 'orange', className: 'bg-category-orange text-text-on-color border-transparent' },
      { variant: 'solid', color: 'emerald', className: 'bg-category-emerald text-text-on-color border-transparent' },
      // outline (border only)
      { variant: 'outline', color: 'default', className: 'bg-transparent text-text-secondary border-border' },
      { variant: 'outline', color: 'info', className: 'bg-transparent text-info-text border-info-border' },
      { variant: 'outline', color: 'success', className: 'bg-transparent text-success-text border-success-border' },
      { variant: 'outline', color: 'error', className: 'bg-transparent text-error-text border-error-border' },
      { variant: 'outline', color: 'warning', className: 'bg-transparent text-warning-text border-warning-border' },
      { variant: 'outline', color: 'brand', className: 'bg-transparent text-text-brand border-interactive' },
      { variant: 'outline', color: 'accent', className: 'bg-transparent text-accent border-accent' },
      { variant: 'outline', color: 'teal', className: 'bg-transparent text-category-teal-text border-category-teal-border' },
      { variant: 'outline', color: 'amber', className: 'bg-transparent text-category-amber-text border-category-amber-border' },
      { variant: 'outline', color: 'slate', className: 'bg-transparent text-category-slate-text border-category-slate-border' },
      { variant: 'outline', color: 'indigo', className: 'bg-transparent text-category-indigo-text border-category-indigo-border' },
      { variant: 'outline', color: 'cyan', className: 'bg-transparent text-category-cyan-text border-category-cyan-border' },
      { variant: 'outline', color: 'orange', className: 'bg-transparent text-category-orange-text border-category-orange-border' },
      { variant: 'outline', color: 'emerald', className: 'bg-transparent text-category-emerald-text border-category-emerald-border' },
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
          <span
            className="h-ds-02b w-ds-02b rounded-ds-full bg-current opacity-[0.7] shrink-0 animate-pulse-ring"
            aria-hidden="true"
          />
        )}
        {children}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-ds-01 min-h-ds-xs min-w-ds-xs flex items-center justify-center rounded-ds-full text-icon-secondary hover:rotate-90 transition-[color,transform] duration-fast-02 hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Remove"
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
