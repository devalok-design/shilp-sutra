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
          'flex w-full font-sans text-sm',
          'h-[var(--size-md)] px-3',
          'bg-[var(--color-field)] text-[var(--color-text-primary)]',
          'border border-[var(--color-border-default)] rounded-[var(--radius-md)]',
          'placeholder:text-[var(--color-text-placeholder)]',
          'hover:bg-[var(--color-field-hover)]',
          'transition-colors duration-[var(--duration-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:border-[var(--color-border-interactive)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'read-only:bg-[var(--color-layer-02)] read-only:cursor-default',
          state === 'error' && 'border-[var(--color-border-error)] focus-visible:ring-[var(--color-error)]',
          state === 'warning' && 'border-[var(--color-border-warning)] focus-visible:ring-[var(--color-warning)]',
          state === 'success' && 'border-[var(--color-border-success)] focus-visible:ring-[var(--color-success)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
