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
          "w-full caption-bottom text-ds-md [--table-edge:var(--card-spacing,var(--spacing-ds-04))]",
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
      "bg-[color-mix(in_srgb,var(--color-surface-raised)_50%,transparent)] font-medium [&>tr]:last:border-b-0",
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
      // raised-hover, NOT raised — tables live on cards (surface-raised), so a
      // surface-raised hover would be invisible (the 0.44-era port bug).
      "border-b border-surface-border-subtle transition-colors hover:bg-surface-raised-hover data-[state=selected]:bg-accent-3",
      className,
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn(
      // Header is quieter than the data: one step smaller, medium, muted.
      // Height tracks density via the same --table-py the body cells read.
      "py-(--table-py) px-ds-04 first:pl-(--table-edge) last:pr-(--table-edge) text-left align-middle text-ds-sm font-medium text-surface-fg-muted [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "py-(--table-py) px-ds-04 first:pl-(--table-edge) last:pr-(--table-edge) align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-ds-05 text-ds-md text-surface-fg-muted", className)}
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
}
