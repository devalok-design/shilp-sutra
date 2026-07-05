'use client'

import * as React from 'react'

import { useLink } from './lib/link-context'
import { cn } from './lib/utils'

export interface TableRowLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  /**
   * Stretch the click target across the whole row via a pseudo-element
   * (a real `<a>`, so cmd/ctrl+click, middle-click, and "open in new tab"
   * all work). Trade-off: the overlay blocks text selection inside the row —
   * pass `stretch={false}` for a title-only link (GitHub-style) when row text
   * must stay selectable.
   * @default true
   */
  stretch?: boolean
}

/**
 * A real-anchor row link for tables — place inside the row's primary
 * `<TableCell className="relative">`. Replaces `onClick`-on-row navigation,
 * which breaks cmd+click / middle-click / context-menu and isn't announced as
 * a link by screen readers (never put onClick on a `<tr>`).
 *
 * Mechanics: the stretch pseudo-element is anchored to the CELL, not the row —
 * Safari ignores `position: relative` on `<tr>` — and spans `100vw`; the Table
 * root clips it (`overflow-x-clip`). Keyboard focus draws a row-level ring via
 * TableRow's `has-[[data-slot=row-link]:focus-visible]` rule, so the anchor
 * suppresses its own outline.
 *
 * Other interactive elements in the row (menu buttons, checkboxes) must sit
 * above the stretch: give them `className="relative z-[1]"` (IconButton etc.).
 *
 * @example
 * <TableRow>
 *   <TableCell className="relative">
 *     <TableRowLink href={`/projects/${id}`}>{name}</TableRowLink>
 *   </TableCell>
 *   <TableCell><Badge color="success">Active</Badge></TableCell>
 *   <TableCell>
 *     <TableRowActions>
 *       <IconButton className="relative z-[1]" size="xs" variant="ghost" aria-label={`Actions for ${name}`} icon={<IconDots />} />
 *     </TableRowActions>
 *   </TableCell>
 * </TableRow>
 */
const TableRowLink = React.forwardRef<HTMLAnchorElement, TableRowLinkProps>(
  ({ className, stretch = true, children, ...props }, ref) => {
    const Link = useLink()
    return (
      <Link
        ref={ref}
        data-slot="row-link"
        className={cn(
          'font-medium text-surface-fg no-underline',
          stretch
            ? // row ring comes from TableRow's has-[] rule; suppress the anchor's own
              'focus-visible:outline-hidden after:absolute after:inset-y-0 after:left-0 after:w-[100vw] after:content-[""]'
            : 'rounded-control-inner hover:underline focus-visible:outline-2 focus-visible:outline-accent-9 focus-visible:outline-offset-2',
          className,
        )}
        {...props}
      >
        {children}
      </Link>
    )
  },
)
TableRowLink.displayName = 'TableRowLink'

export { TableRowLink }
