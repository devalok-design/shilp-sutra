'use client'

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

/**
 * Props for PaginationLink — a single page number button in a pagination row.
 * When `isActive` is true, the button gets the brand interactive fill and `aria-current="page"`.
 *
 * @example
 * // Active page button:
 * <PaginationLink isActive onClick={() => goToPage(3)}>3</PaginationLink>
 *
 * @example
 * // Render as a Next.js Link via asChild:
 * <PaginationLink asChild isActive={currentPage === 5}>
 *   <Link href="/posts?page=5">5</Link>
 * </PaginationLink>
 */
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
          'inline-flex items-center justify-center h-ds-sm-plus w-ds-sm-plus rounded-ds-md text-ds-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38]',
          isActive
            ? 'bg-accent-9 text-accent-fg'
            : 'hover:bg-surface-3 text-surface-fg',
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
    className={cn('w-auto gap-ds-02 pl-ds-03 pr-ds-04', className)}
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
    className={cn('w-auto gap-ds-02 pl-ds-04 pr-ds-03', className)}
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
      'flex h-ds-sm-plus w-ds-sm-plus items-center justify-center text-surface-fg-muted',
      className,
    )}
    {...props}
  >
    <IconDots className="h-ico-sm w-ico-sm" />
    <span className="sr-only">More pages</span>
  </span>
))
PaginationEllipsis.displayName = 'PaginationEllipsis'

/* ------------------------------------------------------------------ */
/*  generatePagination helper                                         */
/* ------------------------------------------------------------------ */

type PageItem = number | 'ellipsis'

/**
 * Pure function that builds an array of page numbers and ellipsis markers.
 * Always shows first and last page, plus `siblingCount` pages around `current`.
 *
 * @example generatePagination(5, 10, 1) → [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 */
function generatePagination(
  current: number,
  total: number,
  siblingCount: number,
): PageItem[] {
  // When total pages fit without any ellipsis
  const totalSlots = siblingCount * 2 + 5 // first + last + current + 2*siblings + 2 ellipsis slots
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(current - siblingCount, 1)
  const rightSibling = Math.min(current + siblingCount, total)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    // e.g. [1, 2, 3, 4, 5, '...', 10]
    const leftCount = siblingCount * 2 + 3
    const leftPages = Array.from({ length: leftCount }, (_, i) => i + 1)
    return [...leftPages, 'ellipsis', total]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // e.g. [1, '...', 6, 7, 8, 9, 10]
    const rightCount = siblingCount * 2 + 3
    const rightPages = Array.from(
      { length: rightCount },
      (_, i) => total - rightCount + 1 + i,
    )
    return [1, 'ellipsis', ...rightPages]
  }

  // Both ellipses: [1, '...', 4, 5, 6, '...', 10]
  const middlePages = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  )
  return [1, 'ellipsis', ...middlePages, 'ellipsis', total]
}

/* ------------------------------------------------------------------ */
/*  PaginationNav — controlled convenience wrapper                    */
/* ------------------------------------------------------------------ */

/**
 * Props for PaginationNav — a fully self-contained controlled pagination component that renders
 * Previous / page numbers (with ellipsis) / Next — using `generatePagination` internally.
 *
 * **1-indexed:** `currentPage` starts at 1 (not 0). `onPageChange` also receives 1-indexed values.
 *
 * **`siblingCount`:** Number of page buttons shown on each side of the current page (default 1).
 * A wider `siblingCount` shows more page buttons before switching to ellipsis.
 *
 * @example
 * // Basic controlled pagination:
 * <PaginationNav
 *   totalPages={24}
 *   currentPage={currentPage}
 *   onPageChange={setCurrentPage}
 * />
 *
 * @example
 * // Wider sibling range for a results grid (shows more page context):
 * <PaginationNav
 *   totalPages={100}
 *   currentPage={currentPage}
 *   onPageChange={setCurrentPage}
 *   siblingCount={2}
 * />
 * // These are just a few ways — feel free to combine props creatively!
 */
export interface PaginationNavProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Total number of pages */
  totalPages: number
  /** Current active page (1-indexed) */
  currentPage: number
  /** Called when the user requests a different page */
  onPageChange: (page: number) => void
  /** Number of sibling page buttons shown on each side of the current page (default: 1) */
  siblingCount?: number
}

const PaginationNav = React.forwardRef<HTMLElement, PaginationNavProps>(
  (
    {
      totalPages,
      currentPage,
      onPageChange,
      siblingCount = 1,
      className,
      ...props
    },
    ref,
  ) => {
    const pages = generatePagination(currentPage, totalPages, siblingCount)

    return (
      <PaginationRoot ref={ref} className={className} {...props}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            />
          </PaginationItem>

          {pages.map((page, i) =>
            page === 'ellipsis' ? (
              <PaginationItem key={`e${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    )
  },
)
PaginationNav.displayName = 'PaginationNav'

export {
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationNav,
  generatePagination,
}
