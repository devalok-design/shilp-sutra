'use client'

import * as React from 'react'
import * as TogglePrimitive from '@primitives/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

import { springs, motionProps } from './lib/motion'
import { cn } from './lib/utils'

const MotionToggleRoot = motion.create(TogglePrimitive.Root)

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 rounded-ds-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled data-[state=on]:bg-accent-2 data-[state=on]:text-accent-11',
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-surface-3 text-surface-fg-muted',
        outline:
          'border border-surface-border-strong bg-transparent hover:bg-surface-3',
      },
      size: {
        sm: 'h-ds-sm px-ds-03 text-ds-sm',
        md: 'h-ds-md px-ds-04 text-ds-md',
        lg: 'h-ds-lg px-ds-05 text-ds-base',
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
  <MotionToggleRoot
    ref={ref}
    whileTap={{ scale: 0.95 }}
    transition={springs.snappy}
    className={cn(toggleVariants({ variant, size }), className)}
    {...motionProps(props)}
  />
))
Toggle.displayName = TogglePrimitive.Root.displayName

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>

export { Toggle, toggleVariants }
