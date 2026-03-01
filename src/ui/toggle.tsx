import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[var(--color-interactive-subtle)] data-[state=on]:text-[var(--color-interactive)]',
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-[var(--color-field)] text-[var(--color-text-secondary)]',
        outline:
          'border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-field)]',
      },
      size: {
        sm: 'h-8 px-2',
        md: 'h-9 px-3',
        lg: 'h-10 px-3',
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
