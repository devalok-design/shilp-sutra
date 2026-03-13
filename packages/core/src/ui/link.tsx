'use client'

import { Slot } from '@primitives/react-slot'
import * as React from 'react'
import { cn } from './lib/utils'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  inline?: boolean
  asChild?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, inline = true, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a'

    return (
      <Comp
        ref={ref}
        className={cn(
          'text-info-9 underline underline-offset-2',
          'hover:text-info-11 transition-colors duration-fast-01',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 rounded-ds-sm',
          inline ? 'inline' : 'block',
          className,
        )}
        {...props}
      />
    )
  },
)
Link.displayName = 'Link'

export { Link }
