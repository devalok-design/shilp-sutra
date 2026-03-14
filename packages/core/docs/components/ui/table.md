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

## Gotchas
- Table headers automatically have scope="col" for screen reader navigation

## Changes
### v0.18.0
- **Added** `TableProps`, `TableRowProps`, `TableCellProps` type exports

### v0.17.0
- **Fixed** TableCell: Added `px-ds-03` horizontal padding — was `px-0`, causing content to hug container edges

### v0.1.0
- **Added** Initial release
