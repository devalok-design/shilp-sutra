import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
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
    className={cn('flex flex-row items-center gap-1', className)}
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
          'inline-flex items-center justify-center h-9 w-9 rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-[var(--color-interactive)] text-[var(--color-text-on-color)]'
            : 'hover:bg-[var(--color-field)] text-[var(--color-text-primary)]',
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
    className={cn('w-auto gap-1 pl-2.5 pr-3', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
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
    className={cn('w-auto gap-1 pl-3 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
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
      'flex h-9 w-9 items-center justify-center text-[var(--color-text-secondary)]',
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
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
