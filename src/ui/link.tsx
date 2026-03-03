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
          'text-text-link underline underline-offset-2',
          'hover:text-text-link-hover transition-colors duration-fast-01',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-ds-sm',
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
