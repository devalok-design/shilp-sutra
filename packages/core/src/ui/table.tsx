// @server-safe
import * as React from "react"

import { cn } from "./lib/utils"

/** Row density — sets --table-py, which header and body cells both read. */
type TableDensity = 'compact' | 'standard' | 'comfortable'

// One variable pair drives the table's spacing (same pattern as Card):
// --table-py    vertical cell padding per density (4 / 8 / 12px → rows ≈ 29 / 37 / 45px)
// --table-edge  first/last-cell inline padding — inherits --card-spacing when the table
//               sits inside a Card, so edge columns align with the card's slots;
//               falls back to ds-04 (12px) standalone.
const densityClasses: Record<TableDensity, string> = {
  compact: '[--table-py:var(--spacing-ds-02)]',
  standard: '[--table-py:var(--spacing-ds-03)]',
  comfortable: '[--table-py:var(--spacing-ds-04)]',
}

export interface TableCellBaseProps {
  /**
   * Quantitative column: right-aligns and uses tabular figures so digits line up.
   * Keep decimal places consistent per column; identifier-numbers (dates, phones,
   * IDs) stay left-aligned — they're names, not quantities.
   */
  numeric?: boolean
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Row density — vertical cell padding for header + body. @default 'standard' */
  density?: TableDensity
  /**
   * Zebra striping (even body rows get the faintest surface step). Opt-in only —
   * for very wide/dense tables; hairline separators are the default row cue.
   */
  striped?: boolean
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, density = 'standard', striped, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          // overflow-x-clip contains TableRowLink's 100vw stretch pseudo-element
          // without creating a horizontal scrollbar (the wrapper owns scrolling).
          "w-full caption-bottom text-body-md overflow-x-clip [--table-edge:var(--card-spacing,var(--spacing-ds-04))]",
          densityClasses[density],
          striped && "[&_tbody_tr:nth-child(even)]:bg-surface-base",
          className,
        )}
        {...props}
      />
    </div>
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-surface-border-subtle", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      // surface-base band, not raised@50% — the footer must read against the
      // card surface the table lives on (same mis-mapped shadcn muted/50 family
      // as the row-hover bug).
      "border-t border-surface-border-subtle bg-surface-base font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      // panel-hover, NOT panel — tables live on cards (surface-panel), so a
      // surface-panel hover would be invisible (the 0.44-era port bug).
      // selected+hover gets its own explicit step — without it the hover and
      // selected classes tie on specificity and stylesheet order decides.
      // `group/row` lets TableRowActions reveal on row hover/focus; the has-[]
      // rule draws a row-level focus ring when a TableRowLink inside is
      // keyboard-focused (the anchor itself suppresses its own ring).
      "group/row border-b border-surface-border-subtle transition-colors hover:bg-surface-panel-hover data-[state=selected]:bg-accent-3 data-[state=selected]:hover:bg-accent-4 data-[state=selected]:forced-colors:outline data-[state=selected]:forced-colors:outline-1",
      "has-[[data-slot=row-link]:focus-visible]:outline-2 has-[[data-slot=row-link]:focus-visible]:outline-accent-9 has-[[data-slot=row-link]:focus-visible]:-outline-offset-2",
      className,
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & TableCellBaseProps
>(({ className, numeric, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      // Header is quieter than the data: one step smaller, medium, muted.
      // Height tracks density via the same --table-py the body cells read.
      "py-(--table-py) px-ds-04 first:pl-(--table-edge) last:pr-(--table-edge) text-left align-middle text-body-sm font-medium text-surface-fg-muted [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      numeric && "text-right",
      className,
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & TableCellBaseProps
>(({ className, numeric, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "py-(--table-py) px-ds-04 first:pl-(--table-edge) last:pr-(--table-edge) align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      numeric && "text-right tabular-nums",
      className,
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export interface TableRowActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Always show the actions instead of revealing on row hover/focus. Use for
   * tables where actions must be permanently discoverable (the GitLab stance),
   * or when the row has few columns and the density win doesn't matter.
   */
  persist?: boolean
}

/**
 * Right-aligned action cluster for a table row, revealed on row hover — and,
 * critically, on keyboard focus: the buttons stay in the tab order permanently
 * (opacity reveal, never display:none) and appear the moment focus enters the
 * row (WCAG 1.4.13). On touch devices (no hover) they are always visible.
 *
 * Give the actions column a visually-hidden header: `<TableHead><span className="sr-only">Actions</span></TableHead>`.
 *
 * @example
 * <TableCell>
 *   <TableRowActions>
 *     <IconButton size="xs" variant="ghost" aria-label={`Download ${name}`} icon={<IconDownload />} />
 *     <IconButton size="xs" variant="ghost" aria-label={`Delete ${name}`} icon={<IconTrash />} />
 *   </TableRowActions>
 * </TableCell>
 */
const TableRowActions = React.forwardRef<HTMLDivElement, TableRowActionsProps>(
  ({ className, persist, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-ds-01 transition-opacity duration-fast-01 ease-productive-standard",
        persist
          ? "opacity-100"
          : "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 pointer-coarse:opacity-100",
        className,
      )}
      {...props}
    />
  ),
)
TableRowActions.displayName = "TableRowActions"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-ds-05 text-body-md text-surface-fg-muted", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>
export type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>
export type { TableDensity }

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableRowActions,
}
