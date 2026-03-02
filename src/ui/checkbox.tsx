import * as CheckboxPrimitive from '@primitives/react-checkbox'
import { IconCheck, IconMinus } from '@tabler/icons-react'
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
        'peer h-ico-md w-ico-md shrink-0 rounded-ds-sm',
        'border border-border-strong',
        'bg-field',
        'transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-interactive data-[state=checked]:border-interactive data-[state=checked]:text-text-on-color',
        'data-[state=indeterminate]:bg-interactive data-[state=indeterminate]:border-interactive data-[state=indeterminate]:text-text-on-color',
        error && 'border-border-error',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {resolvedChecked === 'indeterminate' ? (
          <IconMinus className="h-ico-sm w-ico-sm" />
        ) : (
          <IconCheck className="h-ico-sm w-ico-sm" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
