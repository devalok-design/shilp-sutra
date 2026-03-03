import * as React from 'react'
import * as TogglePrimitive from '@primitives/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 rounded-ds-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38] data-[state=on]:bg-interactive-subtle data-[state=on]:text-interactive',
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-field text-text-secondary',
        outline:
          'border border-border bg-transparent hover:bg-field',
      },
      size: {
        sm: 'h-ds-sm px-ds-03 text-ds-sm',
        md: 'h-9 px-ds-04 text-ds-md',
        lg: 'h-ds-md px-ds-04 text-ds-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))
Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
