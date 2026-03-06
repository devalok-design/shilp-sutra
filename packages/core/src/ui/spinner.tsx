import * as React from 'react'
import { cn } from './lib/utils'

const sizeClasses = {
  sm: 'h-ico-sm w-ico-sm',
  md: 'h-ico-md w-ico-md',
  lg: 'h-ico-lg w-ico-lg',
} as const

/**
 * Props for Spinner — an animated loading indicator rendered as an SVG circle with a `role="status"`
 * wrapper and a visually-hidden "Loading..." text for screen readers.
 *
 * **Sizes:** `sm` (icon-sm) | `md` (icon-md, default) | `lg` (icon-lg)
 *
 * **Accessibility:** The spinner renders `<span role="status"><svg>...</svg><span className="sr-only">Loading...</span></span>`.
 * You don't need to add `aria-label` — the sr-only text is already present.
 *
 * **Note:** `<Button>` has built-in `loading` + `loadingPosition` — prefer that over composing manually.
 *
 * @example
 * // Inline loading indicator next to button text:
 * <div className="flex items-center gap-ds-03">
 *   <Spinner size="sm" />
 *   <span>Saving...</span>
 * </div>
 *
 * @example
 * // Full-page centered loading state:
 * <div className="flex h-screen items-center justify-center">
 *   <Spinner size="lg" />
 * </div>
 *
 * @example
 * // Spinner inside a card while data loads:
 * <Card className="flex items-center justify-center min-h-[120px]">
 *   <Spinner />
 * </Card>
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <span role="status">
        <svg
          ref={ref}
          className={cn('animate-spin motion-reduce:animate-none', sizeClasses[size], className)}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="var(--color-border-subtle)"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            fill="var(--color-interactive)"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </span>
    )
  },
)
Spinner.displayName = 'Spinner'

export { Spinner }
