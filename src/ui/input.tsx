import * as React from 'react'
import { cn } from './lib/utils'

export type InputState = 'default' | 'error' | 'warning' | 'success'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: InputState
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, state, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full font-sans text-ds-md',
          'h-ds-md px-ds-04',
          'bg-field text-text-primary',
          'border border-border rounded-ds-md',
          'placeholder:text-text-placeholder',
          'hover:bg-field-hover',
          'transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'read-only:bg-layer-02 read-only:cursor-default',
          state === 'error' && 'border-border-error focus-visible:ring-error',
          state === 'warning' && 'border-border-warning focus-visible:ring-warning',
          state === 'success' && 'border-border-success focus-visible:ring-success',
          className,
        )}
        aria-invalid={state === 'error' || undefined}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
