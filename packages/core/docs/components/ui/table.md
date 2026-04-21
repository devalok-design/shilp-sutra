# Table

- Import: @devalok/shilp-sutra/ui/table
- Server-safe: Yes
- Category: ui

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

## Changes
### v0.18.0
- **Added** `TableProps`, `TableRowProps`, `TableCellProps` type exports

### v0.17.0
- **Fixed** TableCell: Added `px-ds-03` horizontal padding — was `px-0`, causing content to hug container edges

### v0.1.0
- **Added** Initial release
