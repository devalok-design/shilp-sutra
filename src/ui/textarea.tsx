import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'
import type { InputState } from './input'

const textareaVariants = cva(
  [
    'flex w-full font-sans resize-y',
    'bg-field text-text-primary',
    'border border-border rounded-ds-md',
    'placeholder:text-text-placeholder',
    'hover:bg-field-hover',
    'transition-colors duration-fast-01',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:border-border-interactive',
    'disabled:cursor-not-allowed disabled:opacity-[0.38]',
    'read-only:bg-layer-02 read-only:cursor-default',
  ],
  {
    variants: {
      size: {
        sm: 'min-h-[60px] text-ds-sm px-ds-03 py-ds-02',
        md: 'min-h-[80px] text-ds-base px-ds-04 py-ds-03',
        lg: 'min-h-[120px] text-ds-lg px-ds-05 py-ds-04',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  state?: InputState
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, state, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          textareaVariants({ size }),
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

export { Textarea, textareaVariants }
