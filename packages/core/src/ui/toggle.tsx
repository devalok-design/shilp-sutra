'use client'

import * as TogglePrimitive from '@primitives/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import * as React from 'react'

import { motionProps,springs } from './lib/motion'
import { cn } from './lib/utils'

const MotionToggleRoot = motion.create(TogglePrimitive.Root)

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-ds-03 rounded-control font-medium transition-colors duration-fast-01 ease-productive-standard focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-action-disabled',
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-surface-panel-hover text-surface-fg-muted',
        outline:
          'border border-surface-border-interactive bg-transparent hover:bg-surface-panel-hover hover:border-surface-border-interactive',
      },
      size: {
        sm: 'h-ds-sm px-ds-03 text-body-sm',
        md: 'h-ds-md px-ds-04 text-body-md',
        lg: 'h-ds-lg px-ds-05 text-body-lg',
      },
      // Pressed state only — an unpressed toggle carries no colour at all.
      color: {
        accent: 'data-[state=on]:bg-palette-subtle data-[state=on]:text-palette-text',
        error: 'data-[state=on]:bg-palette-subtle data-[state=on]:text-palette-text',
        success: 'data-[state=on]:bg-palette-subtle data-[state=on]:text-palette-text',
        // Neutral takes full-contrast text rather than the muted `text` role,
        // because a pressed neutral toggle has no hue to carry the emphasis.
        neutral: 'data-[state=on]:bg-palette-subtle data-[state=on]:text-surface-fg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      color: 'accent',
    },
  },
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, color, ...props }, ref) => (
  <MotionToggleRoot
    ref={ref}
    whileTap={{ scale: 0.95 }}
    transition={springs.snappy}
    data-palette={color ?? undefined}
    className={cn(toggleVariants({ variant, size, color }), className)}
    {...motionProps(props)}
  />
))
Toggle.displayName = TogglePrimitive.Root.displayName

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>

export { Toggle, toggleVariants }
