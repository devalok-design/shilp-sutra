import * as React from 'react'
import { cn } from './lib/utils'
import type { InputState } from './input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: InputState
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full font-sans text-ds-md',
          'min-h-20 resize-y px-ds-04 py-ds-03',
          'bg-field text-text-primary',
          'border border-border rounded-ds-md',
          'placeholder:text-text-placeholder',
          'hover:bg-field-hover',
          'transition-colors duration-fast-01',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
          'disabled:cursor-not-allowed disabled:opacity-[0.38]',
          'read-only:bg-layer-02 read-only:cursor-default',
          state === 'error' && 'border-border-error focus-visible:ring-error',
          state === 'warning' && 'border-border-warning focus-visible:ring-warning',
          state === 'success' && 'border-border-success focus-visible:ring-success',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
