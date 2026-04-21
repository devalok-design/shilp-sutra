# DataTableHeader

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Composability
- **Internal only.** Renders the thead + column headers for DataTable. Reads sort state + column definitions from DataTableContext.
- Customization goes through DataTable's `columns` prop (column definitions are TanStack ColumnDef<TData> — header, sortable, filter, etc. all declared there).

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
