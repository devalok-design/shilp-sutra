import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import * as React from 'react'
import { cn } from './lib/utils'

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  error?: boolean
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, error, indeterminate, checked, ...props }, ref) => {
  const resolvedChecked = indeterminate ? 'indeterminate' : checked

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={resolvedChecked}
      className={cn(
        'peer h-[var(--icon-md)] w-[var(--icon-md)] shrink-0 rounded-[var(--radius-sm)]',
        'border border-[var(--color-border-strong)]',
        'bg-[var(--color-field)]',
        'transition-colors duration-[var(--duration-fast)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-[var(--color-interactive)] data-[state=checked]:border-[var(--color-interactive)] data-[state=checked]:text-[var(--color-text-on-color)]',
        'data-[state=indeterminate]:bg-[var(--color-interactive)] data-[state=indeterminate]:border-[var(--color-interactive)] data-[state=indeterminate]:text-[var(--color-text-on-color)]',
        error && 'border-[var(--color-border-error)]',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {resolvedChecked === 'indeterminate' ? (
          <Minus className="h-3.5 w-3.5" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
