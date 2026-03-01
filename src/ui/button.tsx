import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@primitives/react-slot'
import * as React from 'react'
import { cn } from './lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold text-sm select-none border border-transparent transition-[color,background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-interactive)] text-[var(--color-text-on-color)] hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] shadow-[var(--shadow-01)] hover:shadow-brand',
        secondary:
          'bg-transparent text-[var(--color-interactive)] border-[var(--color-border-interactive)] hover:bg-[var(--color-interactive-subtle)]',
        ghost:
          'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-layer-02)] hover:text-[var(--color-text-primary)]',
        danger:
          'bg-[var(--color-danger)] text-[var(--color-text-on-color)] hover:bg-[var(--color-danger-hover)] shadow-[var(--shadow-01)]',
        'danger-ghost':
          'bg-transparent text-[var(--color-error)] border border-[var(--color-border-error)] hover:bg-[var(--color-error-surface)]',
        link: 'text-[var(--color-text-link)] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-[var(--size-sm)] rounded-[var(--radius-md)] px-3',
        md: 'h-[var(--size-md)] rounded-[var(--radius-md)] px-4',
        lg: 'h-[var(--size-lg)] rounded-[var(--radius-lg)] px-6',
        'icon-sm': 'h-[var(--size-sm)] w-[var(--size-sm)] rounded-[var(--radius-md)]',
        'icon-md': 'h-[var(--size-md)] w-[var(--size-md)] rounded-[var(--radius-md)]',
        'icon-lg': 'h-[var(--size-lg)] w-[var(--size-lg)] rounded-[var(--radius-lg)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button }
