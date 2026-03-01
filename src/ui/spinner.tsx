import * as React from 'react'
import { cn } from './lib/utils'

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <span role="status">
        <svg
          ref={ref}
          className={cn('animate-spin', sizeClasses[size], className)}
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
