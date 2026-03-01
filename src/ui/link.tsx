import { Slot } from '@radix-ui/react-slot'
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
          'text-[var(--color-text-link)] underline underline-offset-2',
          'hover:text-[var(--color-text-link-hover)] transition-colors duration-[var(--duration-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] rounded-[var(--radius-sm)]',
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
