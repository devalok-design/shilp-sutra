'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@primitives/react-separator'

import { cn } from './lib/utils'

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Visual variant:
   * - `default` — solid line
   * - `gradient` — fades at both edges
   * - `gradient-left` — fades on the left, solid on the right
   * - `gradient-right` — fades on the right, solid on the left
   */
  variant?: 'default' | 'gradient' | 'gradient-left' | 'gradient-right'
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = 'horizontal', decorative = true, variant = 'default', ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0',
        variant === 'gradient'
          ? 'bg-transparent bg-[image:linear-gradient(90deg,transparent,var(--color-surface-border)_15%,var(--color-surface-border)_85%,transparent)]'
          : variant === 'gradient-left'
            ? 'bg-transparent bg-[image:linear-gradient(90deg,transparent,var(--color-surface-border)_30%)]'
            : variant === 'gradient-right'
              ? 'bg-transparent bg-[image:linear-gradient(90deg,var(--color-surface-border)_70%,transparent)]'
              : 'bg-surface-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  ),
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
