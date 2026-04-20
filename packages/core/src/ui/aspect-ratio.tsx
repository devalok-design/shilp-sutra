'use client'

import * as AspectRatioPrimitive from '@primitives/react-aspect-ratio'
import * as React from 'react'

import { cn } from './lib/utils'

const AspectRatio = React.forwardRef<
  React.ComponentRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
AspectRatio.displayName = 'AspectRatio'

export { AspectRatio }
