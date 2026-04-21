# DataTablePagination

> Internal sub-component of DataTable. Not exported to consumers.

## Usage

This component is used internally by `<DataTable>` and should not be imported directly.
See [DataTable](./data-table.md) for the public API.

## Composability
- **Internal only.** Renders the pagination footer for DataTable. Reads pagination state from DataTableContext.
- Customization goes through DataTable's `pagination` prop (server-side: pass `{ page, pageSize, total, onPageChange }`) or `pageSize` + `paginated` (client-side).

## Changes

### v0.32.0
- Extracted from DataTable monolith into focused sub-component.
