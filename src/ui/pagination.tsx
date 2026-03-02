import * as React from 'react'
import { Slot } from '@primitives/react-slot'
import { IconChevronLeft, IconChevronRight, IconDots } from '@tabler/icons-react'
import { cn } from './lib/utils'

const PaginationRoot = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
))
PaginationRoot.displayName = 'PaginationRoot'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-ds-02', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

export interface PaginationLinkProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  asChild?: boolean
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive = false, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'inline-flex items-center justify-center h-9 w-9 rounded-ds-md text-ds-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-interactive text-text-on-color'
            : 'hover:bg-field text-text-primary',
          className,
        )}
        {...props}
      />
    )
  },
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    className={cn('w-auto gap-ds-02 pl-2.5 pr-ds-04', className)}
    {...props}
  >
    <IconChevronLeft className="h-ico-sm w-ico-sm" />
    <span>Previous</span>
  </PaginationLink>
))
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    className={cn('w-auto gap-ds-02 pl-ds-04 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <IconChevronRight className="h-ico-sm w-ico-sm" />
  </PaginationLink>
))
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn(
      'flex h-9 w-9 items-center justify-center text-text-secondary',
      className,
    )}
    {...props}
  >
    <IconDots className="h-ico-sm w-ico-sm" />
    <span className="sr-only">More pages</span>
  </span>
))
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
