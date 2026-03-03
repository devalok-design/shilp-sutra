import * as React from 'react'
import { cn } from './lib/utils'

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'inline' | 'block'
}

const Code = React.forwardRef<HTMLPreElement | HTMLElement, CodeProps>(
  ({ className, variant = 'inline', children, ...props }, ref) => {
    if (variant === 'block') {
      return (
        <pre
          ref={ref as React.Ref<HTMLPreElement>}
          className={cn(
            'overflow-x-auto rounded-ds-md border border-border-subtle bg-layer-02 p-ds-05 font-mono text-[13px] leading-[150%] text-text-primary',
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
          'rounded-ds-sm bg-layer-03 px-ds-02 py-ds-01 font-mono text-[13px] text-text-primary',
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
