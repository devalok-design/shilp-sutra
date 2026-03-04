import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './lib/utils'

const cardVariants = cva(
  'rounded-ds-lg text-text-primary',
  {
    variants: {
      variant: {
        default: 'bg-layer-01 border border-border-subtle shadow-01',
        elevated: 'bg-layer-01 border border-border-subtle shadow-02',
        outlined: 'bg-transparent border-2 border-border shadow-none',
        flat: 'bg-layer-02 border-none shadow-none',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        interactive &&
          'hover:shadow-02 hover:border-border-strong cursor-pointer transition-shadow duration-fast-01',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-ds-02b p-ds-06', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-sans font-semibold leading-none tracking-tight text-text-primary', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-ds-md text-text-secondary', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-ds-06 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-ds-06 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
