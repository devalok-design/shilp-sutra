'use client'

import * as SeparatorPrimitive from '@primitives/react-separator'
import * as React from 'react'

import { cn } from './lib/utils'

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /**
   * @deprecated Separator is always a solid hairline. The `gradient` /
   * `gradient-left` / `gradient-right` variants were decorative (and never
   * rendered in production — the interpolated class couldn't be emitted by the
   * Tailwind 4 scanner). They now render solid; the `variant` prop is removed in
   * 0.45.0.
   */
  variant?: 'default' | 'gradient' | 'gradient-left' | 'gradient-right'
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    // `variant` accepted for back-compat but no longer rendered (see @deprecated above).
    { className, orientation = 'horizontal', decorative = true, variant: _variant, ...props },
    ref,
  ) => {
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          'shrink-0 bg-surface-border',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
          className,
        )}
        {...props}
      />
    )
  },
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
