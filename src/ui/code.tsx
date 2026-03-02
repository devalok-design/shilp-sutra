import * as React from 'react'
import { cn } from './lib/utils'

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'inline' | 'block'
}

const Code = React.forwardRef<HTMLPreElement | HTMLElement, CodeProps>(
  ({ className, variant = 'inline', children, ...props }, ref) => {
    if (variant === 'block') {
      return (
        <pre
          ref={ref as React.Ref<HTMLPreElement>}
          className={cn(
            'overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-layer-02)] p-[var(--spacing-05)] font-mono text-[13px] leading-[150%] text-[var(--color-text-primary)]',
            className,
          )}
          {...props}
        >
          <code>{children}</code>
        </pre>
      )
    }

    return (
      <code
        ref={ref}
        className={cn(
          'rounded-[var(--radius-sm)] bg-[var(--color-layer-03)] px-[var(--spacing-02)] py-[var(--spacing-01)] font-mono text-[13px] text-[var(--color-text-primary)]',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    )
  },
)
Code.displayName = 'Code'

export { Code }
