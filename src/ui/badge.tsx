import { IconX } from '@tabler/icons-react'
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-ds-02b font-sans font-medium rounded-ds-full border',
  {
    variants: {
      variant: {
        neutral:
          'bg-field text-text-secondary border-border',
        solid:
          'bg-interactive text-text-on-interactive border-transparent',
        info:
          'bg-info-surface text-info-text border-info-border',
        success:
          'bg-success-surface text-success-text border-success-border',
        error:
          'bg-error-surface text-error-text border-error-border',
        warning:
          'bg-warning-surface text-warning-text border-warning-border',
        brand:
          'bg-interactive-subtle text-text-brand border-interactive',
        accent:
          'bg-accent-subtle text-accent border-accent',
        teal:
          'bg-category-teal-surface text-category-teal-text border-category-teal-border',
        amber:
          'bg-category-amber-surface text-category-amber-text border-category-amber-border',
        slate:
          'bg-category-slate-surface text-category-slate-text border-category-slate-border',
        indigo:
          'bg-category-indigo-surface text-category-indigo-text border-category-indigo-border',
        cyan:
          'bg-category-cyan-surface text-category-cyan-text border-category-cyan-border',
        orange:
          'bg-category-orange-surface text-category-orange-text border-category-orange-border',
        emerald:
          'bg-category-emerald-surface text-category-emerald-text border-category-emerald-border',
      },
      size: {
        sm: 'h-5 px-ds-03 text-ds-xs',
        md: 'h-ds-xs px-ds-03 text-ds-sm',
        lg: 'h-ds-xs-plus px-ds-04 text-ds-md',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  },
)

/**
 * Props for Badge — a compact inline label with 15 semantic + categorical variants, an optional
 * leading dot indicator, and a dismissible close button.
 *
 * **15 variants:** `neutral` (default) | `solid` (brand fill) | `info` | `success` | `error` |
 * `warning` | `brand` | `accent` | `teal` | `amber` | `slate` | `indigo` | `cyan` | `orange` | `emerald`
 *
 * **Comparison with Chip:** Badge is a pure display label (no onClick, no delete handler).
 * Chip (`<Chip>`) is interactive — use Chip when users can click or dismiss the tag.
 *
 * **Dismissible:** Provide `onDismiss` to show an × button. Badge does NOT include a `dismissible`
 * boolean prop — the presence of `onDismiss` is the signal.
 *
 * @example
 * // Status badge in a table cell:
 * <Badge variant="success">Active</Badge>
 *
 * @example
 * // Notification count with dot indicator (solid fill for high contrast):
 * <Badge variant="solid" size="sm" dot>3 new</Badge>
 *
 * @example
 * // Dismissible category filter (e.g. in a filter bar):
 * <Badge variant="teal" onDismiss={() => removeFilter('teal')}>Teal team</Badge>
 *
 * @example
 * // Error badge for a failed job in a pipeline view:
 * <Badge variant="error" size="lg">Build failed</Badge>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  onDismiss?: () => void
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, onDismiss, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {dot && (
          <span
            className="h-ds-02b w-ds-02b rounded-ds-full bg-current opacity-70 shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-ds-01 rounded-ds-full text-icon-secondary transition-colors hover:text-icon-primary hover:bg-field focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Remove"
          >
            <IconX className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  },
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
