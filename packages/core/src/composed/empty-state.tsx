import * as React from 'react'
import { cn } from '../ui/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

const DevalokChakraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M25.97,21.39c-0.9-1.85,0.08-3.95-1.72-5.39c1.76-1.44,0.8-3.55,1.69-5.39c0.05-0.12,0.04-0.25-0.02-0.35c-0.06-0.1-0.16-0.18-0.29-0.19c-2.05-0.15-3.35-2.04-5.5-1.21c-0.39-2.21-2.7-2.44-3.84-4.13c-0.08-0.1-0.19-0.16-0.31-0.16c-0.12,0-0.23,0.05-0.31,0.16c-1.14,1.69-3.43,1.92-3.82,4.13c-2.14-0.83-3.47,1.07-5.52,1.21c-0.13,0.01-0.23,0.09-0.29,0.19c-0.06,0.1-0.07,0.23-0.02,0.35c0.9,1.85-0.08,3.95,1.72,5.39c-1.76,1.44-0.8,3.55-1.69,5.39C6,21.51,6.02,21.64,6.07,21.74c0.06,0.1,0.16,0.18,0.29,0.19c2.05,0.15,3.38,2.06,5.52,1.23c0.39,2.21,2.67,2.43,3.82,4.12c0.08,0.1,0.19,0.16,0.31,0.16c0.12,0,0.23-0.05,0.31-0.16c1.14-1.69,3.42-1.92,3.81-4.13c2.14,0.83,3.48-1.07,5.53-1.22c0.13-0.01,0.23-0.09,0.29-0.19C26.01,21.64,26.02,21.51,25.97,21.39z" />
  </svg>
)

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      compact = false,
      className,
      ...props
    },
    ref,
  ) => {
    const resolvedIcon = icon ?? (
      <DevalokChakraIcon
        className={cn(
          'text-text-placeholder',
          compact ? 'h-ico-md w-ico-md' : 'h-ico-lg w-ico-lg',
        )}
      />
    )

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          compact ? 'gap-ds-04 py-ds-07' : 'gap-ds-05 py-ds-10',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-ds-xl bg-layer-02 animate-float',
            compact ? 'h-ds-md w-ds-md' : 'h-ds-lg w-ds-lg',
          )}
        >
          {resolvedIcon}
        </div>

        <div className="flex max-w-[280px] flex-col gap-ds-02">
          <h3
            className={cn(
              'text-text-primary',
              compact ? 'text-ds-md font-semibold' : 'text-ds-base font-semibold',
            )}
          >
            {title}
          </h3>
          {description && (
            <p
              className={cn(
                'text-text-placeholder',
                compact ? 'text-ds-sm' : 'text-ds-md',
              )}
            >
              {description}
            </p>
          )}
        </div>

        {action && <div className="mt-ds-02">{action}</div>}
      </div>
    )
  },
)
EmptyState.displayName = 'EmptyState'

export { EmptyState }
