# Table

- Import: @devalok/shilp-sutra/ui/table
- Server-safe: Yes
- Category: ui

## Props
    density: "compact" | "standard" (default) | "comfortable" — sets --table-py (4 / 8 / 12px vertical cell padding → rows ≈ 29 / 37 / 45px); header height tracks it
    striped: boolean (opt-in zebra — even body rows get the faintest surface step; hairline separators remain the default row cue)

## Compound Components
    Table (root <table>)
      TableHeader (<thead>)
        TableRow (<tr>)
          TableHead (<th>)
      TableBody (<tbody>)
        TableRow (<tr>)
          TableCell (<td>)
      TableFooter (<tfoot>)
      TableCaption (<caption>)

## Example
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Project Alpha</TableCell>
      <TableCell><Badge color="success">Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Composability
- **Server-safe pure HTML wrappers** — Table and sub-components are thin semantic wrappers around `<table>`, `<thead>`, `<tbody>`, etc. No state, no context. Safe in RSC trees.
- **Table vs DataTable:** Table is presentational — you control every row, cell, header. DataTable (from `ui/data-table`) is feature-rich — sorting, filtering, pagination, selection, virtualization built in. Pick by whether you need that machinery.
- **Use cases for bare Table:** Static data displays, marketing comparison tables, documentation tables, small lists where DataTable would be overkill.
- **Composes with UI primitives inside cells:** Badge for status pills, Avatar for user cells, IconButton for row actions, StatusDot for state indicators. All server-safe if the table is server-rendered.
- **TableCaption** renders as HTML `<caption>` — useful for a summary description that screen readers announce before the table content.

## Gotchas
- Table headers automatically have scope="col" for screen reader navigation
- For anything beyond trivial display, prefer DataTable — don't rebuild sorting/pagination/selection on top of bare Table
- Inside a Card, first/last cells inherit `--card-spacing` so edge columns align with the card's slots; standalone tables fall back to 12px edges
- Numeric columns: add `text-right tabular-nums` (DataTable does this via column meta `align: 'right'`)

## Changes
### v0.45.0
- **Added** `density` prop (`compact | standard | comfortable`) via `--table-py`; header height tracks density instead of a fixed 40px
- **Added** `striped` prop — opt-in zebra
- **Changed** Rows regain their hairline separator (`border-b border-surface-border-subtle` — lost in the original port) and hover becomes visible on cards (`hover:bg-surface-raised-hover`, was the invisible `surface-raised`)
- **Changed** Cells: `px-ds-04` interior, first/last cells read `--table-edge` (= `--card-spacing` inside a Card); header drops to `text-ds-sm` muted
- **Changed** Default vertical rhythm tightens: standard rows ~53px → ~37px

### v0.18.0
- **Added** `TableProps`, `TableRowProps`, `TableCellProps` type exports

### v0.17.0
- **Fixed** TableCell: Added `px-ds-03` horizontal padding — was `px-0`, causing content to hug container edges

### v0.1.0
- **Added** Initial release
